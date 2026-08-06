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
  computeMaxStakeable,
  findFirstLockedLevel,
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

/**
 * The ceiling the new-stake screen enforces (DOCS §18.2). It used to exist only
 * as a greyed-out "Locked" button below the fold: the slider ran to the full
 * balance, so a Gold player could configure a Level 4 stake in full — hero,
 * rewards preview and all — and nothing on the way said no.
 */
describe('max stakeable amount (tier ceiling)', () => {
  const levels = appConfig.stakes.levels;
  const unlockedUpTo = (tiers: string[]) => (tier: string) => tiers.includes(tier);

  it('stops one LC below the cheapest locked level', () => {
    // Gold player: Levels 1–3 open, Platinum (250,000) is the wall.
    const upToGold = unlockedUpTo(['bronze', 'silver', 'gold']);
    expect(findFirstLockedLevel(levels, upToGold)?.level).toBe(4);
    expect(computeMaxStakeable(levels, 1_600_000, upToGold)).toBe(249_999);
  });

  it('the balance still wins when it is the lower ceiling', () => {
    const upToGold = unlockedUpTo(['bronze', 'silver', 'gold']);
    expect(computeMaxStakeable(levels, 30_000, upToGold)).toBe(30_000);
  });

  it('a Diamond player is capped by the balance alone', () => {
    const all = () => true;
    expect(findFirstLockedLevel(levels, all)).toBeNull();
    expect(computeMaxStakeable(levels, 1_600_000, all)).toBe(1_600_000);
  });

  it('a Bronze player cannot reach the Silver deposit', () => {
    const bronzeOnly = unlockedUpTo(['bronze']);
    expect(computeMaxStakeable(levels, 1_600_000, bronzeOnly)).toBe(49_999);
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
