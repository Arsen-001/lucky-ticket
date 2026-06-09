'use client';

import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { GlobalConstants } from '@/constants/global.constants';
import { formatCompact } from '@/utils/global/number.utils';
import { JackpotWinnerRow } from './JackpotWinnerRow';
import type { JackpotWinner } from '@/types/interfaces/jackpot.interfaces';

interface JackpotWinnersFeedProps {
  winners?: JackpotWinner[];
  loading?: boolean;
  /** Lifetime sum of every jackpot ever paid out (LC) — shown above the feed. */
  allTimePaidOut?: number;
}

export function JackpotWinnersFeed({ winners, loading, allTimePaidOut }: JackpotWinnersFeedProps) {
  const t = useAppTranslations();
  const items = loading ? (new Array(5).fill(undefined) as (JackpotWinner | undefined)[]) : winners;

  return (
    <section className="flex flex-col gap-2.5">
      <div className="flex flex-col gap-0.5 px-1">
        <h2 className="text-sm font-bold text-white">{t('recent jackpots')}</h2>
        <SkeletonSuspense
          loading={allTimePaidOut == null}
          skeleton={<Skeleton variant="line" textSize="xs" className="h-3 w-44" />}
        >
          {allTimePaidOut != null && (
            <p className="text-white-secondary text-[11px] font-semibold">
              {t('paid out all-time')}{' '}
              <span className="tabular-nums font-bold text-white">
                {formatCompact(allTimePaidOut)} {GlobalConstants.coinName}
              </span>
            </p>
          )}
        </SkeletonSuspense>
      </div>

      {!loading && (!winners || winners.length === 0) ? (
        <div className="bg-background-overlay rounded-2xl border border-white/5 px-4 py-8 text-center">
          <p className="text-white-secondary text-[13px] font-medium">{t('no jackpots yet')}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2" role="list">
          {items?.map((winner, index) => (
            <JackpotWinnerRow
              key={winner?.id ?? `s-${index}`}
              winner={winner}
              loading={loading}
              className="animate-slide-in-bottom"
              style={{ animationDelay: `${Math.min(index, 12) * 60}ms` }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
