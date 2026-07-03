import { describe, it, expect } from 'vitest';
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
  effectiveCycleSeconds,
  engineCapacity,
  MAX_BOOST_LEVEL,
} from '@/utils/global/ticket-engine.utils';
import { marketMock } from '@/mock/market.mock';
import { MarketPriceType } from '@/types/enums/market.enums';
import type { TicketEngine } from '@/types/interfaces/ticket.interfaces';
import type { TicketType } from '@/types/types/ticket.types';

const TIERS: TicketType[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];

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

const simulateGreedyYear = (knobs: SimKnobs, days = 365): SimResult => {
  let lc = 0;
  let ap = 0;
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
    ap += GlobalConstants.dailyBaselineApByTier[computeActivityTier(ap)];
    const unlockedIdx = activityTierOrder.indexOf(computeActivityTier(ap));

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
const legacyFlatKnobs = (): SimKnobs => ({
  basePriceByTier: {
    bronze: 800_000,
    silver: 1_800_000,
    gold: 4_500_000,
    platinum: 9_800_000,
    diamond: 19_999_000,
  },
  repeatGrowth: 1,
  dailyValueByTier: configuredKnobs().dailyValueByTier,
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

  it('repeat-purchase pricing is geometric with growth ≥ 1.5', () => {
    const growth = appConfig.economy.engineRepeatPriceGrowth;
    expect(growth).toBeGreaterThanOrEqual(1.5);
    for (const tier of TIERS) {
      const base = engineMarketPriceLc(tier, 0);
      expect(engineMarketPriceLc(tier, 5) / base).toBeCloseTo(Math.pow(growth, 5), 0);
    }
  });

  it('no money printer: a year of perfect greedy free play stays inside the inflation bound', () => {
    const { productionByDay } = simulateGreedyYear(configuredKnobs());
    const p30 = productionByDay[29];
    const p365 = productionByDay[364];
    // Sub-exponential growth: the whole back-335-days multiple stays small.
    // (At the shipped knobs the sim lands at ≈×5 — 3.6M → 18M LC/day.)
    expect(p365 / p30).toBeLessThanOrEqual(25);
    // Absolute faucet bound: even a perfect player mints a bounded LC value.
    expect(p365 * appConfig.wallet.lcUsdRate).toBeLessThanOrEqual(500);
  });

  it('legacy flat pricing WAS a money printer (why engineRepeatPriceGrowth exists)', () => {
    const { productionByDay } = simulateGreedyYear(legacyFlatKnobs());
    const p30 = productionByDay[29];
    const p365 = productionByDay[364];
    expect(p365 / p30).toBeGreaterThan(1_000_000); // unmistakably exponential
  });

  it('paid capacity levels actually change output: maxed = 2 tickets/cycle', () => {
    const maxed = baseEngine({ capacityLevel: MAX_BOOST_LEVEL });
    expect(engineCapacity(maxed)).toBe(2);
    // The old +1%/level curve rounded back to 1 even at max — pay-for-nothing.
    expect(engineCapacity(maxed)).toBeGreaterThan(engineCapacity(baseEngine({})));
  });

  it('maxed speed levels halve the cycle (above the hard floor)', () => {
    const maxed = baseEngine({ speedLevel: MAX_BOOST_LEVEL });
    expect(effectiveCycleSeconds(maxed)).toBe(appConfig.engines.baseCycleSecondsByTier.bronze / 2);
  });

  it('AP pacing hits the product targets: Silver ~15d, then +1mo, +3mo, +6mo', () => {
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
    const targetDays = [15, 30, 90, 180];
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
          r.claimDailyLimit * r.claimByTier.bronze +
          r.dailyTasksCountByTier.bronze * r.dailyTaskByTier.bronze +
          (r.weeklyTasksCountByTier.bronze * r.weeklyTaskByTier.bronze) / 7
      )
    );
  });

  it('LC→TON exit is guarded: conversion fee ≥ 10% and daily cap ≤ $10', () => {
    expect(appConfig.economy.lcConversion.feePercent).toBeGreaterThanOrEqual(10);
    expect(appConfig.economy.lcConversion.dailyCapUsd).toBeLessThanOrEqual(10);
  });

  it('market LS prices sit at LC parity — no cross-currency arbitrage', () => {
    const items = [...marketMock.engines, ...marketMock.tickets];
    for (const item of items) {
      const lc = item.prices.find(p => p.type === MarketPriceType.LC);
      const stars = item.prices.find(p => p.type === MarketPriceType.TELEGRAM_STARS);
      if (!lc || !stars) continue;
      expect(stars.amount, item.id).toBe(lcPriceToLsParity(lc.amount));
    }
  });

  it('stakes are worth parking capital in once the engine frontier decays', () => {
    // Max-duration APR must be meaningful against a late-game engine ROI.
    expect(appConfig.stakes.aprMaxPercent).toBeGreaterThanOrEqual(8);
  });
});
