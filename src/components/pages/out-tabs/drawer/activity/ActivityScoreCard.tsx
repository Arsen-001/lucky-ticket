'use client';

import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { Medal } from '@/components/shared/icons/Medal';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { formatNumber } from '@/utils/global/number.utils';
import type { ActivityTier } from '@/constants/global.constants';

export interface ActivityScoreCardProps {
  tier: ActivityTier;
  activityPoints?: number;
  /** The line under the number — where the LC card spends "≈ $1.60". */
  subline?: ReactNode;
  /** Chip on the right of the header row (pace, decay, …). */
  chip?: ReactNode;
  /** Bands stacked under the number: ladder, gate, decay, actions. */
  children?: ReactNode;
  loading?: boolean;
  className?: string;
}

/**
 * The AP score in the LC wallet's card language: one dark object with a
 * hairline in the player's tier colour, the number painted in that same colour
 * and bands stacked under it. Same shell as the balance and the jackpot cards,
 * so the app's three big numbers read as one family.
 *
 * The accent is the tier's own colour rather than gold: on this screen the tier
 * IS the subject, and a gold card would say "gold tier" to a bronze player.
 */
export function ActivityScoreCard({
  tier,
  activityPoints = 0,
  subline,
  chip,
  children,
  loading,
  className,
}: ActivityScoreCardProps) {
  const t = useAppTranslations();
  const accent = `var(--color-${tier})`;

  return (
    <div
      className={twMerge('relative overflow-hidden rounded-3xl border bg-[#171430]', className)}
      style={{
        borderColor: `color-mix(in srgb, ${accent} 28%, transparent)`,
        boxShadow: '0 14px 34px rgba(0,0,0,0.45)',
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full"
        style={{
          background: `radial-gradient(circle, color-mix(in srgb, ${accent} 24%, transparent) 0%, rgba(163,33,131,0.14) 45%, transparent 72%)`,
        }}
      />
      {/* Watermark, not illustration: at full strength the medal reads as a
          second subject and the header chip lands on top of it. */}
      <Medal
        type={tier}
        width={130}
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 opacity-[0.07]"
      />

      <div className="relative px-5 pb-4 pt-5">
        <div className="flex items-center gap-2">
          <Medal type={tier} width={16} aria-hidden />
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/60">
            {t('activity points')}
          </span>
          {chip && <span className="ml-auto">{chip}</span>}
        </div>

        <SkeletonSuspense
          loading={loading}
          skeleton={<Skeleton variant="line" className="mt-3 h-9 w-44" />}
        >
          <div className="mt-2.5 flex items-baseline gap-2">
            <span
              className="text-[34px] font-extrabold leading-none tabular-nums"
              style={{
                // The tier ramp, built from the tier's own colour so every tier
                // gets the same light→base→dark paint the gold number has.
                backgroundImage: `linear-gradient(180deg, color-mix(in srgb, ${accent} 45%, white) 0%, ${accent} 62%, color-mix(in srgb, ${accent} 62%, black) 100%)`,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: `drop-shadow(0 2px 8px color-mix(in srgb, ${accent} 30%, transparent))`,
              }}
            >
              {formatNumber(activityPoints)}
            </span>
            <span
              className="text-sm font-extrabold uppercase tracking-wider"
              style={{ color: `color-mix(in srgb, ${accent} 70%, transparent)` }}
            >
              {t('ap')}
            </span>
          </div>
        </SkeletonSuspense>

        {subline && (
          <span className="mt-1 block text-[11.5px] font-semibold text-white/55">{subline}</span>
        )}
      </div>

      {children}
    </div>
  );
}
