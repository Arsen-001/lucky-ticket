'use client';

import { ExternalLink } from 'lucide-react';
import { useGetOnchainTransactionsQuery } from '@/api/wallet.api';
import { EmptyDataInfo } from '@/components/shared/EmptyDataInfo';
import { QueryErrorState } from '@/components/shared/error/QueryErrorState';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { tonScanAddressUrl, truncateAddress } from '@/utils/pages/wallet.utils';
import { WalletOnchainRow } from './WalletOnchainRow';

export interface WalletOnchainHistoryProps {
  isConnected?: boolean;
}

/** Real blockchain history of the connected wallet (from the TON network). */
export function WalletOnchainHistory({ isConnected }: WalletOnchainHistoryProps) {
  const t = useAppTranslations();
  const { data, isLoading, isError, isFetching, refetch } = useGetOnchainTransactionsQuery(
    undefined,
    { skip: !isConnected }
  );

  if (!isConnected) {
    return <EmptyDataInfo description={t('connect wallet to start')} />;
  }

  if (isError) return <QueryErrorState onRetry={() => refetch()} />;

  const transactions = data?.transactions ?? [];
  const showSkeletons = isLoading || (isFetching && transactions.length === 0);

  return (
    <div className="flex flex-col gap-2">
      {data?.address && (
        <a
          href={tonScanAddressUrl(data.address, data.network)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-pink-secondary hover:text-white inline-flex items-center gap-1 self-start text-[11px] font-semibold transition-colors"
        >
          {truncateAddress(data.address)}
          <ExternalLink size={11} strokeWidth={2.4} />
        </a>
      )}

      <div role="list" className="flex flex-col gap-2">
        {showSkeletons ? (
          Array.from({ length: 5 }).map((_, index) => (
            <WalletOnchainRow
              key={`s-${index}`}
              loading
              className="animate-slide-in-bottom"
              style={{ animationDelay: `${index * 60}ms` }}
            />
          ))
        ) : transactions.length === 0 ? (
          <EmptyDataInfo description={t('no onchain transactions')} />
        ) : (
          transactions.map((tx, index) => (
            <WalletOnchainRow
              key={tx.hash}
              transaction={tx}
              network={data?.network}
              className="animate-slide-in-bottom"
              style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
            />
          ))
        )}
      </div>
    </div>
  );
}
