'use client';

import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { EmptyDataInfo } from '@/components/shared/EmptyDataInfo';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { LcTransactionDirection, LcTransactionFilter } from '@/types/enums/lc.enums';
import { filterLcTransactions, groupLcTransactionsByDay, lcDayLabel } from '@/utils/pages/lc.utils';
import { formatNumber } from '@/utils/global/number.utils';
import { staggerMs } from '@/utils/global/animation.utils';
import { LcTransactionRow } from './LcTransactionRow';
import { LcLifetimeTotals } from './LcLifetimeTotals';
import type { LcTransactionDay } from '@/utils/pages/lc.utils';
import type { LcState, LcTransaction } from '@/types/interfaces/lc.interfaces';

const FILTERS: LcTransactionFilter[] = [
  LcTransactionFilter.ALL,
  LcTransactionFilter.EARN,
  LcTransactionFilter.SPEND,
  LcTransactionFilter.CONVERT,
];

const PAGE_SIZE = 20;

/** Balance the player closed the day on — the newest row of that day carries it. */
const dayClosingBalance = (transactions: LcTransaction[]): number =>
  transactions[0]?.balanceAfter ?? 0;

const dayNet = (transactions: LcTransaction[]): number =>
  transactions.reduce(
    (sum, tx) => sum + (tx.direction === LcTransactionDirection.CREDIT ? tx.amount : -tx.amount),
    0
  );

export interface LcTransactionHistoryProps {
  state?: LcState;
  transactions?: LcTransaction[];
  loading?: boolean;
}

export function LcTransactionHistory({
  state,
  transactions = [],
  loading,
}: LcTransactionHistoryProps) {
  const t = useAppTranslations();
  const [filter, setFilter] = useState<LcTransactionFilter>(LcTransactionFilter.ALL);
  const [page, setPage] = useState(1);

  const filtered = filterLcTransactions(transactions, filter);
  const visible = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < filtered.length;

  // The entry stagger counts rows across the whole list, not within a day —
  // otherwise every day header restarts the animation and the page ripples in
  // steps. Offsets are precomputed rather than accumulated during render.
  const days = groupLcTransactionsByDay(visible).reduce<
    { day: LcTransactionDay; offset: number }[]
  >((acc, day) => {
    const previous = acc.at(-1);
    const offset = previous ? previous.offset + previous.day.transactions.length : 0;
    return [...acc, { day, offset }];
  }, []);

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">
          {t('recent activity')}
        </h3>
        {!loading && <LcLifetimeTotals state={state} />}
      </div>

      <div className="scrollbar-hidden -mx-1 flex gap-1.5 overflow-x-auto px-1">
        {FILTERS.map(f => (
          <button
            key={f}
            type="button"
            onClick={() => {
              setFilter(f);
              setPage(1);
            }}
            className={twMerge(
              // 40px, up from 28: these were the smallest targets on the screen.
              // Not 44 — the chips are ~100px wide, and width is what makes a
              // control easy to hit (the same reasoning `tap-target` is written
              // on); the last 4px cost a whole row of history off the fold, and
              // that zone would be clipped here anyway by the overflow-x strip.
              'flex min-h-10 flex-shrink-0 items-center rounded-full px-4 text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer',
              filter === f
                ? 'bg-pink-gradient text-white'
                : 'bg-background-overlay/60 text-pink-secondary hover:text-white border border-white/5'
            )}
          >
            {t(`lc filter ${f}`)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <LcTransactionRow
              key={`s-${index}`}
              loading
              className="animate-slide-in-bottom"
              style={{ animationDelay: `${staggerMs(index, 60)}ms` }}
            />
          ))}
        </div>
      ) : visible.length === 0 ? (
        // The shared default reads "No results found · try another search",
        // which is wrong for a player who simply hasn't earned anything yet.
        <EmptyDataInfo title={t('no lc transactions yet')} description={undefined} />
      ) : (
        <div role="list" className="flex flex-col gap-3">
          {days.map(({ day, offset }) => {
            const net = dayNet(day.transactions);

            return (
              <div key={day.key} className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between gap-2 px-1">
                  <span className="text-white-secondary text-[11px] font-extrabold uppercase tracking-wider">
                    {lcDayLabel(day.key, t)}
                  </span>
                  {/* The running balance every row used to repeat, kept once
                      per day where it still answers "and then I had". */}
                  <span className="text-pink-secondary text-[10.5px] font-semibold tabular-nums">
                    <span className={net >= 0 ? 'text-success' : 'text-error-text'}>
                      {net >= 0 ? '+' : '−'}
                      {formatNumber(Math.abs(net))}
                    </span>
                    {' · '}
                    {formatNumber(dayClosingBalance(day.transactions))}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  {day.transactions.map((tx, index) => (
                    <LcTransactionRow
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
