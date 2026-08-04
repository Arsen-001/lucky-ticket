'use client';

import { useAppTranslations } from '@/hooks/useAppTranslations';
import {
  GlobalConstants,
  activityTierOrder,
  computeActivityTier,
  computeNextTierReferralGap,
  computeNextTierThreshold,
} from '@/constants/global.constants';
import { ActivityTierLadder } from '@/components/pages/out-tabs/drawer/activity/ActivityTierLadder';
import { ActivityTierLadderSkeleton } from '@/components/pages/out-tabs/drawer/activity/ActivityTierLadderSkeleton';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';

export interface ActivityHeroCardProps {
  activityPoints?: number;
  referralsCount?: number;
  loading?: boolean;
}

export function ActivityHeroCard({
  activityPoints = 0,
  referralsCount = 0,
  loading,
}: ActivityHeroCardProps) {
  const t = useAppTranslations();
  const tier = computeActivityTier(activityPoints, referralsCount);
  const accent = `var(--color-${tier})`;
  const tierIdx = activityTierOrder.indexOf(tier);
  const nextThreshold = computeNextTierThreshold(activityPoints, referralsCount);
  const nextTier = nextThreshold !== null ? activityTierOrder[tierIdx + 1] : null;
  const remainingToNext = nextThreshold !== null ? Math.max(0, nextThreshold - activityPoints) : 0;
  const referralGap = computeNextTierReferralGap(activityPoints, referralsCount);

  // Each tier sits in the centre of one of 5 equal columns (space-around),
  // so medal centres land at 10/30/50/70/90 %. The bar fill is interpolated
  // along those same positions to stay visually anchored to the medals.
  const columnCenterPercent = (idx: number) => ((idx + 0.5) / activityTierOrder.length) * 100;

  let fillPercent: number;
  if (nextThreshold === null) {
    fillPercent = columnCenterPercent(tierIdx);
  } else {
    const floor = GlobalConstants.apTierThresholds[tier];
    const currentPos = columnCenterPercent(tierIdx);
    const nextPos = columnCenterPercent(tierIdx + 1);
    // Clamp: with the referral gate a player can hold more AP than the next
    // threshold while still locked — the bar must not overshoot the medal.
    const segmentProgress = Math.min(
      1,
      Math.max(0, (activityPoints - floor) / (nextThreshold - floor))
    );
    fillPercent = currentPos + segmentProgress * (nextPos - currentPos);
  }

  return (
    <section
      className="relative flex flex-col gap-5 overflow-hidden rounded-2xl border p-5"
      style={{
        background: `radial-gradient(circle at 50% 0%, color-mix(in srgb, ${accent} 28%, transparent) 0%, transparent 55%), radial-gradient(circle at 100% 100%, color-mix(in srgb, ${accent} 14%, transparent) 0%, transparent 50%), linear-gradient(160deg, color-mix(in srgb, ${accent} 6%, var(--color-background-overlay)) 0%, var(--color-background-overlay) 100%)`,
        borderColor: `color-mix(in srgb, ${accent} 30%, transparent)`,
      }}
    >
      <div className="flex flex-col items-center gap-2">
        <span className="text-pink-secondary text-[10px] font-bold uppercase tracking-[0.2em]">
          {t('activity points')}
        </span>
        <SkeletonSuspense
          loading={loading}
          skeleton={<Skeleton variant="line" textSize="5xl" className="w-40" />}
        >
          <span
            className="text-5xl font-black leading-none tabular-nums"
            style={{
              color: accent,
              textShadow: `0 0 24px color-mix(in srgb, ${accent} 45%, transparent)`,
            }}
          >
            {activityPoints.toLocaleString()}
          </span>
        </SkeletonSuspense>
      </div>

      <SkeletonSuspense loading={loading} skeleton={<ActivityTierLadderSkeleton />}>
        <ActivityTierLadder tierIdx={tierIdx} fillPercent={fillPercent} accent={accent} />
      </SkeletonSuspense>

      {/* Skeletoned with the ladder: on 0 AP this line reads "500 AP to silver"
          for everyone, which is a wrong number, not a neutral placeholder. */}
      <SkeletonSuspense
        loading={loading}
        skeleton={<Skeleton variant="line" className="mx-auto h-3 w-44" />}
      >
        {nextThreshold !== null && nextTier ? (
          <div
            className="flex flex-col gap-0.5 text-center text-[11px] font-bold"
            style={{ color: accent }}
          >
            <span>
              {t('{n} AP to {tier}', {
                n: remainingToNext.toLocaleString(),
                tier: t(nextTier),
              })}
            </span>
            {referralGap > 0 && (
              <span className="text-white-secondary font-semibold">
                {t('and invite {n} more friends', { n: referralGap })}
              </span>
            )}
          </div>
        ) : (
          <div className="text-center text-[12px] font-bold" style={{ color: accent }}>
            {t('max tier reached')}
          </div>
        )}
      </SkeletonSuspense>
    </section>
  );
}
