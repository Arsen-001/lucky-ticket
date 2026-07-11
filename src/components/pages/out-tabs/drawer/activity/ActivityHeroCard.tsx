'use client';

import { UserPlus } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import {
  GlobalConstants,
  activityTierOrder,
  computeActivityTier,
  computeNextTierReferralGap,
  computeNextTierThreshold,
} from '@/constants/global.constants';
import { Medal } from '@/components/shared/icons/Medal';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { formatCompact } from '@/utils/global/number.utils';

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

      <div className="flex flex-col">
        <div className="relative">
          <div className="h-2 overflow-hidden rounded-full bg-white/8">
            <div
              className="h-full rounded-full transition-[width] duration-700"
              style={{ width: `${fillPercent}%`, background: accent }}
            />
          </div>
          <div className="pointer-events-none absolute inset-0 flex items-center">
            {activityTierOrder.map((stopTier, idx) => {
              const stopAccent = `var(--color-${stopTier})`;
              const reached = idx <= tierIdx;
              const isCurrent = idx === tierIdx;
              return (
                <div key={stopTier} className="flex-center flex-1">
                  <div
                    className={twMerge(
                      'flex-center rounded-full transition-all',
                      isCurrent ? 'h-[54px] w-[54px]' : 'h-7 w-7'
                    )}
                    style={{
                      background: isCurrent
                        ? `radial-gradient(circle, color-mix(in srgb, ${stopAccent} 45%, transparent) 0%, color-mix(in srgb, ${stopAccent} 12%, transparent) 60%, transparent 100%)`
                        : reached
                          ? `radial-gradient(circle, color-mix(in srgb, ${stopAccent} 22%, transparent) 0%, transparent 70%)`
                          : 'color-mix(in srgb, var(--color-background) 85%, black)',
                      border: !reached
                        ? '1px solid color-mix(in srgb, white 14%, transparent)'
                        : undefined,
                      boxShadow: isCurrent
                        ? `0 0 20px color-mix(in srgb, ${stopAccent} 60%, transparent)`
                        : undefined,
                    }}
                  >
                    <Medal
                      type={stopTier}
                      width={isCurrent ? 45 : 22}
                      style={{
                        filter: reached ? undefined : 'grayscale(85%) brightness(0.55)',
                        opacity: reached ? 1 : 0.5,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-10 flex">
          {activityTierOrder.map((stopTier, idx) => {
            const threshold = GlobalConstants.apTierThresholds[stopTier];
            const stopAccent = `var(--color-${stopTier})`;
            const reached = idx <= tierIdx;
            const isCurrent = idx === tierIdx;
            return (
              <div key={stopTier} className="flex flex-1 flex-col items-center gap-0.5">
                <span
                  className="text-[9px] font-extrabold uppercase leading-none tracking-wider"
                  style={{
                    color: isCurrent ? stopAccent : reached ? 'white' : 'rgba(255,255,255,0.42)',
                  }}
                >
                  {t(stopTier)}
                </span>
                <span
                  className={twMerge(
                    'text-[10px] leading-none tabular-nums',
                    isCurrent && 'font-bold'
                  )}
                  style={{ color: isCurrent ? stopAccent : 'rgba(255,255,255,0.42)' }}
                >
                  {threshold === 0 ? '0' : formatCompact(threshold)}
                </span>
                {GlobalConstants.tierReferralRequirements[stopTier] > 0 && (
                  <span
                    className={twMerge(
                      'flex items-center gap-0.5 text-[9px] leading-none tabular-nums',
                      isCurrent && 'font-bold'
                    )}
                    style={{ color: isCurrent ? stopAccent : 'rgba(255,255,255,0.42)' }}
                  >
                    <UserPlus size={8} strokeWidth={2.5} />
                    {GlobalConstants.tierReferralRequirements[stopTier]}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

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
    </section>
  );
}
