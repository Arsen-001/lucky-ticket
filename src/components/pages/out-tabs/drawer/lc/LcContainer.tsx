'use client';

import { useState } from 'react';
import { useGetLcStateQuery, useGetLcTransactionsQuery } from '@/api/lc.api';
import { useGetMeQuery } from '@/api/me.api';
import { LcHero } from './LcHero';
import { LcActionButtons } from './LcActionButtons';
import { LcTransactionHistory } from './LcTransactionHistory';
import { LcConvertStarsModal } from './LcConvertStarsModal';

export function LcContainer() {
  const { data: state, isLoading } = useGetLcStateQuery();
  const { data: transactions, isLoading: isTxLoading } = useGetLcTransactionsQuery();
  const { data: me } = useGetMeQuery();
  const [buyOpen, setBuyOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4 px-4 pb-8 pt-2">
      <LcHero state={state} loading={isLoading} />

      <LcActionButtons disabled={isLoading} onBuy={() => setBuyOpen(true)} />

      <LcTransactionHistory transactions={transactions} loading={isTxLoading} />

      <LcConvertStarsModal
        open={buyOpen}
        onClose={() => setBuyOpen(false)}
        starsBalance={me?.telegramStars ?? 0}
        rate={state?.starsToLcRate ?? 2}
      />
    </div>
  );
}
