'use client';

import { useState } from 'react';
import { useGetLcStateQuery, useGetLcTransactionsQuery } from '@/api/lc.api';
import { QueryErrorState } from '@/components/shared/error/QueryErrorState';
import { LcHero } from './LcHero';
import { LcActionButtons } from './LcActionButtons';
import { LcTransactionHistory } from './LcTransactionHistory';
import { LcConvertTonModal } from './LcConvertTonModal';

export function LcContainer() {
  const { data: state, isLoading, isError, refetch } = useGetLcStateQuery();
  const { data: transactions, isLoading: isTxLoading } = useGetLcTransactionsQuery();
  const [convertTonOpen, setConvertTonOpen] = useState(false);

  if (isError) return <QueryErrorState onRetry={() => refetch()} />;

  return (
    <div className="flex flex-col gap-4 px-4 pb-8 pt-2">
      <LcHero state={state} loading={isLoading} />

      <LcActionButtons disabled={isLoading} onConvertTon={() => setConvertTonOpen(true)} />

      <LcTransactionHistory transactions={transactions} loading={isTxLoading} />

      <LcConvertTonModal
        open={convertTonOpen}
        onClose={() => setConvertTonOpen(false)}
        balance={state?.balance ?? 0}
      />
    </div>
  );
}
