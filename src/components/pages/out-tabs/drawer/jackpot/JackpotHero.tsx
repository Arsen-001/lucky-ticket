'use client';

import { Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { GlobalConstants } from '@/constants/global.constants';
import { formatCompact } from '@/utils/global/number.utils';
import { JackpotPotCounter } from './JackpotPotCounter';
import type { JackpotState } from '@/types/interfaces/jackpot.interfaces';

interface JackpotHeroProps {
  data?: JackpotState;
  loading?: boolean;
}

export function JackpotHero({ data, loading }: JackpotHeroProps) {
  const t = useAppTranslations();

  return (
    <div className="card-outlined relative flex flex-col items-center gap-3 overflow-hidden rounded-3xl px-5 py-7 text-center">
      <span
        aria-hidden
        className="bg-electric-pink/20 pointer-events-none absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full blur-3xl"
      />
      <span
        aria-hidden
        className="bg-electric-purple/20 pointer-events-none absolute -bottom-20 -right-10 h-44 w-44 rounded-full blur-3xl"
      />

      <span className="text-electric-pink relative inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.2em]">
        <Sparkles size={14} strokeWidth={2.6} />
        {t('jackpot')}
      </span>

      <SkeletonSuspense
        loading={loading}
        skeleton={<Skeleton variant="line" className="h-11 w-56" />}
      >
        {data && (
          <span className="relative flex items-end justify-center gap-1.5">
            <JackpotPotCounter
              value={data.pot}
              accrualPerSecond={data.accrualPerSecond}
              className="jackpot-glow text-[40px] font-black leading-none text-white sm:text-5xl"
            />
            <span className="text-pink-secondary mb-1 text-sm font-extrabold">
              {GlobalConstants.coinName}
            </span>
          </span>
        )}
      </SkeletonSuspense>

      <p className="text-white-secondary relative max-w-[16rem] text-[13px] font-medium leading-snug">
        {t('jackpot intro')}
      </p>

      <SkeletonSuspense
        loading={loading}
        skeleton={<Skeleton variant="rounded-rectangle" className="h-7 w-32" />}
      >
        {data && (
          <span className="relative inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-[11px] font-bold">
            <span className="text-pink-secondary uppercase tracking-wider">{t('record')}</span>
            <span className="tabular-nums text-white">
              {formatCompact(data.record)} {GlobalConstants.coinName}
            </span>
          </span>
        )}
      </SkeletonSuspense>
    </div>
  );
}
