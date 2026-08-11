import { describe, it, expect } from 'vitest';
import { appConfig } from '@/config/app.config';
import {
  computeStakeBaseAp,
  computeStakeActivityPoints,
  computeStakeFeeBase,
  computeStakeCancelFee,
  computeStakeVolumeDiscountPercent,
  computeStakeReturnCoins,
  computeStakeAprPercent,
  computeStakeEffectiveAprPercent,
  computeStakeFee,
  findLevelForDeposit,
} from '@/utils/global/stakes.utils';
import { computeTierGap } from '@/utils/global/activity.utils';

describe('stake math (DOCS §18)', () => {
  it('base AP = round(deposit × months ÷ apDivisor)', () => {
    expect(computeStakeBaseAp(10_000, 1)).toBe(2); // 10,000 / 5,000
    expect(computeStakeBaseAp(50_000, 2)).toBe(20); // 100,000 / 5,000
  });

  it('total AP = base + 50% completion bonus', () => {
    expect(computeStakeActivityPoints(10_000, 1)).toBe(3); // 2 + round(2 × 0.5)
  });

  it('fee base = ceil(deposit ÷ feeStep)', () => {
    expect(computeStakeFeeBase(25_000)).toBe(3);
    expect(computeStakeFeeBase(10_000)).toBe(1);
  });

  it('cancel fee = max(min, multiplier × base)', () => {
    expect(computeStakeCancelFee(10_000)).toBe(2); // max(2, 2 × 1)
    expect(computeStakeCancelFee(50_000)).toBe(10); // max(2, 2 × 5)
  });

  it('volume-discount brackets without a status', () => {
    expect(computeStakeVolumeDiscountPercent(99_999, 0)).toBe(0);
    expect(computeStakeVolumeDiscountPercent(100_000, 0)).toBe(10);
    expect(computeStakeVolumeDiscountPercent(1_000_000, 0)).toBe(20);
  });

  it('a status adds its bonus to the bracket, but never invents one', () => {
    // +10pp is the default for both LP and VIP — the numbers Lucky Player has
    // always had, and the ones VIP was promised but never actually got.
    expect(computeStakeVolumeDiscountPercent(100_000, 10)).toBe(20);
    expect(computeStakeVolumeDiscountPercent(1_000_000, 10)).toBe(30);
    // Under the first threshold there is no discount to boost.
    expect(computeStakeVolumeDiscountPercent(99_999, 10)).toBe(0);
  });

  it('APR spans the configured min..max across the duration slider', () => {
    expect(computeStakeAprPercent(appConfig.stakes.durationMinMonths)).toBe(
      appConfig.stakes.aprMinPercent
    );
    expect(computeStakeAprPercent(appConfig.stakes.durationMaxMonths)).toBe(
      appConfig.stakes.aprMaxPercent
    );
  });

  it('the free starts are free at any deposit, then everything is charged', () => {
    const free = appConfig.stakes.freeStartCount;
    // Any amount, any band — the waiver stopped being bronze-scoped when band
    // floors became an admin knob (a bronze floor of 1,000,000 LC is normal).
    expect(computeStakeFee(10_000, 1, false, 0).free).toBe(true);
    expect(computeStakeFee(5_000_000, 1, false, 0).free).toBe(true);
    expect(computeStakeFee(10_000, 1, false, free).free).toBe(false);
  });
});

/**
 * A level is a band the deposit falls into — never a thing the player picks,
 * and never gated. Below the cheapest band there is no level at all, which is a
 * valid stake earning the plain duration APR.
 */
describe('deposit bands (DOCS §18.2)', () => {
  const levels = appConfig.stakes.levels;

  it('picks the highest band the deposit clears', () => {
    expect(findLevelForDeposit(levels, 10_000)?.level).toBe(1);
    expect(findLevelForDeposit(levels, 49_999)?.level).toBe(1);
    expect(findLevelForDeposit(levels, 50_000)?.level).toBe(2);
    expect(findLevelForDeposit(levels, 5_000_000)?.level).toBe(5);
  });

  it('returns no band under the cheapest floor instead of falling back to level 1', () => {
    expect(findLevelForDeposit(levels, 9_999)).toBeNull();
    expect(findLevelForDeposit(levels, 1)).toBeNull();
  });

  it('follows admin floors, so a raised bronze floor leaves smaller stakes bandless', () => {
    const raised = levels.map((l, i) => ({
      ...l,
      minDeposit: [1_000_000, 3_000_000, 10_000_000, 30_000_000, 100_000_000][i],
    }));
    expect(findLevelForDeposit(raised, 999_999)).toBeNull();
    expect(findLevelForDeposit(raised, 1_000_000)?.level).toBe(1);
    expect(findLevelForDeposit(raised, 2_999_999)?.level).toBe(1);
    expect(findLevelForDeposit(raised, 3_000_000)?.level).toBe(2);
  });

  it('the band boost is percentage points on the rate, not a cut of the yield', () => {
    const months = appConfig.stakes.durationMaxMonths;
    const base = computeStakeAprPercent(months);
    expect(computeStakeEffectiveAprPercent(months, 1)).toBe(base + 1);
    // The distinction that matters: on 1,000,000 LC at 10% this is +10,000 LC,
    // where a multiplicative +1% would have been +1,000.
    expect(computeStakeReturnCoins(1_000_000, months, false, false, undefined, undefined, 1)).toBe(
      110_000
    );
  });
});

describe('tier gap names the half that is actually missing', () => {
  it('reports friends, not "0 more AP", when AP is already met', () => {
    // 18,500 AP is past every threshold up to Platinum's 5,900; 7 friends is
    // three short of its 10. Naming AP alone printed "need 0 more AP".
    expect(computeTierGap(18_500, 7, 'platinum')).toEqual({ apGap: 0, refGap: 3 });
  });

  it('reports both halves when both are short', () => {
    expect(computeTierGap(0, 0, 'silver')).toEqual({ apGap: 500, refGap: 2 });
  });
});
