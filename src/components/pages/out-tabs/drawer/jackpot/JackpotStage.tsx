'use client';

import { LcLabel } from '@/components/shared/icons/LcLabel';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { GlobalConstants } from '@/constants/global.constants';
import { formatCompact } from '@/utils/global/number.utils';
import { getTimeAgo } from '@/utils/global/jackpot.utils';
import { JackpotPotCounter } from './JackpotPotCounter';
import type { JackpotState, JackpotWinner } from '@/types/interfaces/jackpot.interfaces';
import '@/styles/components/jackpot.css';

interface JackpotStageProps {
  data?: JackpotState;
  loading?: boolean;
  /** Most recent drop — the proof line under the pot. */
  lastDrop?: JackpotWinner;
}

/**
 * The whole first screen: the pot as the only object on a lit stage, and
 * directly under it the one fact that makes the number credible — that the pot
 * actually drops, how much and how recently. The proof used to sit at the very
 * bottom of the page, under three explainer cards nobody scrolled to.
 */
export function JackpotStage({ data, loading, lastDrop }: JackpotStageProps) {
  const t = useAppTranslations();
  const ago = lastDrop ? getTimeAgo(lastDrop.wonAt) : null;

  return (
    <section className="jackpot-stage jackpot-stage-rays relative -mx-5 -mt-3 flex flex-col items-center justify-center gap-4 overflow-hidden px-6 pb-9 pt-11 text-center">
      <span className="text-gold/70 relative text-[10px] font-bold uppercase tracking-[0.45em]">
        {t('total pot')}
      </span>

      <SkeletonSuspense
        loading={loading}
        skeleton={<Skeleton variant="line" className="h-14 w-64" />}
      >
        {data && (
          <span className="relative flex items-center justify-center gap-3">
            <JackpotPotCounter
              value={data.pot}
              // Solid gold, no gradient and no glow: every odometer digit sits
              // in its own `contain: paint` cell, which blocks a
              // background-clip:text gradient (the number renders invisible)
              // and clips a text-shadow halo to the cell edge (faint boxes).
              className="jackpot-digits-plain text-gold text-[46px] font-black leading-none"
            />
            <LcLabel size={28} interactive={false} />
          </span>
        )}
      </SkeletonSuspense>

      <p className="text-white-secondary/90 relative max-w-[17rem] text-[13px] font-medium leading-snug">
        {t('jackpot intro')}
      </p>

      <SkeletonSuspense
        loading={loading}
        skeleton={<Skeleton variant="rounded-rectangle" className="h-8 w-52 rounded-full" />}
      >
        {lastDrop && (
          <span className="jackpot-proof relative inline-flex items-center gap-2 rounded-full px-3.5 py-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/45">
              {t('last drop')}
            </span>
            <span className="text-[13px] font-extrabold tabular-nums text-white">
              {formatCompact(lastDrop.potTotal)} {GlobalConstants.coinName}
            </span>
            <span className="text-[11px] font-semibold text-white/40">
              {ago && (ago.key === 'just now' ? t('just now') : t(ago.key, { n: ago.n }))}
            </span>
          </span>
        )}
      </SkeletonSuspense>
    </section>
  );
}
