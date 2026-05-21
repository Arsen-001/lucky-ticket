'use client';

import { useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { EmptyDataInfo } from '@/components/shared/EmptyDataInfo';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import {
  LcTransactionDirection,
  LcTransactionFilter,
  LcTransactionType,
} from '@/types/enums/lc.enums';
import { LcTransactionRow } from './LcTransactionRow';
import type { LcTransaction } from '@/types/interfaces/lc.interfaces';

const FILTERS: LcTransactionFilter[] = [
  LcTransactionFilter.ALL,
  LcTransactionFilter.EARN,
  LcTransactionFilter.SPEND,
  LcTransactionFilter.CONVERT,
];

const CONVERT_TYPES = new Set<LcTransactionType>([
  LcTransactionType.CONVERT_FROM_STARS,
  LcTransactionType.CONVERT_TO_STARS,
  LcTransactionType.CONVERT_TO_TON,
]);

const PAGE_SIZE = 20;

const filterTransactions = (
  transactions: LcTransaction[],
  filter: LcTransactionFilter
): LcTransaction[] => {
  switch (filter) {
    case LcTransactionFilter.EARN:
      return transactions.filter(
        tx => tx.direction === LcTransactionDirection.CREDIT && !CONVERT_TYPES.has(tx.type)
      );
    case LcTransactionFilter.SPEND:
      return transactions.filter(
        tx => tx.direction === LcTransactionDirection.DEBIT && !CONVERT_TYPES.has(tx.type)
      );
    case LcTransactionFilter.CONVERT:
      return transactions.filter(tx => CONVERT_TYPES.has(tx.type));
    default:
      return transactions;
  }
};

export interface LcTransactionHistoryProps {
  transactions?: LcTransaction[];
  loading?: boolean;
}

export function LcTransactionHistory({ transactions = [], loading }: LcTransactionHistoryProps) {
  const t = useAppTranslations();
  const [filter, setFilter] = useState<LcTransactionFilter>(LcTransactionFilter.ALL);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => filterTransactions(transactions, filter), [transactions, filter]);
  const visible = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < filtered.length;

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">
        {t('recent activity')}
      </h3>

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
              'flex-shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer',
              filter === f
                ? 'bg-pink-gradient text-white'
                : 'bg-background-overlay/60 text-pink-secondary hover:text-white border border-white/5'
            )}
          >
            {t(`lc filter ${f}`)}
          </button>
        ))}
      </div>

      <div role="list" className="flex flex-col gap-2">
        {loading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <LcTransactionRow
              key={`s-${index}`}
              loading
              className="animate-slide-in-bottom"
              style={{ animationDelay: `${index * 60}ms` }}
            />
          ))
        ) : visible.length === 0 ? (
          <EmptyDataInfo description={t('no lc transactions yet')} />
        ) : (
          visible.map((tx, index) => (
            <LcTransactionRow
              key={tx.id}
              transaction={tx}
              className="animate-slide-in-bottom"
              style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
            />
          ))
        )}
      </div>

      {hasMore && !loading && (
        <button
          type="button"
          onClick={() => setPage(p => p + 1)}
          className="bg-background-overlay/60 text-pink-secondary hover:text-white mt-1 self-center rounded-full border border-white/5 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
        >
          {t('load more')}
        </button>
      )}
    </section>
  );
}
