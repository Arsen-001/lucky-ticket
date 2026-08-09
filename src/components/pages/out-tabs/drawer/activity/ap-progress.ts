import {
  GlobalConstants,
  activityTierOrder,
  computeActivityTier,
  computeDailyBaselineAp,
  computeNextTierThreshold,
  type ActivityTier,
} from '@/constants/global.constants';
import { computeApDecay, computeTierGap, type ApDecayInfo } from '@/utils/global/activity.utils';

export interface ApProgress {
  tier: ActivityTier;
  tierIdx: number;
  /** null once Diamond is reached. */
  nextTier: ActivityTier | null;
  /** AP still missing for the next tier (0 = that half of the gate is met). */
  apGap: number;
  /** Friends still missing for the next tier (0 = that half is met). */
  refGap: number;
  /** 0–100 progress along the current leg, clamped at both ends. */
  legPercent: number;
  /** Approximate AP/day at this tier without donation. */
  dailyBaseline: number;
  decay: ApDecayInfo;
}

/**
 * Everything the AP screen needs about where the player stands, derived once.
 *
 * `apGap` and `refGap` are kept apart on purpose. The shipped hero prints
 * "0 AP to Platinum" to a player holding 18,500 AP whose only blocker is three
 * missing friends — the AP half of the gate was met long ago, and stating the
 * gap as one number is what makes that line read as nonsense.
 */
export const computeApProgress = (
  activityPoints: number,
  referralsCount: number,
  lastActivityAt?: string
): ApProgress => {
  const tier = computeActivityTier(activityPoints, referralsCount);
  const tierIdx = activityTierOrder.indexOf(tier);
  const nextThreshold = computeNextTierThreshold(activityPoints, referralsCount);
  const nextTier = nextThreshold !== null ? activityTierOrder[tierIdx + 1] : null;
  const gap = nextTier
    ? computeTierGap(activityPoints, referralsCount, nextTier)
    : { apGap: 0, refGap: 0 };

  const floor = GlobalConstants.apTierThresholds[tier];
  const legPercent =
    nextThreshold === null
      ? 100
      : Math.min(100, Math.max(0, ((activityPoints - floor) / (nextThreshold - floor)) * 100));

  return {
    tier,
    tierIdx,
    nextTier,
    apGap: gap.apGap,
    refGap: gap.refGap,
    legPercent,
    dailyBaseline: computeDailyBaselineAp(activityPoints, referralsCount),
    decay: computeApDecay(lastActivityAt, activityPoints, referralsCount),
  };
};
