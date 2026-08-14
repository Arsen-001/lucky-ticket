'use client';

import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { CoinIcon } from '@/components/shared/icons/CoinIcon';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useJackpotDisplayConfig } from '@/hooks/useJackpotDisplayConfig';
import { GlobalConstants } from '@/constants/global.constants';
import { formatNumber } from '@/utils/global/number.utils';

export interface JackpotPotCardProps {
  pot?: number;
  loading?: boolean;
  /** Chip on the right of the header row (record, last drop, …). */
  chip?: ReactNode;
  /** Bands stacked under the number: chart, split, actions. */
  children?: ReactNode;
  className?: string;
}

/**
 * The pot in the LC wallet's card language: one dark object with a gold
 * hairline, a gold-gradient number and bands stacked under it. Same shell as
 * the balance card so the two currencies' screens read as one family.
 */
export function JackpotPotCard({ pot, loading, chip, children, className }: JackpotPotCardProps) {
  const t = useAppTranslations();
  const jackpot = useJackpotDisplayConfig();

  return (
    <div
      className={twMerge(
        'border-gold/25 relative overflow-hidden rounded-3xl border bg-[#171430]',
        className
      )}
      style={{ boxShadow: '0 14px 34px rgba(0,0,0,0.45)' }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(248,189,62,0.22) 0%, rgba(163,33,131,0.14) 45%, transparent 72%)',
        }}
      />
      <CoinIcon
        size={150}
        className="pointer-events-none absolute -right-8 -top-8 opacity-[0.09]"
      />

      <div className="relative px-5 pb-4 pt-5">
        <div className="flex items-center gap-2">
          <CoinIcon size={16} />
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/60">
            {t('total pot')}
          </span>
          {chip && <span className="ms-auto">{chip}</span>}
        </div>

        <SkeletonSuspense
          loading={loading}
          skeleton={<Skeleton variant="line" className="mt-3 h-9 w-44" />}
        >
          <div className="mt-2.5 flex items-baseline gap-2">
            <span
              className="text-[34px] font-extrabold leading-none tabular-nums"
              style={{
                backgroundImage: 'linear-gradient(180deg, #FFE9AF 0%, #F8BD3E 62%, #C1861A 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 2px 8px rgba(248,189,62,0.28))',
              }}
            >
              {formatNumber(pot ?? 0)}
            </span>
            <span className="text-gold/70 text-sm font-extrabold uppercase tracking-wider">
              {GlobalConstants.coinName}
            </span>
          </div>
        </SkeletonSuspense>

        {/* Where the LC card shows the dollar value. A pot of 481K LC converts
            to "$0.48", which reads as a joke under a six-figure number — the
            fact worth the slot is where the money comes from. */}
        <span className="mt-1 block text-[11.5px] font-semibold text-white/55">
          {t('{percent}% of the pool feeds the jackpot', { percent: jackpot.accrualPercent })}
        </span>
      </div>

      {children}
    </div>
  );
}
