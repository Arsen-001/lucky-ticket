import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { appConfig } from '@/config/app.config';
import {
  GlobalConstants,
  activityTierOrder,
  computeActivityTier,
} from '@/constants/global.constants';
import {
  engineDailyLcValue,
  engineMarketPriceLc,
  enginePaybackDays,
  lcPriceToLsParity,
} from '@/utils/global/economy.utils';
import {
  baseCapacity,
  effectiveCycleSeconds,
  engineCapacity,
  engineLevelBoostPct,
  promoteEngineIfMaxed,
  speedLevelBoostPct,
  ENGINE_FULL_LEVEL_BONUS_TICKETS_TABLE,
  ENGINE_FULL_LEVEL_SPEED_BONUS_PCT_TABLE,
  MAX_BOOST_LEVEL,
  MAX_ENGINE_LEVEL,
} from '@/utils/global/ticket-engine.utils';
import { engineNextPurchasePrices } from '@/utils/global/market.utils';
import { equippedAvatarEngineSpeedPct } from '@/utils/global/avatar.utils';
import { marketMock } from '@/mock/market.mock';
import { avatarsMock } from '@/mock/avatars.mock';
import type { UserAvatar } from '@/types/interfaces/avatars.interfaces';
import { MarketPriceType } from '@/types/enums/market.enums';
import type { TicketEngine } from '@/types/interfaces/ticket.interfaces';
import type { TicketType } from '@/types/types/ticket.types';

const TIERS: TicketType[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];

/**
 * Activity Points sitting in the one-time task catalog.
 *
 * Read from the backend's `milestones.data.ts`, which is the source of truth
 * (`seedCatalog` overwrites the database from it on every boot), and skipped
 * when the backend is not checked out beside this repo — the same arrangement
 * `enum-parity` uses.
 *
 * Two traps, both of which have produced wrong catalog totals before:
 *
 *  - the reward type is `TICKETS`/`ACTIVITY_POINTS`, and a task can list
 *    several rewards, so every match in a block has to be summed rather than
 *    the first one taken;
 *  - **disabled tasks live inside `/* … *\/`** and a naive scan counts them as
 *    live. Comments are stripped first.
 */
const oneTimeCatalogAp = (): number | null => {
  const path = resolve(process.cwd(), '../lucky-ticket-backend/src/tasks/milestones.data.ts');
  if (!existsSync(path)) return null;

  const src = readFileSync(path, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const starts = [...src.matchAll(/^\s{4}id: '([^']+)',/gm)];

  let total = 0;
  for (let i = 0; i < starts.length; i++) {
    const block = src.slice(starts[i].index, starts[i + 1]?.index ?? src.length);
    if (!/frequency: 'ONCE'/.test(block)) continue;
    for (const m of block.matchAll(/'ACTIVITY_POINTS',\s*amount:\s*(\d+)/g)) total += Number(m[1]);
  }
  return total;
};

/**
 * Economy guardrail simulation (DOCS §14.2).
 *
 * Models a perfectly-played FREE account over a year: the welcome-pack Bronze
 * engine mints tickets at perfect claims, every ticket is converted to LC at
 * its tournament EV, and all LC is greedily reinvested into whichever
 * AP-unlocked engine pays back fastest. Tasks/ads/stake yield are excluded —
 * the result is a conservative floor of the pure engine→tournament loop, the
 * loop that must never become a money printer.
 */
interface SimKnobs {
  /** LC price of the first engine per tier. */
  basePriceByTier: Record<TicketType, number>;
  /** Geometric repeat-purchase growth (1 = flat legacy pricing). */
  repeatGrowth: number;
  /** LC value one engine mints per day at perfect claims. */
  dailyValueByTier: Record<TicketType, number>;
}

const priceOf = (knobs: SimKnobs, tier: TicketType, owned: number): number =>
  Math.round(knobs.basePriceByTier[tier] * Math.pow(knobs.repeatGrowth, owned));

interface SimResult {
  /** Daily LC production value at the end of each simulated day (1-indexed). */
  productionByDay: number[];
  ownedByTier: Record<TicketType, number>;
}

/**
 * @param startingAp Activity Points the player already holds on day 1.
 *
 * Zero is the slow end of the AP gate: nothing but the daily baseline, which is
 * what this sim assumed for its whole life. The fast end is the entire one-time
 * task catalog banked up front. A real player is somewhere between — they work
 * through the catalog while the days pass — and because more AP earlier can only
 * open tier gates sooner, and sooner gates can only mean more production, the
 * two ends bracket every real path. Running both is how the inflation bound
 * gets tested against the world the player actually lives in rather than a
 * slower one invented by leaving tasks out.
 */
const simulateGreedyYear = (knobs: SimKnobs, days = 365, startingAp = 0): SimResult => {
  let lc = 0;
  let ap = startingAp;
  // Welcome pack: every account starts with one Bronze engine (DOCS §9.2).
  const owned: Record<TicketType, number> = {
    bronze: 1,
    silver: 0,
    gold: 0,
    platinum: 0,
    diamond: 0,
  };
  const production = () =>
    TIERS.reduce((sum, tier) => sum + owned[tier] * knobs.dailyValueByTier[tier], 0);

  const productionByDay: number[] = [];
  for (let day = 1; day <= days; day++) {
    lc += production();
    // Free-play AP pace: the per-tier daily baseline (DOCS §5.4) gates when
    // higher-tier engines become buyable at all (AP tier gate, DOCS §14.1).
    // The sim models the AP half of the gate only — assume the player has
    // invited enough friends to satisfy every referral requirement.
    const AMPLE_REFERRALS = 1_000;
    ap += GlobalConstants.dailyBaselineApByTier[computeActivityTier(ap, AMPLE_REFERRALS)];
    const unlockedIdx = activityTierOrder.indexOf(computeActivityTier(ap, AMPLE_REFERRALS));

    // Greedy reinvestment: buy the fastest-payback affordable engine, as long
    // as it still pays itself back within the sim horizon.
    for (;;) {
      let best: { tier: TicketType; price: number; payback: number } | null = null;
      for (let i = 0; i <= unlockedIdx && i < TIERS.length; i++) {
        const tier = TIERS[i];
        const price = priceOf(knobs, tier, owned[tier]);
        const payback = price / knobs.dailyValueByTier[tier];
        if (payback > days - day) continue;
        if (!best || payback < best.payback) best = { tier, price, payback };
      }
      if (!best || lc < best.price) break;
      // Flat legacy pricing never changes the price, so buy the whole batch at
      // once — one-at-a-time would loop forever once production explodes.
      const count = knobs.repeatGrowth === 1 ? Math.floor(lc / best.price) : 1;
      lc -= best.price * count;
      owned[best.tier] += count;
    }
    productionByDay.push(production());
  }
  return { productionByDay, ownedByTier: owned };
};

/** Knobs as currently configured — what the app actually ships. */
const configuredKnobs = (): SimKnobs => ({
  basePriceByTier: appConfig.economy.engineBasePriceLcByTier,
  repeatGrowth: appConfig.economy.engineRepeatPriceGrowth,
  dailyValueByTier: Object.fromEntries(
    TIERS.map(tier => [tier, engineDailyLcValue(tier)])
  ) as Record<TicketType, number>,
});

/**
 * The pre-rebalance economy: flat engine prices (no repeat growth) at the old
 * mock ladder. Kept as a pinned counter-example — it must keep FAILING the
 * inflation bound, documenting why `engineRepeatPriceGrowth` exists.
 */
/**
 * The same shipped prices, but with the repeat-purchase growth switched OFF —
 * which is what "flat pricing" means and what this file exists to disprove.
 *
 * The prices used to be hard-coded historical literals (800k … 20M). That made
 * the test a hostage of unrelated tuning: when engine cycles and prices were
 * re-fitted on 16.08.2026 the frozen literals stopped matching the shipped
 * daily value, the simulated player could no longer afford the second engine,
 * and the runaway this test is supposed to demonstrate quietly stopped
 * happening — the test failed while nothing was wrong with the guard it
 * protects. Reading the live prices keeps the comparison honest: same prices,
 * one knob different.
 */
const legacyFlatKnobs = (): SimKnobs => ({
  ...configuredKnobs(),
  repeatGrowth: 1,
});

const baseEngine = (over: Partial<TicketEngine>): TicketEngine =>
  ({
    id: 'sim',
    cycleSeconds: appConfig.engines.baseCycleSecondsByTier.bronze,
    cycleStartedAt: new Date(0).toISOString(),
    engineLevel: 1,
    speedLevel: 0,
    capacityLevel: 0,
    ...over,
  }) as TicketEngine;

describe('economy simulation (DOCS §14.2 guardrails)', () => {
  it('early game hooks: the first Bronze engine pays back within a week', () => {
    expect(enginePaybackDays('bronze', 0)).toBeGreaterThanOrEqual(3);
    expect(enginePaybackDays('bronze', 0)).toBeLessThanOrEqual(7);
  });

  it('tier ladder is monotone: each tier’s first engine pays back slower, all within 3–30 days', () => {
    const paybacks = TIERS.map(tier => enginePaybackDays(tier, 0));
    for (let i = 0; i < paybacks.length; i++) {
      expect(paybacks[i], `${TIERS[i]} payback`).toBeGreaterThanOrEqual(3);
      expect(paybacks[i], `${TIERS[i]} payback`).toBeLessThanOrEqual(30);
      if (i > 0)
        expect(paybacks[i], `${TIERS[i]} > ${TIERS[i - 1]}`).toBeGreaterThan(paybacks[i - 1]);
    }
  });

  it('repeat-purchase pricing is geometric with growth ≥ 1.3', () => {
    // 1.35 since 17.08.2026 (was 1.6, and this floor was 1.5). The floor is not
    // where the inflation guard lives — that is the year-long sim below, which
    // still holds at 1.35. What 1.6 broke was the OTHER half of the economy:
    // the tenth engine cost 687⭐ and the upgrade ladder was a dead buy past
    // the fourth engine. At 1.35 engines and upgrades stay comparable through
    // ten engines (the tenth is 149⭐, and pays back in ~60 days like a
    // level-20 speed tap does).
    const growth = appConfig.economy.engineRepeatPriceGrowth;
    expect(growth).toBeGreaterThanOrEqual(1.3);
    for (const tier of TIERS) {
      const base = engineMarketPriceLc(tier, 0);
      expect(engineMarketPriceLc(tier, 5) / base).toBeCloseTo(Math.pow(growth, 5), 0);
    }
  });

  it('the Market prices the next engine at the geometric repeat price (not the flat base)', () => {
    // Guards the integration, not just the helper: this is the exact function
    // `MarketEngineSection` now calls to price a purchase. Before the fix the
    // section charged the flat catalog base regardless of owned count, so the
    // anti-inflation valve never fired in the live app (audit finding H1).
    const growth = appConfig.economy.engineRepeatPriceGrowth;
    for (const tier of TIERS) {
      const lcAt = (owned: number) =>
        engineNextPurchasePrices(tier, owned, 0).find(p => p.type === MarketPriceType.LC)!.amount;
      // First engine == the catalog base; third engine == base × growth².
      expect(lcAt(0), `${tier} first`).toBe(appConfig.economy.engineBasePriceLcByTier[tier]);
      expect(lcAt(2) / lcAt(0), `${tier} 3rd/1st`).toBeCloseTo(growth ** 2, 0);
      // LS tracks the repeat LC amount at USD parity — no cross-currency arb.
      const third = engineNextPurchasePrices(tier, 2, 0);
      const thirdLc = third.find(p => p.type === MarketPriceType.LC)!.amount;
      const thirdLs = third.find(p => p.type === MarketPriceType.TELEGRAM_STARS)!.amount;
      expect(thirdLs, `${tier} LS parity`).toBe(lcPriceToLsParity(thirdLc));
    }
  });

  it('no money printer: a year of perfect greedy free play stays inside the inflation bound', () => {
    /**
     * Both ends of the AP gate, not just the slow one.
     *
     * This assertion ran for months against `startingAp = 0` — a player who
     * earns nothing but the daily baseline. That is not the player the catalog
     * describes: the one-time tasks hold enough AP to clear Silver outright and
     * very nearly Gold, so the real gate opens far sooner than the sim assumed,
     * and "conservative" was pointing the wrong way. Banking the whole catalog
     * on day 1 is the fastest the gate can possibly open; the truth sits
     * between, and the bound has to hold at both ends.
     */
    const catalogAp = oneTimeCatalogAp();
    const starts = catalogAp === null ? [0] : [0, catalogAp];

    for (const startingAp of starts) {
      const { productionByDay } = simulateGreedyYear(configuredKnobs(), 365, startingAp);
      const p30 = productionByDay[29];
      const p365 = productionByDay[364];
      // Sub-exponential growth: the whole back-335-days multiple stays small.
      // (At the shipped knobs the sim lands at ≈×5 — ≈470k → ≈2.37M LC/day.)
      expect(p365 / p30, `growth at startingAp=${startingAp}`).toBeLessThanOrEqual(25);
      // Absolute faucet bound: even a perfect player mints a bounded LC value
      // (≈$2.37/day at the shipped scale — real withdrawal is separately capped
      // at $10/day, DOCS §14.2). A loose sanity ceiling, not a tight target.
      expect(
        p365 * appConfig.wallet.lcUsdRate,
        `faucet at startingAp=${startingAp}`
      ).toBeLessThanOrEqual(50_000);
    }
  });

  it('legacy flat pricing WAS a money printer (why engineRepeatPriceGrowth exists)', () => {
    const { productionByDay } = simulateGreedyYear(legacyFlatKnobs());
    const p30 = productionByDay[29];
    const p365 = productionByDay[364];
    expect(p365 / p30).toBeGreaterThan(1_000_000); // unmistakably exponential
  });

  it('paid capacity levels add +1 ticket each: maxed = 11 tickets/cycle at level 1', () => {
    const maxed = baseEngine({ capacityLevel: MAX_BOOST_LEVEL });
    expect(engineCapacity(maxed)).toBe(1 + MAX_BOOST_LEVEL);
    // Every single tap must move output (absolute +1, no rounding traps).
    expect(engineCapacity(baseEngine({ capacityLevel: 1 }))).toBe(2);
    expect(engineCapacity(maxed)).toBeGreaterThan(engineCapacity(baseEngine({})));
  });

  it('maxed speed levels take 20% off the cycle (ladder re-tuned 16.08.2026)', () => {
    // Was "halve the cycle" while the ladder ran 0…100%. The ladders were
    // compressed 5× when the boost math was fixed — with boosts finally
    // multiplying the rate, +100% from ten taps alone would have tripled ticket
    // emission. @see SPEED_LEVEL_BOOST_PCT_TABLE
    const maxed = baseEngine({ speedLevel: MAX_BOOST_LEVEL });
    expect(effectiveCycleSeconds(maxed)).toBe(
      appConfig.engines.baseCycleSecondsByTier.bronze / 1.2
    );
  });

  it('AP pacing hits the product targets: Silver ~15d, then +1mo, +3.5mo, +7mo', () => {
    const t = GlobalConstants.apTierThresholds;
    const base = GlobalConstants.dailyBaselineApByTier;
    const daysPerLeg = [
      (t.silver - t.bronze) / base.bronze,
      (t.gold - t.silver) / base.silver,
      (t.platinum - t.gold) / base.gold,
      (t.diamond - t.platinum) / base.platinum,
    ];
    // A perfect player who collects the full derived daily ceiling every day
    // must land each leg within ±10% of the product pacing targets.
    //
    // The last two read 90 / 180 while the baseline priced every task at the
    // PLAYER's tier rate: a Diamond player was credited 5 AP for the channel
    // check-in and 5 for the Bronze tournament task, 35 AP/day of tasks where
    // the catalog pays 19. On the real rates the legs are 3.5 and 7 months.
    // The targets moved, not the thresholds — pulling Platinum and Diamond back
    // to 3 and 6 months means LOWERING the AP gates on a live ladder, which
    // demotes whoever sits between the old gate and the new one.
    const targetDays = [15, 30, 105, 220];
    daysPerLeg.forEach((leg, i) => {
      expect(leg, `leg ${i} vs target ${targetDays[i]}d`).toBeGreaterThanOrEqual(
        targetDays[i] * 0.9
      );
      expect(leg, `leg ${i} vs target ${targetDays[i]}d`).toBeLessThanOrEqual(targetDays[i] * 1.1);
    });
    // And pacing still decelerates: each tier takes longer than the previous.
    for (let i = 1; i < daysPerLeg.length; i++) {
      expect(daysPerLeg[i]).toBeGreaterThan(daysPerLeg[i - 1]);
    }
  });

  /**
   * The pacing above is a FLOOR, and for the first two tiers it is not the
   * number anyone experiences.
   *
   * It divides each threshold gap by the daily baseline alone — the pace of a
   * player who logs in, collects, and never finishes a milestone. The one-time
   * catalog holds enough Activity Points to clear Silver several times over and
   * to very nearly reach Gold on its own, so "Silver in ~15 days" describes a
   * player who is deliberately ignoring most of the game.
   *
   * Nothing here argues for moving the thresholds — that is a live ladder and
   * lowering a gate demotes whoever sits between the old one and the new. What
   * this pins is the SHAPE, so the gap stops being invisible: if the catalog is
   * rebalanced until it no longer covers Silver, or grows until it covers
   * Platinum, that is a pacing change and it should be a decision rather than a
   * side effect.
   */
  it('one-time tasks alone clear Silver and nearly reach Gold — the baseline pace is a floor', () => {
    const catalogAp = oneTimeCatalogAp();
    if (catalogAp === null) return; // backend not checked out; same as enum-parity

    const t = GlobalConstants.apTierThresholds;

    // A real total, not a plausible one: 1,593 AP across 110 live one-time
    // tasks as of 14.08.2026. Pinned loosely so ordinary catalog edits pass and
    // a structural change does not slip by unnoticed.
    expect(catalogAp, 'one-time catalog AP').toBeGreaterThan(1_200);
    expect(catalogAp, 'one-time catalog AP').toBeLessThan(2_200);

    // Silver is not a time gate at all — the catalog covers it outright.
    expect(catalogAp, 'catalog vs Silver').toBeGreaterThan(t.silver);

    // Gold is within reach of the catalog alone; Platinum is firmly not.
    expect(catalogAp / t.gold, 'catalog vs Gold').toBeGreaterThan(0.8);
    expect(catalogAp / t.platinum, 'catalog vs Platinum').toBeLessThan(0.5);

    // And the two halves are the same order of magnitude over a year, so
    // neither can be left out of a pacing claim: the baseline pays ~35/day at
    // Bronze, the catalog ~1.6k once.
    const baselineYear = GlobalConstants.dailyBaselineApByTier.bronze * 365;
    expect(catalogAp / baselineYear).toBeGreaterThan(0.05);
  });

  it('referral tier gate: requirements pinned, monotone, and enforced (DOCS §5.1)', () => {
    const r = GlobalConstants.tierReferralRequirements;
    // Pin the product numbers — a silent change here is a business-rule change.
    expect(activityTierOrder.map(tier => r[tier])).toEqual([0, 2, 5, 10, 20]);
    // The gate math assumes higher tiers are never easier on referrals.
    for (let i = 1; i < activityTierOrder.length; i++) {
      expect(r[activityTierOrder[i]]).toBeGreaterThanOrEqual(r[activityTierOrder[i - 1]]);
    }
    // Both halves are required: a whale with no friends stays Bronze…
    expect(computeActivityTier(1_000_000, 0)).toBe('bronze');
    expect(computeActivityTier(1_000_000, 5)).toBe('gold');
    expect(computeActivityTier(1_000_000, 20)).toBe('diamond');
    // …and friends alone never unlock a tier without the AP.
    expect(computeActivityTier(0, 20)).toBe('bronze');
    expect(computeActivityTier(GlobalConstants.apTierThresholds.silver, 20)).toBe('silver');
  });

  it('referral tier requirements mirror the backend constants (parity)', () => {
    // Same pattern as enum-parity: needs the backend repo checked out beside
    // this one; silently skipped otherwise.
    const backendPath = resolve(
      process.cwd(),
      '../lucky-ticket-backend/src/common/economy.constants.ts'
    );
    if (!existsSync(backendPath)) return;
    const src = readFileSync(backendPath, 'utf8');
    const block = src.match(/TIER_REFERRAL_REQUIREMENTS[^{]*\{([^}]*)\}/)?.[1];
    expect(block, 'TIER_REFERRAL_REQUIREMENTS not found in backend').toBeTruthy();
    for (const tier of activityTierOrder) {
      const m = block!.match(new RegExp(`${tier.toUpperCase()}:\\s*([\\d_]+)`));
      expect(m, `backend missing ${tier}`).toBeTruthy();
      expect(Number(m![1].replace(/_/g, ''))).toBe(GlobalConstants.tierReferralRequirements[tier]);
    }
  });

  it('daily AP baseline is derived from the source registry (no hand-drift)', () => {
    // Spot-check the derivation stays wired: flat sources + tiered sources.
    const r = GlobalConstants.apRewards;
    const flat =
      r.dailyStreak +
      r.watchVideo * r.watchVideoDailyLimit +
      r.sendTicket * r.sendTicketDailyLimit +
      r.likeProfile * r.likeProfileDailyLimit;
    expect(GlobalConstants.dailyBaselineApByTier.bronze).toBe(
      Math.round(
        flat +
          r.dailyTasksCountByTier.bronze * r.dailyTaskByTier.bronze +
          (r.weeklyTasksCountByTier.bronze * r.weeklyTaskByTier.bronze) / 7
      )
    );
  });

  it('LC→TON exit is guarded: conversion fee ≥ 10% and daily cap ≤ $10', () => {
    expect(appConfig.economy.lcConversion.feePercent).toBeGreaterThanOrEqual(10);
    expect(appConfig.economy.lcConversion.dailyCapUsd).toBeLessThanOrEqual(10);
  });

  it('engine LS prices sit at LC parity — no cross-currency arbitrage', () => {
    // Engines are the parity-locked dual-priced item. Tickets are intentionally
    // OFF parity (fixed 1–5⭐ ladder, asserted in the next test).
    for (const item of marketMock.engines) {
      const lc = item.prices.find(p => p.type === MarketPriceType.LC);
      const stars = item.prices.find(p => p.type === MarketPriceType.TELEGRAM_STARS);
      if (!lc || !stars) continue;
      expect(stars.amount, item.id).toBe(lcPriceToLsParity(lc.amount));
    }
  });

  it('tickets use a fixed 1→5⭐ by-tier Stars ladder (off LC parity)', () => {
    const expected: Record<string, number> = {
      bronze: 1,
      silver: 2,
      gold: 3,
      platinum: 4,
      diamond: 5,
    };
    for (const ticket of marketMock.tickets) {
      const stars = ticket.prices.find(p => p.type === MarketPriceType.TELEGRAM_STARS);
      expect(stars?.amount, ticket.ticketType).toBe(expected[ticket.ticketType]);
    }
  });

  it('stakes are worth parking capital in once the engine frontier decays', () => {
    // Max-duration APR must be meaningful against a late-game engine ROI.
    expect(appConfig.stakes.aprMaxPercent).toBeGreaterThanOrEqual(8);
  });
});

describe('equipped-avatar engine-speed boost (audit finding H2)', () => {
  const mk = (over: Partial<UserAvatar>): UserAvatar => ({
    id: 'a',
    src: '',
    name: 'A',
    tier: 'paid',
    level: 8,
    owned: true,
    ...over,
  });
  const avatars: UserAvatar[] = [
    mk({ id: 'speed', boost: { type: 'engineSpeed', pct: 15 } }),
    mk({ id: 'claim', boost: { type: 'claimMultiplier', pct: 25 } }),
    mk({ id: 'locked', owned: false, boost: { type: 'engineSpeed', pct: 3 } }),
    mk({ id: 'free', boost: undefined }),
  ];

  it('resolves only an equipped + owned + engine-speed avatar', () => {
    expect(equippedAvatarEngineSpeedPct(avatars, 'speed')).toBe(15);
    expect(equippedAvatarEngineSpeedPct(avatars, 'claim')).toBe(0); // non-speed boost
    expect(equippedAvatarEngineSpeedPct(avatars, 'locked')).toBe(0); // not owned
    expect(equippedAvatarEngineSpeedPct(avatars, 'free')).toBe(0); // no boost
    expect(equippedAvatarEngineSpeedPct(avatars, undefined)).toBe(0); // nothing equipped
    expect(equippedAvatarEngineSpeedPct(undefined, 'speed')).toBe(0); // inventory not loaded
  });

  it('resolves against the real avatar fixtures (hook reads live data, not synthetic)', () => {
    const real = avatarsMock.avatars;
    // Demo account equips avatar-10 (Cyber Emperor, claimMultiplier) → no engine
    // speedup, so the live app never gets a false boost.
    expect(equippedAvatarEngineSpeedPct(real, 'avatar-10')).toBe(0);
    // avatar-8 (Speedstar) carries +15% engineSpeed but ships owned:false, so an
    // un-purchased speed avatar contributes nothing…
    expect(equippedAvatarEngineSpeedPct(real, 'avatar-8')).toBe(0);
    // …once owned, its advertised +15% resolves through the same path.
    const owned = real.map(a => (a.id === 'avatar-8' ? { ...a, owned: true } : a));
    expect(equippedAvatarEngineSpeedPct(owned, 'avatar-8')).toBe(15);
  });

  it('the avatar boost actually shortens the production cycle, additive with status', () => {
    const engine = baseEngine({});
    const base = engine.cycleSeconds;
    // +15% additive → cycle divided by 1.15 (was a no-op before the fix: the
    // advertised avatar speed boost never reached effectiveCycleSeconds).
    expect(effectiveCycleSeconds(engine, { avatarBoostPct: 15 })).toBeCloseTo(base / 1.15, 3);
    // Stacks additively on top of VIP's summand — the level-20 fallback of 150%
    // when no perks are passed (150% + 15% = 165%).
    const vip = effectiveCycleSeconds(engine, { isVip: true });
    const vipPlusAvatar = effectiveCycleSeconds(engine, { isVip: true, avatarBoostPct: 15 });
    expect(vipPlusAvatar).toBeLessThan(vip);
    expect(vipPlusAvatar).toBeCloseTo(base / 2.65, 3);
    // Lucky Player is NOT in that sum — it multiplies the whole thing (×1.3):
    // (1 + 15%) × 1.3, the same ×1.3 it would be on a maxed engine.
    const lpPlusAvatar = effectiveCycleSeconds(engine, { isLuckyPlayer: true, avatarBoostPct: 15 });
    expect(lpPlusAvatar).toBeCloseTo(base / 1.15 / 1.3, 3);
  });
});

describe('engine-level promotion & base-capacity scaling (audit finding H3)', () => {
  // The promotion loop was a large, undocumented economic lever invisible to
  // the guardrail: maxing both sub-levels promotes the engine, which permanently
  // lifts base per-cycle output (1 → 11 → 21 → 31 → 41) and speed by +20%. These
  // tests pin both curves and the promotion gate to the exact code the live
  // upgrade paths run.

  it('base per-cycle output follows the level table (1 → 12 → 27 → 47 → 72)', () => {
    expect(baseCapacity(1)).toBe(1);
    expect(baseCapacity(2)).toBe(12);
    expect(baseCapacity(3)).toBe(27);
    // Every step is DERIVED: ten capacity taps plus that level's finishing
    // bonus (1 · 5 · 10 · 15 · 20), so a maxed level-N engine holds exactly the
    // base of level N+1 and promotion is seamless.
    for (let level = 1; level < MAX_ENGINE_LEVEL; level += 1) {
      expect(baseCapacity(level + 1), `level ${level} → ${level + 1}`).toBe(
        baseCapacity(level) + MAX_BOOST_LEVEL + ENGINE_FULL_LEVEL_BONUS_TICKETS_TABLE[level]
      );
    }
    // A falsy/absent level is treated as level 1 — no phantom capacity.
    expect(baseCapacity(0)).toBe(1);
  });

  it('design target: a FULL-maxed Bronze engine mints 102 tickets in exactly one day', () => {
    // Level 5, both ladders 10/10 → 72 base + 10 taps + 20 finishing bonus =
    // 102. One ticket costs one tier cycle, so that is 102 × 2h = 204h, divided
    // by 1 + (475 level + 20 taps + 255 finishing bonus)% = 8.5 → 24h. This is
    // the invariant the whole ladder was fitted to: a FINISHED level collects
    // once a day, the top one exactly. The fresh engine stays the fixed point:
    // 1 ticket in 2 hours.
    const fullMax = baseEngine({
      engineLevel: MAX_ENGINE_LEVEL,
      speedLevel: MAX_BOOST_LEVEL,
      capacityLevel: MAX_BOOST_LEVEL,
    });
    expect(engineCapacity(fullMax)).toBe(102);
    expect(effectiveCycleSeconds(fullMax)).toBe(24 * 3600);
    // …and every other finished level lands within an hour or two of a day.
    for (let level = 1; level <= MAX_ENGINE_LEVEL; level += 1) {
      const finished = baseEngine({
        engineLevel: level,
        speedLevel: MAX_BOOST_LEVEL,
        capacityLevel: MAX_BOOST_LEVEL,
      });
      const hours = effectiveCycleSeconds(finished) / 3600;
      expect(hours, `finished level ${level}`).toBeGreaterThan(17);
      expect(hours, `finished level ${level}`).toBeLessThan(27);
    }
  });

  it('each engine level absorbs the finished ladder below it; capacity buys collect size', () => {
    // A level's speed is DERIVED: the ten taps (+20%) plus the finishing bonus
    // of the level below — exactly what promotion resets and forfeits, so the
    // promotion is seamless and pays in headroom rather than an instant jump.
    expect(engineLevelBoostPct(1)).toBe(0);
    for (let level = 1; level < MAX_ENGINE_LEVEL; level += 1) {
      expect(engineLevelBoostPct(level + 1), `level ${level} → ${level + 1}`).toBe(
        engineLevelBoostPct(level) +
          speedLevelBoostPct(MAX_BOOST_LEVEL) +
          ENGINE_FULL_LEVEL_SPEED_BONUS_PCT_TABLE[level]
      );
    }
    // One ticket costs one tier cycle, so ten paid capacity taps buy ten more
    // tickets per collect AND ten more tier cycles of waiting — the collect
    // gets bigger and rarer, the mining rate is the speed side's job.
    const bare = baseEngine({ engineLevel: 2 });
    const loaded = baseEngine({ engineLevel: 2, capacityLevel: MAX_BOOST_LEVEL });
    expect(engineCapacity(loaded)).toBe(engineCapacity(bare) + MAX_BOOST_LEVEL);
    expect(effectiveCycleSeconds(loaded) / engineCapacity(loaded)).toBeCloseTo(
      effectiveCycleSeconds(bare) / engineCapacity(bare),
      6
    );
  });

  it('capacity sub-level adds the same absolute +1 at every engine level', () => {
    // Level 1: base 1 + 10 taps = 11 per cycle (the speed ladder is at 0, so no
    // finishing bonus yet)…
    expect(engineCapacity(baseEngine({ capacityLevel: MAX_BOOST_LEVEL }))).toBe(11);
    // …level 2: base 12 + the same 10 = 22 (absolute bonus, NOT a multiplier).
    expect(engineCapacity(baseEngine({ engineLevel: 2, capacityLevel: MAX_BOOST_LEVEL }))).toBe(22);
  });

  it('promotion fires only when BOTH sub-levels are maxed, then resets them', () => {
    // One sub-level short → untouched (no premature promotion).
    const partial = baseEngine({ speedLevel: MAX_BOOST_LEVEL, capacityLevel: 3 });
    expect(promoteEngineIfMaxed(partial)).toEqual(partial);
    // Both maxed → engineLevel++ and both sub-levels reset to 0 for a fresh ladder.
    const maxed = baseEngine({ speedLevel: MAX_BOOST_LEVEL, capacityLevel: MAX_BOOST_LEVEL });
    const promoted = promoteEngineIfMaxed(maxed);
    expect(promoted.engineLevel).toBe(2);
    expect(promoted.speedLevel).toBe(0);
    expect(promoted.capacityLevel).toBe(0);
  });

  it('promotion stops at the engine-level cap — terminal 10/10, mirrors the backend', () => {
    // Backend gates promotion behind MAX_ENGINE_LEVEL (economy.constants.ts); if the
    // optimistic path promoted past it, the UI would show a level the server
    // rejects and drift until the next refetch.
    const atCap = baseEngine({
      engineLevel: MAX_ENGINE_LEVEL,
      speedLevel: MAX_BOOST_LEVEL,
      capacityLevel: MAX_BOOST_LEVEL,
    });
    expect(promoteEngineIfMaxed(atCap)).toEqual(atCap);
    // One level below the cap still promotes normally.
    const belowCap = baseEngine({
      engineLevel: MAX_ENGINE_LEVEL - 1,
      speedLevel: MAX_BOOST_LEVEL,
      capacityLevel: MAX_BOOST_LEVEL,
    });
    expect(promoteEngineIfMaxed(belowCap).engineLevel).toBe(MAX_ENGINE_LEVEL);
  });

  it('one promotion costs a full 20 Lucky-Star upgrades — a real-money sink, not a free printer', () => {
    // Walk the exact ladder the optimistic upgrade path walks: bump the lagging
    // sub-level (capped at 10), then apply the same promotion rule engines.api
    // runs after every upgrade. Count the paid steps to reach the next level.
    let engine = baseEngine({});
    let paidUpgrades = 0;
    while (engine.engineLevel === 1) {
      const next = { ...engine };
      if ((next.speedLevel ?? 0) <= (next.capacityLevel ?? 0)) {
        next.speedLevel = Math.min(MAX_BOOST_LEVEL, (next.speedLevel ?? 0) + 1);
      } else {
        next.capacityLevel = Math.min(MAX_BOOST_LEVEL, (next.capacityLevel ?? 0) + 1);
      }
      engine = promoteEngineIfMaxed(next);
      paidUpgrades++;
    }
    expect(paidUpgrades).toBe(20); // 10 speed + 10 capacity, every step paid in LS
    expect(engine.engineLevel).toBe(2);
    // Payoff of that spend: the level's base output goes 1 → 12, exactly what
    // the ten capacity taps plus the level-1 finishing bonus had already given,
    // so the promotion itself is seamless and what it buys is the next ten taps.
    expect(baseCapacity(engine.engineLevel ?? 1)).toBe(12);
    expect(engineCapacity(engine)).toBe(12);
  });
});
