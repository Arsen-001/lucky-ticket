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
  formatStakeRelative,
  stakeApKept,
  stakeCompletedAtMs,
  stakeDurationMonths,
  stakeIsMatured,
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

/**
 * Cancelling returns the principal and NOTHING else — the base AP credited at
 * start is revoked with it (DOCS §18.3, `StakesService.cancel`). Nothing guarded
 * this, and the drift it allowed shipped: the cancel sheet showed a row reading
 * "Base AP kept · +N" in positive teal, directly under a paragraph in the same
 * sheet saying the AP is revoked, while the mock backend quietly kept it.
 */
describe('cancelling a stake keeps no AP (DOCS §18.3)', () => {
  const completed = { outcome: 'completed' as const, apAwarded: 1800 };
  const cancelled = { outcome: 'cancelled' as const, apAwarded: 120 };

  it('a completed stake keeps everything it was awarded', () => {
    expect(stakeApKept(completed)).toBe(1800);
  });

  it('a cancelled stake keeps none of it, however much the row still carries', () => {
    // The server never zeroes `apAwarded` on cancel, so the row arrives with the
    // base still stamped on it. Rendering that number credits the player with
    // points that were taken off their balance.
    expect(stakeApKept(cancelled)).toBe(0);
  });

  it('lifetime AP counts completed stakes only', () => {
    const history = [completed, cancelled, { outcome: 'completed' as const, apAwarded: 45 }];
    expect(history.reduce((sum, h) => sum + stakeApKept(h), 0)).toBe(1845);
  });
});

/**
 * The duration is the server's number, not one re-derived from the dates. The
 * 30-day approximation agrees with calendar months up to 12 and then stops:
 * 36 calendar months is 1096 days, and `round(1096 / 30)` is 37.
 */
describe('stake duration comes from the server', () => {
  it('prefers the stored durationMonths over the dates', () => {
    expect(
      stakeDurationMonths({
        durationMonths: 6,
        startDate: '2026-01-01T00:00:00.000Z',
        endDate: '2026-01-01T02:00:00.000Z',
      })
    ).toBe(6);
  });

  it('falls back to the dates only when the field is absent', () => {
    expect(
      stakeDurationMonths({
        startDate: '2026-01-01T00:00:00.000Z',
        endDate: '2026-07-01T00:00:00.000Z',
      })
    ).toBe(6);
  });

  it('the date fallback is exactly what drifts on a long stake', () => {
    // Kept as a statement of the known limit: 2026-01-01 → 2029-01-01.
    expect(
      stakeDurationMonths({
        startDate: '2026-01-01T00:00:00.000Z',
        endDate: '2029-01-01T00:00:00.000Z',
      })
    ).toBe(37);
    // ...which is why the server's own value has to win.
    expect(
      stakeDurationMonths({
        durationMonths: 36,
        startDate: '2026-01-01T00:00:00.000Z',
        endDate: '2029-01-01T00:00:00.000Z',
      })
    ).toBe(36);
  });
});

describe('maturity is the server’s verdict, not the device clock', () => {
  const future = new Date(Date.now() + 86_400_000).toISOString();
  const past = new Date(Date.now() - 86_400_000).toISOString();

  it('honours `matured` even when the local clock disagrees', () => {
    expect(stakeIsMatured({ matured: false, endDate: past })).toBe(false);
    expect(stakeIsMatured({ matured: true, endDate: future })).toBe(true);
  });

  it('falls back to the end date when the server did not say', () => {
    expect(stakeIsMatured({ endDate: past })).toBe(true);
    expect(stakeIsMatured({ endDate: future })).toBe(false);
  });
});

describe('nullable history fields do not corrupt the list', () => {
  const t = ((key: string) => key) as unknown as Parameters<typeof formatStakeRelative>[1];

  it('a missing completedAt does not print "NaN d ago"', () => {
    expect(formatStakeRelative(null, t)).toBe('just now');
  });

  it('a missing completedAt sorts to the bottom instead of poisoning the comparator', () => {
    expect(stakeCompletedAtMs({ completedAt: null })).toBe(0);
    expect(stakeCompletedAtMs({ completedAt: 'not a date' })).toBe(0);
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
