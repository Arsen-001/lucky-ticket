import { describe, it, expect } from 'vitest';
import { appConfig } from '@/config/app.config';
import {
  computeStakeBaseAp,
  computeStakeActivityPoints,
  computeStakeFeeBase,
  computeStakeCancelFee,
  computeStakeVolumeDiscountPercent,
  computeStakeAprPercent,
  computeStakeFee,
} from '@/utils/global/stakes.utils';

describe('stake math (DOCS §18)', () => {
  it('base AP = round(deposit × months ÷ apDivisor)', () => {
    expect(computeStakeBaseAp(10_000, 1)).toBe(2); // 10000 / 5000
    expect(computeStakeBaseAp(50_000, 2)).toBe(20); // 100,000 / 5000
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

  it('default volume-discount brackets', () => {
    expect(computeStakeVolumeDiscountPercent(99_999, false)).toBe(0);
    expect(computeStakeVolumeDiscountPercent(100_000, false)).toBe(10);
    expect(computeStakeVolumeDiscountPercent(1_000_000, false)).toBe(20);
  });

  it('APR spans the configured min..max across the duration slider', () => {
    expect(computeStakeAprPercent(appConfig.stakes.durationMinMonths)).toBe(
      appConfig.stakes.aprMinPercent
    );
    expect(computeStakeAprPercent(appConfig.stakes.durationMaxMonths)).toBe(
      appConfig.stakes.aprMaxPercent
    );
  });

  it('first Bronze stakes are free, then charged', () => {
    expect(computeStakeFee(10_000, 1, false, 1, 0).free).toBe(true);
    expect(computeStakeFee(10_000, 1, false, 1, appConfig.stakes.bronzeFreeStartCount).free).toBe(
      false
    );
  });
});
