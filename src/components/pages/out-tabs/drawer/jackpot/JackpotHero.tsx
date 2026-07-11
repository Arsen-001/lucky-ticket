'use client';

import { Trophy } from 'lucide-react';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { GlobalConstants } from '@/constants/global.constants';
import { formatCompact } from '@/utils/global/number.utils';
import { JackpotPotCounter } from './JackpotPotCounter';
import type { JackpotState } from '@/types/interfaces/jackpot.interfaces';
import '@/styles/components/jackpot.css';

interface JackpotHeroProps {
  data?: JackpotState;
  loading?: boolean;
}

/**
 * Page-scale sibling of the Home jackpot capsule: purple-gold glass plaque,
 * gold JACKPOT wordmark and slot-reel pot counter with the LC medallion.
 */
export function JackpotHero({ data, loading }: JackpotHeroProps) {
  const t = useAppTranslations();

  return (
    <div className="jackpot-hero-card relative flex flex-col items-center gap-3.5 overflow-hidden rounded-3xl px-5 py-7 text-center">
      <span aria-hidden className="jackpot-plaque-shine" />

      <span className="relative flex flex-col items-center gap-1.5">
        <span className="jackpot-title text-sm font-black uppercase leading-none tracking-[0.35em]">
          {t('jackpot')}
        </span>
        <span aria-hidden className="jackpot-title-rule-center w-28" />
      </span>

      <SkeletonSuspense
        loading={loading}
        skeleton={<Skeleton variant="line" className="h-11 w-56" />}
      >
        {data && (
          <span className="relative flex items-center justify-center gap-2.5">
            <JackpotPotCounter
              value={data.pot}
              className="jackpot-glow-gold text-gold text-[32px] font-black leading-none"
            />
            <span className="jackpot-coin flex-center h-9 w-9 flex-shrink-0 rounded-full">
              <LcLabel size={22} interactive={false} />
            </span>
          </span>
        )}
      </SkeletonSuspense>

      <p className="text-white-secondary/90 relative max-w-[16rem] text-[13px] font-medium leading-snug">
        {t('jackpot intro')}
      </p>

      <SkeletonSuspense
        loading={loading}
        skeleton={<Skeleton variant="rounded-rectangle" className="h-7 w-32" />}
      >
        {data && (
          <span className="bg-gold/10 ring-gold/25 relative inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold ring-1">
            <Trophy size={11} className="text-gold" />
            <span className="text-gold uppercase tracking-wider">{t('record')}</span>
            <span className="tabular-nums text-white">
              {formatCompact(data.record)} {GlobalConstants.coinName}
            </span>
          </span>
        )}
      </SkeletonSuspense>
    </div>
  );
}
