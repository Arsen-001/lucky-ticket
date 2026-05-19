'use client';

import { ArrowDown, ArrowUp, Minus, Trophy } from 'lucide-react';
import { BoltIcon } from '@/components/shared/icons/BoltIcon';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { formatNumber } from '@/utils/global/number.utils';
import type { LeaderboardEntry } from '@/types/interfaces/leaderboard.interfaces';

export interface LeaderboardHeroCardProps {
  myPlace?: LeaderboardEntry;
  total?: number;
  loading?: boolean;
}

export function LeaderboardHeroCard({ myPlace, total, loading }: LeaderboardHeroCardProps) {
  const t = useAppTranslations();
  const change = myPlace?.rankChange ?? 0;
  const positive = change > 0;
  const negative = change < 0;

  return (
    <div className="task-card-default relative flex items-center gap-3 overflow-hidden rounded-2xl px-3.5 py-0.5">
      <span
        aria-hidden
        className="bg-pink/10 pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-2xl"
      />

      <div className="bg-pink/15 flex-center relative h-9 w-9 flex-shrink-0 rounded-xl">
        <Trophy size={16} className="text-pink" strokeWidth={2.4} />
      </div>

      <div className="relative flex min-w-0 flex-1 items-baseline gap-1.5">
        <SkeletonSuspense
          loading={loading}
          skeleton={<Skeleton variant="line" className="h-5 w-12" />}
        >
          <span className="text-lg font-extrabold leading-none tabular-nums text-white">
            {myPlace ? `#${myPlace.place}` : '—'}
          </span>
        </SkeletonSuspense>
        {myPlace && total ? (
          <span className="text-pink-secondary truncate text-[10px] font-semibold tabular-nums">
            {t('of {total}', { total: formatNumber(total) })}
          </span>
        ) : null}
      </div>

      <div className="relative flex flex-shrink-0 items-center gap-2">
        <SkeletonSuspense
          loading={loading}
          skeleton={<Skeleton variant="line" className="h-5 w-12" />}
        >
          <span className="text-gold inline-flex items-center gap-1 text-sm font-extrabold tabular-nums">
            <BoltIcon size={48} />
            {myPlace ? formatNumber(myPlace.points) : 0}
          </span>
        </SkeletonSuspense>
        <RankChangePill loading={loading} change={change} positive={positive} negative={negative} />
      </div>
    </div>
  );
}

interface RankChangePillProps {
  loading?: boolean;
  change: number;
  positive: boolean;
  negative: boolean;
}

function RankChangePill({ loading, change, positive, negative }: RankChangePillProps) {
  const t = useAppTranslations();
  const ariaLabel = positive
    ? t('rank up by {n}', { n: change })
    : negative
      ? t('rank down by {n}', { n: Math.abs(change) })
      : t('rank unchanged');

  return (
    <SkeletonSuspense
      loading={loading}
      skeleton={<Skeleton variant="rounded-rectangle" className="h-7 w-12" />}
    >
      <span
        aria-label={ariaLabel}
        className={
          positive
            ? 'bg-success/30 text-success inline-flex items-center gap-0.5 rounded-full px-2 py-1 text-[11px] font-extrabold tabular-nums'
            : negative
              ? 'bg-error/30 text-error inline-flex items-center gap-0.5 rounded-full px-2 py-1 text-[11px] font-extrabold tabular-nums'
              : 'inline-flex items-center gap-0.5 rounded-full bg-white/15 px-2 py-1 text-[11px] font-extrabold tabular-nums text-white/70'
        }
      >
        {positive ? (
          <ArrowUp size={11} strokeWidth={3} />
        ) : negative ? (
          <ArrowDown size={11} strokeWidth={3} />
        ) : (
          <Minus size={11} strokeWidth={3} />
        )}
        {Math.abs(change)}
      </span>
    </SkeletonSuspense>
  );
}
