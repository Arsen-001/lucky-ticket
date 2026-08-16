import { describe, it, expect } from 'vitest';
import { appConfig } from '@/config/app.config';
import type { InventoryBooster, InventoryChip } from '@/types/interfaces/inventory.interfaces';
import type { TicketEngine } from '@/types/interfaces/ticket.interfaces';
import type { TicketType } from '@/types/types/ticket.types';
import { effectiveCycleSeconds, engineCapacity } from '@/utils/global/ticket-engine.utils';
import {
  CHIP_MAX_LEVEL,
  chipCapacityTickets,
  chipLevelUpShards,
  chipSpeedPct,
} from '@/utils/global/inventory.utils';

/**
 * Every lever on an engine must MOVE something.
 *
 * An engine has ten of them — three paid ladders (engine level, speed
 * sub-level, capacity sub-level), two chips, two boosters, the premium status,
 * the Test-Quest badge and the equipped avatar — and each one is sold, earned
 * or subscribed to on the promise that it makes the engine better. This file
 * asserts that promise directly, per lever, at every stage of a real engine's
 * life, on every tier.
 *
 * It exists because that promise was silently broken: `effectiveCycleSeconds`
 * clamped the boosted cycle up to `capacity × 900s`, and since the capacity
 * ladder lifts that clamp faster than the boosts shorten the cycle, ANY engine
 * past level 1 sat on the clamp — where a speed chip, a booster and a VIP
 * subscription all changed the number by exactly zero. Measured before the fix:
 * bronze L2 and diamond L5 both minted 4 tickets/hour no matter what was
 * equipped.
 *
 * The two metrics, and why both are needed:
 *   • tickets per hour — what a SPEED lever must raise (cycle alone lies: a
 *     capacity lever legitimately lengthens the cycle while minting more).
 *   • batch per cycle — what a CAPACITY lever must raise.
 * No lever may lower either one.
 */

const TIERS: TicketType[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];

const engineOf = (tier: TicketType, over: Partial<TicketEngine> = {}): TicketEngine =>
  ({
    id: 'lever-probe',
    cycleSeconds: appConfig.engines.baseCycleSecondsByTier[tier],
    cycleStartedAt: new Date(0).toISOString(),
    engineLevel: 1,
    speedLevel: 0,
    capacityLevel: 0,
    ...over,
  }) as TicketEngine;

type BoostOptions = NonNullable<Parameters<typeof effectiveCycleSeconds>[1]>;

// A chip is its LEVEL: every helper derives the effect from it, and the
// `effectPct` on the payload is a display cache the math never reads.
const chip = (type: 'speed' | 'capacity', level: number): InventoryChip => ({
  id: `chip-${type}`,
  type,
  quality: 'gold',
  level,
  effectPct: type === 'speed' ? chipSpeedPct(level) : chipCapacityTickets(level),
  shardsForNextLevel: chipLevelUpShards(level),
  lifetime: 'permanent',
  source: 'tournament',
});

const booster = (type: 'speed' | 'capacity', effectPct: number): InventoryBooster => ({
  id: `booster-${type}`,
  type,
  quality: 'gold',
  durationHours: 24,
  effectPct,
  source: 'market',
  expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
});

/**
 * "Did not cost throughput", with room for float noise: promotion is designed to
 * be rate-neutral (the engine level's step replaces the speed sub-ladder it
 * resets), so the two sides land on the same number ± the last binary digit.
 */
const notWorseThan = (after: number, before: number) =>
  expect(after).toBeGreaterThanOrEqual(before * (1 - 1e-9));

/** The two numbers a player actually feels. */
const measure = (engine: TicketEngine, options: BoostOptions = {}) => {
  const batch = engineCapacity(engine, options);
  const cycle = effectiveCycleSeconds(engine, options);
  return { batch, cycle, perHour: (batch / cycle) * 3600 };
};

/**
 * Life stages of one engine — a fresh purchase, a fully paid-up level 1, the
 * first promotion, mid-game and the design's full-max target. The bug lived
 * everywhere except the first row, so a probe that only tests a fresh engine
 * would have passed throughout.
 */
const STAGES: { name: string; engine: Partial<TicketEngine> }[] = [
  { name: 'fresh (L1 0/0)', engine: { engineLevel: 1, speedLevel: 0, capacityLevel: 0 } },
  { name: 'L1 maxed (10/10)', engine: { engineLevel: 1, speedLevel: 10, capacityLevel: 10 } },
  { name: 'L2 fresh', engine: { engineLevel: 2, speedLevel: 0, capacityLevel: 0 } },
  { name: 'L3 mid (5/5)', engine: { engineLevel: 3, speedLevel: 5, capacityLevel: 5 } },
  { name: 'L5 full max (10/10)', engine: { engineLevel: 5, speedLevel: 10, capacityLevel: 10 } },
];

/**
 * Levers that must make the engine FASTER — more tickets per hour. Each is
 * expressed as the delta a player buys: equip this chip, subscribe to VIP,
 * activate that booster.
 */
const SPEED_LEVERS: { name: string; apply: (o: BoostOptions) => BoostOptions }[] = [
  { name: 'speed chip lvl 5 (×1.5)', apply: o => ({ ...o, speedChip: chip('speed', 5) }) },
  { name: 'speed booster (+25%)', apply: o => ({ ...o, speedBooster: booster('speed', 25) }) },
  {
    name: 'VIP 20 (+20% perk)',
    apply: o => ({ ...o, isVip: true, perks: { engineSpeedBoostPct: 20 } }),
  },
  {
    name: 'VIP 1 (+1% perk)',
    apply: o => ({ ...o, isVip: true, perks: { engineSpeedBoostPct: 1 } }),
  },
  {
    name: 'Lucky Player (+10% perk)',
    apply: o => ({ ...o, isLuckyPlayer: true, perks: { engineSpeedBoostPct: 10 } }),
  },
  { name: 'test badge (+5%)', apply: o => ({ ...o, badgeBoostPct: 5 }) },
  { name: 'avatar (+8%)', apply: o => ({ ...o, avatarBoostPct: 8 }) },
];

/** Equipment that must make the collect bigger (and the wait longer with it). */
const CAPACITY_LEVERS: { name: string; apply: (o: BoostOptions) => BoostOptions }[] = [
  {
    name: 'capacity chip lvl 5 (+25 tickets)',
    apply: o => ({ ...o, capacityChip: chip('capacity', 5) }),
  },
  {
    name: 'capacity booster (+25%)',
    apply: o => ({ ...o, capacityBooster: booster('capacity', 25) }),
  },
];

describe('engine levers — every upgrade must move the engine', () => {
  describe.each(TIERS)('%s', tier => {
    describe.each(STAGES)('$name', stage => {
      const engine = engineOf(tier, stage.engine);
      const before = measure(engine);

      it.each(SPEED_LEVERS)('$name mints more tickets per hour', lever => {
        const after = measure(engine, lever.apply({}));
        // Speed is the only side that moves the rate, and it always does.
        expect(
          after.perHour,
          `${tier} ${stage.name}: ${before.perHour.toFixed(2)}/h unchanged by ${lever.name}`
        ).toBeGreaterThan(before.perHour);
        // A speed lever may never lengthen the wait for the same batch.
        expect(after.cycle / after.batch).toBeLessThan(before.cycle / before.batch);
      });

      it.each(CAPACITY_LEVERS)('$name makes the collect bigger', lever => {
        const after = measure(engine, lever.apply({}));
        expect(
          after.batch,
          `${tier} ${stage.name}: batch ${before.batch} unchanged by ${lever.name}`
        ).toBeGreaterThan(before.batch);
        // Capacity buys the SIZE of a collect, not the rate: one ticket costs
        // one tier cycle, so a bigger batch waits proportionally longer and
        // tickets-per-hour is untouched. Speed is what moves the rate.
        expect(after.cycle).toBeGreaterThan(before.cycle);
        notWorseThan(after.perHour, before.perHour);
      });
    });

    it('every paid speed sub-level is felt (0 → 10, one tap at a time)', () => {
      for (let level = 1; level <= 10; level += 1) {
        const before = measure(engineOf(tier, { speedLevel: level - 1 }));
        const after = measure(engineOf(tier, { speedLevel: level }));
        expect(after.perHour, `speed level ${level - 1} → ${level} on ${tier}`).toBeGreaterThan(
          before.perHour
        );
      }
    });

    it('every paid capacity sub-level is felt (0 → 10, one tap at a time)', () => {
      for (let level = 1; level <= 10; level += 1) {
        const before = measure(engineOf(tier, { capacityLevel: level - 1 }));
        const after = measure(engineOf(tier, { capacityLevel: level }));
        // Exactly +1 ticket per tap, and exactly one more tier cycle of wait.
        expect(after.batch, `capacity level ${level - 1} → ${level} on ${tier}`).toBe(
          before.batch + 1
        );
        expect(after.cycle).toBeGreaterThan(before.cycle);
        notWorseThan(after.perHour, before.perHour);
      }
    });

    it('promotion is seamless — same batch, same cycle, same rate', () => {
      for (let level = 2; level <= 5; level += 1) {
        // The level's own step replaces exactly what the reset sub-ladders were
        // giving (+10 capacity, +20% speed), so the engine mints the same batch
        // on the same cycle the instant it promotes. It pays in headroom, not in
        // an instant jump — that is asserted separately below.
        const before = measure(
          engineOf(tier, { engineLevel: level - 1, speedLevel: 10, capacityLevel: 10 })
        );
        const after = measure(engineOf(tier, { engineLevel: level }));
        expect(after.batch, `promotion ${level - 1} → ${level} on ${tier}`).toBe(before.batch);
        expect(after.cycle).toBeCloseTo(before.cycle, 6);
        notWorseThan(after.perHour, before.perHour);
      }
    });

    it('each engine level raises the ceiling the engine can be taken to', () => {
      for (let level = 2; level <= 5; level += 1) {
        const prev = measure(
          engineOf(tier, { engineLevel: level - 1, speedLevel: 10, capacityLevel: 10 })
        );
        const next = measure(
          engineOf(tier, { engineLevel: level, speedLevel: 10, capacityLevel: 10 })
        );
        expect(next.batch, `ceiling ${level - 1} → ${level} on ${tier}`).toBeGreaterThan(
          prev.batch
        );
        expect(next.perHour).toBeGreaterThan(prev.perHour);
      }
    });

    it('the whole stack beats every single lever on its own', () => {
      const engine = engineOf(tier, { engineLevel: 3, speedLevel: 5, capacityLevel: 5 });
      const everything: BoostOptions = {
        speedChip: chip('speed', 5),
        speedBooster: booster('speed', 25),
        capacityChip: chip('capacity', 5),
        capacityBooster: booster('capacity', 25),
        isVip: true,
        perks: { engineSpeedBoostPct: 20 },
        badgeBoostPct: 5,
        avatarBoostPct: 8,
      };
      const stacked = measure(engine, everything);
      for (const lever of [...SPEED_LEVERS, ...CAPACITY_LEVERS]) {
        const single = measure(engine, lever.apply({}));
        expect(stacked.perHour, `stack vs ${lever.name} on ${tier}`).toBeGreaterThanOrEqual(
          single.perHour
        );
        expect(stacked.batch, `stack vs ${lever.name} on ${tier}`).toBeGreaterThanOrEqual(
          single.batch
        );
      }
    });
  });

  describe('chips — "a finished chip is half an engine"', () => {
    it('a finished capacity chip adds exactly +51 tickets on any engine', () => {
      for (const tier of TIERS) {
        for (const stage of STAGES) {
          const engine = engineOf(tier, stage.engine);
          const bare = engineCapacity(engine);
          expect(
            engineCapacity(engine, { capacityChip: chip('capacity', CHIP_MAX_LEVEL) }),
            `${tier} ${stage.name}`
          ).toBe(bare + 51);
        }
      }
      // …and every level is felt: +5 a level, the tenth +6.
      const fresh = engineOf('bronze');
      for (let level = 1; level <= CHIP_MAX_LEVEL; level += 1) {
        expect(engineCapacity(fresh, { capacityChip: chip('capacity', level) })).toBe(
          1 + chipCapacityTickets(level)
        );
        expect(chipCapacityTickets(level) - chipCapacityTickets(level - 1)).toBe(
          level === CHIP_MAX_LEVEL ? 6 : 5
        );
      }
    });

    it('a finished speed chip halves the cycle — the same ×2 on a fresh and a maxed engine', () => {
      for (const tier of TIERS) {
        for (const stage of STAGES) {
          const engine = engineOf(tier, stage.engine);
          const bare = effectiveCycleSeconds(engine);
          expect(
            effectiveCycleSeconds(engine, { speedChip: chip('speed', CHIP_MAX_LEVEL) }),
            `${tier} ${stage.name}`
          ).toBeCloseTo(bare / 2, 6);
        }
      }
      // A summand into the stack could never do that: on the maxed Bronze
      // (+750%) a +100% summand is worth ×1.12, not ×2. Pin the multiplier.
      const maxed = engineOf('bronze', { engineLevel: 5, speedLevel: 10, capacityLevel: 10 });
      expect(effectiveCycleSeconds(maxed)).toBe(24 * 3600);
      expect(effectiveCycleSeconds(maxed, { speedChip: chip('speed', CHIP_MAX_LEVEL) })).toBe(
        12 * 3600
      );
    });

    it('costs exactly 200 shards mint-to-max, in a rising ladder', () => {
      // Mint 20, then 12 · 14 · … · 28 — and nothing past the top.
      let total = 20;
      for (let level = 1; level < CHIP_MAX_LEVEL; level += 1) {
        expect(chipLevelUpShards(level)).toBe(10 + 2 * level);
        total += chipLevelUpShards(level);
      }
      expect(total).toBe(200);
      expect(chipLevelUpShards(CHIP_MAX_LEVEL)).toBe(0);
    });
  });

  it('tier still costs time on a small batch', () => {
    // Not a lever, but the same family: the tier ladder (2/4/8/16/32h) is what
    // makes a diamond ticket slower to mint than a bronze one.
    const rates = TIERS.map(tier => measure(engineOf(tier)).perHour);
    for (let i = 1; i < rates.length; i += 1) {
      expect(rates[i], `${TIERS[i]} vs ${TIERS[i - 1]}`).toBeLessThan(rates[i - 1]);
    }
  });

  it('tier keeps costing time at every stage of the ladder', () => {
    // It did not always. While the cycle was normalised per ticket, a big
    // enough batch swallowed the tier cycle whole and bronze L3 minted at
    // exactly the same rate as gold L3 — the tier ladder (6/8/10/12/16h)
    // stopped existing above the first engine level. Now the cycle IS the tier,
    // so the ordering holds on a fresh engine and on a maxed one alike.
    for (const build of [
      { engineLevel: 1, speedLevel: 0, capacityLevel: 0 },
      { engineLevel: 3, speedLevel: 5, capacityLevel: 5 },
      { engineLevel: 5, speedLevel: 10, capacityLevel: 10 },
    ]) {
      const rates = TIERS.map(tier => measure(engineOf(tier, build)).perHour);
      for (let i = 1; i < rates.length; i += 1) {
        expect(rates[i], `${TIERS[i]} vs ${TIERS[i - 1]} at L${build.engineLevel}`).toBeLessThan(
          rates[i - 1]
        );
      }
    }
  });
});
