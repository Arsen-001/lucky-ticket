import { describe, it, expect } from 'vitest';
import type { TicketType } from '@/types/types/ticket.types';
import {
  ticketEvLc,
  engineTicketsPerDay,
  engineDailyLcValue,
  engineMarketPriceLc,
  enginePaybackDays,
  lcPriceToLsParity,
  speedUpgradeLsCost,
  capacityUpgradeLsCost,
} from '@/utils/global/economy.utils';
import { computeStakeFee, computeStakeCancelFee } from '@/utils/global/stakes.utils';
import { GlobalConstants } from '@/constants/global.constants';
import { appConfig } from '@/config/app.config';

/**
 * The edges of the money math, where a wrong number is silent.
 *
 * `economy-sim` already proves the loop stays solvent over time and
 * `docs-constants` pins the values DOCS names. What neither covers is what these
 * formulas do at their boundaries, and whether the ladders described in prose in
 * `app.config` still match the arithmetic — a comment that has quietly stopped
 * being true is how a re-tuned constant escapes review.
 */

const TIERS: TicketType[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];

describe('economy edges', () => {
  it('every per-tier figure is finite and positive', () => {
    for (const tier of TIERS) {
      for (const [label, value] of [
        ['ticket EV', ticketEvLc(tier)],
        ['tickets per day', engineTicketsPerDay(tier)],
        ['daily LC', engineDailyLcValue(tier)],
        ['payback days', enginePaybackDays(tier)],
      ] as const) {
        expect(Number.isFinite(value), `${tier} ${label} = ${value}`).toBe(true);
        expect(value, `${tier} ${label}`).toBeGreaterThan(0);
      }
    }
  });

  it('the payback ladder still matches the one described in app.config', () => {
    // "≈4 / 6 / 9 / 13 / 20 days — progression up the tiers stays rewarding,
    // never a trap" (appConfig.economy.engineBasePriceLcByTier). Re-tune a base
    // price or a cycle length and this is the sentence that goes stale first.
    const expected: Record<TicketType, number> = {
      bronze: 4,
      silver: 6,
      gold: 9,
      platinum: 13,
      diamond: 20,
    };
    for (const tier of TIERS) {
      expect(enginePaybackDays(tier), `${tier} payback`).toBeCloseTo(expected[tier], 0);
    }
  });

  it('payback rises with the tier — a higher tier is never the cheaper bet', () => {
    const ladder = TIERS.map(tier => enginePaybackDays(tier));
    for (let i = 1; i < ladder.length; i++) {
      expect(ladder[i], `${TIERS[i]} vs ${TIERS[i - 1]}`).toBeGreaterThan(ladder[i - 1]);
    }
  });

  it('repeat pricing grows geometrically and stays a real number', () => {
    const growth = appConfig.economy.engineRepeatPriceGrowth;
    const first = engineMarketPriceLc('bronze', 0);
    expect(engineMarketPriceLc('bronze', 1)).toBeCloseTo(first * growth, 5);
    expect(engineMarketPriceLc('bronze', 3)).toBeCloseTo(first * growth ** 3, 5);
    // Nobody owns 200 engines, but the price must not become Infinity if they do.
    expect(Number.isFinite(engineMarketPriceLc('bronze', 200))).toBe(true);
  });

  it('the LS parity price never rounds a paid item down to free', () => {
    for (const tier of TIERS) {
      const ls = lcPriceToLsParity(appConfig.economy.ticketPriceLcByTier[tier]);
      expect(ls, `${tier} in LS`).toBeGreaterThanOrEqual(1);
      expect(Number.isInteger(ls), `${tier} in LS = ${ls}`).toBe(true);
    }
  });

  it('upgrade costs are positive and follow the documented doubling ladder', () => {
    // The ladder is spelled out as a product rule: "every tier is DOUBLE the
    // previous one → 1/2/4/8/16". Pinned to literals on purpose — comparing the
    // cost against `tierCostMultiplier` would read the same config on both sides
    // of the assertion, so a re-tune would move both and the test could never fail.
    const ladder: Record<TicketType, number> = {
      bronze: 1,
      silver: 2,
      gold: 4,
      platinum: 8,
      diamond: 16,
    };
    for (const tier of TIERS) {
      expect(appConfig.economy.engineUpgrades.tierCostMultiplier[tier], `${tier} multiplier`).toBe(
        ladder[tier]
      );
      const speed = speedUpgradeLsCost(0, 1, tier);
      const capacity = capacityUpgradeLsCost(0, 1, tier);
      expect(speed, `${tier} speed`).toBeGreaterThan(0);
      expect(capacity, `${tier} capacity`).toBeGreaterThan(0);
      expect(speed, `${tier} speed vs bronze`).toBe(
        speedUpgradeLsCost(0, 1, 'bronze') * ladder[tier]
      );
    }
  });

  it('stake fees keep their floors however deep the discount goes', () => {
    // Volume + month discounts stack; the fee must still never fall under the
    // floor or turn into a payout, and a cancel must stay the more expensive way out.
    for (const deposit of [10_000, 250_000, 1_000_000, 50_000_000]) {
      for (const months of [1, 6, 12]) {
        const { fee, totalDiscountPercent, free } = computeStakeFee(
          deposit,
          months,
          true,
          GlobalConstants.stakeFreeStartCount
        );
        expect(totalDiscountPercent, `${deposit}×${months} discount`).toBeLessThanOrEqual(99);
        expect(free, `${deposit}×${months} free`).toBe(false);
        expect(fee, `${deposit}×${months} fee`).toBeGreaterThanOrEqual(
          GlobalConstants.stakeFeeMinStars
        );
        expect(computeStakeCancelFee(deposit), `${deposit} cancel vs fee`).toBeGreaterThanOrEqual(
          fee
        );
      }
    }
  });
});
