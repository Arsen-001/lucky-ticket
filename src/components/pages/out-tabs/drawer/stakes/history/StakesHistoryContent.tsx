'use client';

import '@/styles/components/stakes.css';
import Image from 'next/image';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { useGetStakesQuery } from '@/api/stakes.api';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { BoltIcon } from '@/components/shared/icons/BoltIcon';
import { icons } from '@/constants/icons';
import { StakesHistoryRow } from '@/components/pages/out-tabs/drawer/stakes/StakesHistoryRow';
import { formatCompact } from '@/utils/global/number.utils';
import type { StakeHistoryEntry } from '@/types/interfaces/stakes.interfaces';

type SortId = 'newest' | 'oldest' | 'highest' | 'level';

interface SortOption {
  id: SortId;
  labelKey: 'newest' | 'oldest' | 'highest yield' | 'by level';
}

const SORTS: SortOption[] = [
  { id: 'newest', labelKey: 'newest' },
  { id: 'oldest', labelKey: 'oldest' },
  { id: 'highest', labelKey: 'highest yield' },
  { id: 'level', labelKey: 'by level' },
];

const sortHistory = (history: StakeHistoryEntry[], sortBy: SortId) => {
  const copy = [...history];
  switch (sortBy) {
    case 'newest':
      return copy.sort(
        (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
      );
    case 'oldest':
      return copy.sort(
        (a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
      );
    case 'highest':
      return copy.sort((a, b) => b.yieldLC - a.yieldLC);
    case 'level':
      return copy.sort((a, b) => b.level - a.level);
  }
};

type FilterId = 'all' | 'completed' | 'cancelled';

interface FilterOption {
  id: FilterId;
  labelKey: 'all' | 'completed' | 'cancelled';
}

const FILTERS: FilterOption[] = [
  { id: 'all', labelKey: 'all' },
  { id: 'completed', labelKey: 'completed' },
  { id: 'cancelled', labelKey: 'cancelled' },
];

const matchesFilter = (entry: StakeHistoryEntry, filter: FilterId) =>
  filter === 'all' ? true : entry.outcome === filter;

export function StakesHistoryContent() {
  const t = useAppTranslations();
  const { data: stakes, isLoading } = useGetStakesQuery();
  const [filter, setFilter] = useState<FilterId>('all');
  const [sortBy, setSortBy] = useState<SortId>('newest');

  const allHistory = stakes ? sortHistory(stakes.history, sortBy) : [];
  const visible = allHistory.filter(entry => matchesFilter(entry, filter));

  const counts = {
    all: allHistory.length,
    completed: allHistory.filter(e => e.outcome === 'completed').length,
    cancelled: allHistory.filter(e => e.outcome === 'cancelled').length,
  };

  const totals = allHistory.reduce(
    (acc, h) => ({
      lc: acc.lc + h.yieldLC,
      stars: acc.stars + h.bonusLS,
      ap: acc.ap + h.apAwarded,
    }),
    { lc: 0, stars: 0, ap: 0 }
  );

  return (
    <div className="flex flex-col gap-4 pb-8">
      <SkeletonSuspense loading={isLoading} skeleton={<Skeleton className="h-20 rounded-2xl" />}>
        {allHistory.length > 0 && (
          <div
            className="stake-card-shell stake-card-border relative px-4 py-3"
            style={{
              background:
                'radial-gradient(circle at 100% 0%, rgba(222,0,155,0.18) 0%, transparent 50%),' +
                'linear-gradient(135deg, #332247 0%, #1F1B38 60%, #151F35 100%)',
            }}
          >
            <div className="text-pink-secondary text-[9px] font-bold uppercase tracking-wider">
              {t('lifetime totals')}
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2.5">
              <div className="flex flex-col gap-0.5">
                <span className="text-gold inline-flex items-center gap-1 text-[15px] font-extrabold tabular-nums">
                  +{formatCompact(totals.lc)}
                  <LcLabel size={12} />
                </span>
                <span className="text-pink-secondary text-[9px] font-semibold uppercase tracking-wider">
                  {t('earned')}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-gold inline-flex items-center gap-1 text-[15px] font-extrabold tabular-nums">
                  +{totals.stars.toLocaleString()}
                  <Image src={icons.telegramStar} alt="" className="h-3 w-auto" />
                </span>
                <span className="text-pink-secondary text-[9px] font-semibold uppercase tracking-wider">
                  {t('stars')}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-teal inline-flex items-center gap-1 text-[15px] font-extrabold tabular-nums">
                  <BoltIcon size={13} />+{totals.ap.toLocaleString()}
                </span>
                <span className="text-pink-secondary text-[9px] font-semibold uppercase tracking-wider">
                  AP
                </span>
              </div>
            </div>
          </div>
        )}
      </SkeletonSuspense>

      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-2 overflow-x-auto scrollbar-hidden">
          {FILTERS.map(({ id, labelKey }) => {
            const active = filter === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setFilter(id)}
                className={twMerge(
                  'flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-wider transition-colors',
                  active
                    ? 'border-electric-pink/40 bg-electric-pink/15 text-white'
                    : 'border-white/10 bg-background-overlay text-white-secondary'
                )}
              >
                <span>{t(labelKey)}</span>
                <span
                  className={twMerge(
                    'rounded-full px-1.5 text-[10px] font-bold tabular-nums',
                    active ? 'bg-electric-pink/30 text-white' : 'bg-white/10 text-white/70'
                  )}
                >
                  {counts[id]}
                </span>
              </button>
            );
          })}
        </div>

        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as SortId)}
          aria-label={t('sort by')}
          className="text-white-secondary shrink-0 rounded-full border border-white/10 bg-background-overlay px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider"
        >
          {SORTS.map(({ id, labelKey }) => (
            <option key={id} value={id} className="bg-background">
              {t(labelKey)}
            </option>
          ))}
        </select>
      </div>

      <SkeletonSuspense
        loading={isLoading}
        skeleton={
          <div className="flex flex-col gap-2">
            <Skeleton className="h-14 rounded-xl" />
            <Skeleton className="h-14 rounded-xl" />
            <Skeleton className="h-14 rounded-xl" />
            <Skeleton className="h-14 rounded-xl" />
          </div>
        }
      >
        {visible.length === 0 ? (
          <p className="text-pink-secondary py-8 text-center text-[12px]">
            {filter === 'all'
              ? t('no completed stakes yet')
              : filter === 'completed'
                ? t('no completed stakes yet')
                : t('no cancelled stakes')}
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {visible.map(entry => (
              <StakesHistoryRow key={entry.id} entry={entry} levels={stakes?.levels ?? []} />
            ))}
          </div>
        )}
      </SkeletonSuspense>
    </div>
  );
}
