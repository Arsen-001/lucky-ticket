'use client';

import { useMemo, useState } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { EmptyDataInfo } from '@/components/shared/EmptyDataInfo';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { StarsTransactionFilter } from '@/types/enums/stars.enums';
import { StarsTransactionRow } from './StarsTransactionRow';
import { formatCompact, formatNumber } from '@/utils/global/number.utils';
import { groupLedgerByDay, ledgerDayLabel, ledgerDayNet } from '@/utils/global/ledger.utils';
import {
  filterStarsTransactions,
  starsAsLedger,
  starsLedgerTotals,
} from '@/utils/pages/stars.utils';
import { staggerMs } from '@/utils/global/animation.utils';
import type { StarsTransaction } from '@/types/interfaces/stars.interfaces';

const FILTERS: StarsTransactionFilter[] = [
  StarsTransactionFilter.ALL,
  StarsTransactionFilter.EARN,
  StarsTransactionFilter.SPEND,
];

const PAGE_SIZE = 20;

export interface StarsTransactionHistoryProps {
  transactions?: StarsTransaction[];
  loading?: boolean;
}

export function StarsTransactionHistory({
  transactions = [],
  loading,
}: StarsTransactionHistoryProps) {
  const t = useAppTranslations();
  const [filter, setFilter] = useState<StarsTransactionFilter>(StarsTransactionFilter.ALL);
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () => filterStarsTransactions(transactions, filter),
    [transactions, filter]
  );
  const visible = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < filtered.length;
  // How many rows sit behind each chip, so a tap on «Spent» is an informed one
  // — an empty list after the tap reads as a broken filter, not as "nothing
  // spent yet".
  const counts = useMemo(
    () =>
      FILTERS.reduce<Record<string, number>>(
        (acc, f) => ({ ...acc, [f]: filterStarsTransactions(transactions, f).length }),
        {}
      ),
    [transactions]
  );
  const totals = useMemo(() => starsLedgerTotals(transactions), [transactions]);

  // The entry stagger counts rows across the whole list, not within a day —
  // otherwise every day header restarts the animation and the page ripples in
  // steps. Offsets are precomputed rather than accumulated during render.
  const days = groupLedgerByDay(visible).reduce<
    { key: string; rows: StarsTransaction[]; offset: number }[]
  >((acc, day) => {
    const previous = acc.at(-1);
    const offset = previous ? previous.offset + previous.rows.length : 0;
    return [...acc, { key: day.key, rows: day.rows, offset }];
  }, []);

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">
          {t('recent activity')}
        </h3>
        {/* What the rows on screen add up to, both ways — the same pair the LC
            ledger prints, and the one number a list of movements cannot show. */}
        {!loading && transactions.length > 0 && (
          <span className="flex items-center gap-2.5 text-[11px] font-bold tabular-nums">
            <span className="text-success inline-flex items-center gap-1">
              <TrendingUp size={12} strokeWidth={3} />+{formatCompact(totals.earned)}
            </span>
            <span className="text-error-text inline-flex items-center gap-1">
              <TrendingDown size={12} strokeWidth={3} />−{formatCompact(totals.spent)}
            </span>
          </span>
        )}
      </div>

      {/* py/-my so the 44px hit zone is not clipped by the strip: `overflow-x`
          computes `overflow-y: auto` alongside it. Nothing moves on screen. */}
      <div className="scrollbar-hidden -mx-1 -my-[7px] flex gap-1.5 overflow-x-auto px-1 py-[7px]">
        {FILTERS.map(f => (
          <button
            key={f}
            type="button"
            onClick={() => {
              setFilter(f);
              setPage(1);
            }}
            className={twMerge(
              'tap-target relative flex-shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer',
              filter === f
                ? 'bg-pink-gradient text-white'
                : 'bg-background-overlay/60 text-pink-secondary hover:text-white border border-white/5'
            )}
          >
            <span className="inline-flex items-center gap-1.5">
              {t(`stars filter ${f}`)}
              {!loading && (
                <span
                  className={twMerge(
                    'rounded-full px-1.5 py-0.5 text-[10px] font-extrabold tabular-nums',
                    filter === f ? 'bg-white/25 text-white' : 'bg-white/10 text-white/70'
                  )}
                >
                  {counts[f] ?? 0}
                </span>
              )}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <StarsTransactionRow
              key={`s-${index}`}
              loading
              className="animate-slide-in-bottom"
              style={{ animationDelay: `${staggerMs(index, 60)}ms` }}
            />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyDataInfo description={t('no stars transactions yet')} />
      ) : (
        <div role="list" className="flex flex-col gap-3">
          {days.map(({ key, rows, offset }) => {
            const net = ledgerDayNet(starsAsLedger(rows));

            return (
              <div key={key} className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between gap-2 px-1">
                  <span className="text-white-secondary text-[11px] font-extrabold uppercase tracking-wider">
                    {ledgerDayLabel(key, t)}
                  </span>
                  {/* The running balance every row used to repeat, kept once per
                      day where it still answers "and then I had". */}
                  <span className="text-pink-secondary text-[10.5px] font-semibold tabular-nums">
                    <span className={net >= 0 ? 'text-success' : 'text-error-text'}>
                      {net >= 0 ? '+' : '−'}
                      {formatNumber(Math.abs(net))}
                    </span>
                    {' · '}
                    {formatNumber(rows[0]?.balanceAfter ?? 0)}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  {rows.map((tx, index) => (
                    <StarsTransactionRow
                      key={tx.id}
                      transaction={tx}
                      className="animate-slide-in-bottom"
                      style={{ animationDelay: `${staggerMs(offset + index, 40)}ms` }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {hasMore && !loading && (
        <button
          type="button"
          onClick={() => setPage(p => p + 1)}
          className="bg-background-overlay/60 text-pink-secondary hover:text-white mt-1 flex min-h-10 items-center self-center rounded-full border border-white/5 px-5 text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
        >
          {t('load more')}
        </button>
      )}
    </section>
  );
}
