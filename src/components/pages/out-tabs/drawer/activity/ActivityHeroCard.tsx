'use client';

import { useAppTranslations } from '@/hooks/useAppTranslations';
import {
  GlobalConstants,
  activityTierOrder,
  computeActivityTier,
  computeNextTierThreshold,
} from '@/constants/global.constants';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';

export interface ActivityHeroCardProps {
  activityPoints?: number;
  loading?: boolean;
}

export function ActivityHeroCard({ activityPoints = 0, loading }: ActivityHeroCardProps) {
  const t = useAppTranslations();
  const tier = computeActivityTier(activityPoints);
  const accent = `var(--color-${tier})`;
  const tierFloor = GlobalConstants.apTierThresholds[tier];
  const nextThreshold = computeNextTierThreshold(activityPoints);
  const next =
    nextThreshold !== null
      ? {
          threshold: nextThreshold,
          tier: activityTierOrder[activityTierOrder.indexOf(tier) + 1],
          progressPct: Math.min(
            100,
            Math.round(((activityPoints - tierFloor) / (nextThreshold - tierFloor)) * 100)
          ),
          remaining: nextThreshold - activityPoints,
        }
      : null;

  return (
    <section className="bg-background-overlay flex flex-col gap-4 rounded-2xl p-5">
      <div className="flex items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-pink-secondary text-[10px] font-bold uppercase tracking-wider">
            {t('activity points')}
          </span>
          <SkeletonSuspense
            loading={loading}
            skeleton={<Skeleton variant="line" textSize="3xl" className="w-32" />}
          >
            <span className="text-4xl font-black leading-none tabular-nums text-white">
              {activityPoints.toLocaleString()}
            </span>
          </SkeletonSuspense>
        </div>
        <span
          className="flex items-center rounded-full border px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider"
          style={{
            color: accent,
            borderColor: `color-mix(in srgb, ${accent} 50%, transparent)`,
            backgroundColor: `color-mix(in srgb, ${accent} 14%, transparent)`,
          }}
        >
          {t(tier)}
        </span>
      </div>

      {next ? (
        <div className="flex flex-col gap-1.5">
          <div className="h-2 overflow-hidden rounded-full bg-white/8">
            <div
              className="h-full rounded-full transition-[width] duration-500"
              style={{ width: `${next.progressPct}%`, background: accent }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-semibold">
            <span className="tabular-nums text-white/55">
              {activityPoints.toLocaleString()} / {next.threshold.toLocaleString()}
            </span>
            <span style={{ color: accent }}>
              {t('{n} AP to {tier}', { n: next.remaining.toLocaleString(), tier: t(next.tier) })}
            </span>
          </div>
        </div>
      ) : (
        <div className="text-[12px] font-bold" style={{ color: accent }}>
          {t('max tier reached')}
        </div>
      )}
    </section>
  );
}
