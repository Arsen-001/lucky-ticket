'use client';

import { useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { EmptyDataInfo } from '@/components/shared/EmptyDataInfo';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { WalletTransactionFilter } from '@/types/enums/wallet.enums';
import { filterTransactions } from '@/utils/pages/wallet.utils';
import { WalletTransactionRow } from './WalletTransactionRow';
import type { TonNetwork, WalletTransaction } from '@/types/interfaces/wallet.interfaces';

const FILTERS: WalletTransactionFilter[] = [
  WalletTransactionFilter.ALL,
  WalletTransactionFilter.DEPOSITS,
  WalletTransactionFilter.WITHDRAWALS,
  WalletTransactionFilter.STARS,
];

const PAGE_SIZE = 20;

export interface WalletTransactionHistoryProps {
  transactions?: WalletTransaction[];
  loading?: boolean;
  isConnected?: boolean;
  /**
   * Binding is closed for the test period, so the empty list must not answer
   * "connect a wallet to start" — that is advice the screen above it refuses.
   */
  connectClosed?: boolean;
  /** Suppress the section title when embedded under a shared header. */
  hideHeader?: boolean;
  /** Chain the on-chain hashes belong to — decides which tonscan a row links to. */
  network?: TonNetwork;
}

export function WalletTransactionHistory({
  transactions = [],
  loading,
  isConnected,
  connectClosed,
  hideHeader,
  network,
}: WalletTransactionHistoryProps) {
  const t = useAppTranslations();
  const [filter, setFilter] = useState<WalletTransactionFilter>(WalletTransactionFilter.ALL);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => filterTransactions(transactions, filter), [transactions, filter]);
  const visible = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < filtered.length;

  return (
    <section className="flex flex-col gap-3">
      {!hideHeader && (
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">
            {t('recent activity')}
          </h3>
        </div>
      )}

      <div className="flex gap-1.5 overflow-x-auto scrollbar-hidden -mx-1 px-1">
        {FILTERS.map(f => (
          <button
            key={f}
            type="button"
            onClick={() => {
              setFilter(f);
              setPage(1);
            }}
            className={twMerge(
              'flex-shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors',
              filter === f
                ? 'bg-pink-gradient text-white'
                : 'bg-background-overlay/60 text-pink-secondary hover:text-white border border-white/5'
            )}
          >
            {t(`wallet filter ${f}`)}
          </button>
        ))}
      </div>

      <div role="list" className="flex flex-col gap-2">
        {loading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <WalletTransactionRow
              key={`s-${index}`}
              loading
              className="animate-slide-in-bottom"
              style={{ animationDelay: `${index * 60}ms` }}
            />
          ))
        ) : visible.length === 0 ? (
          <EmptyDataInfo
            description={
              isConnected || connectClosed ? t('no transactions yet') : t('connect wallet to start')
            }
          />
        ) : (
          visible.map((tx, index) => (
            <WalletTransactionRow
              key={tx.id}
              transaction={tx}
              network={network}
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
          className="bg-background-overlay/60 text-pink-secondary hover:text-white mt-1 self-center rounded-full border border-white/5 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors"
        >
          {t('load more')}
        </button>
      )}
    </section>
  );
}
