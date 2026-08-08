'use client';

import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { EmptyDataInfo } from '@/components/shared/EmptyDataInfo';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { GlobalConstants, type ActivityTier } from '@/constants/global.constants';
import { formatCompact } from '@/utils/global/number.utils';
import { staggerMs } from '@/utils/global/animation.utils';
import { JackpotDropRow } from './JackpotDropRow';
import type { JackpotWinner } from '@/types/interfaces/jackpot.interfaces';

export interface JackpotDropListProps {
  winners?: JackpotWinner[];
  loading?: boolean;
  /** Lifetime payout, shown beside the heading like the LC screen's totals. */
  allTimePaidOut?: number;
  /** Tier chips above the list. */
  filters?: boolean;
}

const TIERS: ActivityTier[] = ['diamond', 'platinum', 'gold', 'silver', 'bronze'];

/** Past drops in the LC history's layout: heading + totals, chips, rows. */
export function JackpotDropList({
  winners = [],
  loading,
  allTimePaidOut,
  filters = false,
}: JackpotDropListProps) {
  const t = useAppTranslations();
  const [tier, setTier] = useState<ActivityTier | 'all'>('all');

  const visible = tier === 'all' ? winners : winners.filter(winner => winner.tier === tier);
  const chips: (ActivityTier | 'all')[] = ['all', ...TIERS];

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">
          {t('recent jackpots')}
        </h3>
        {!loading && allTimePaidOut != null && (
          <span className="text-[11px] font-semibold tabular-nums text-white/45">
            {t('paid out all-time')}{' '}
            <span className="text-gold">
              {formatCompact(allTimePaidOut)} {GlobalConstants.coinName}
            </span>
          </span>
        )}
      </div>

      {filters && (
        <div className="scrollbar-hidden -mx-1 flex gap-1.5 overflow-x-auto px-1">
          {chips.map(chip => (
            <button
              key={chip}
              type="button"
              onClick={() => setTier(chip)}
              className={twMerge(
                'flex min-h-10 flex-shrink-0 items-center rounded-full px-4 text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer',
                tier === chip
                  ? 'bg-pink-gradient text-white'
                  : 'bg-background-overlay/60 text-pink-secondary border border-white/5 hover:text-white'
              )}
            >
              {chip === 'all' ? t('all') : t(chip)}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <JackpotDropRow
              key={`s-${index}`}
              loading
              className="animate-slide-in-bottom"
              style={{ animationDelay: `${staggerMs(index, 60)}ms` }}
            />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyDataInfo title={t('no jackpots yet')} description={undefined} />
      ) : (
        <div role="list" className="flex flex-col gap-2">
          {visible.map((winner, index) => (
            <JackpotDropRow
              key={winner.id}
              winner={winner}
              className="animate-slide-in-bottom"
              style={{ animationDelay: `${staggerMs(index, 60)}ms` }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
