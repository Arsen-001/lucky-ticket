'use client';

import { useGetStarsStateQuery, useGetStarsTransactionsQuery } from '@/api/stars.api';
import { QueryErrorState } from '@/components/shared/error/QueryErrorState';
import { StarsHero } from './StarsHero';
import { StarsTransactionHistory } from './StarsTransactionHistory';

export function StarsContainer() {
  const { data: state, isLoading, isError, refetch } = useGetStarsStateQuery();
  const { data: transactions, isLoading: isTxLoading } = useGetStarsTransactionsQuery();

  if (isError) return <QueryErrorState onRetry={() => refetch()} />;

  return (
    <div className="flex flex-col gap-4 px-4 pb-8 pt-2">
      <StarsHero state={state} loading={isLoading} />
      <StarsTransactionHistory transactions={transactions} loading={isTxLoading} />
    </div>
  );
}
