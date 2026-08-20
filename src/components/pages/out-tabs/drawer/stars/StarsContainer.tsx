'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGetStarsStateQuery, useGetStarsTransactionsQuery } from '@/api/stars.api';
import { useGetWalletStateQuery } from '@/api/wallet.api';
import { QueryErrorState } from '@/components/shared/error/QueryErrorState';
import { routes } from '@/constants/routes';
import { BuyStarsModal } from '@/components/pages/out-tabs/drawer/wallet/BuyStarsModal';
import { ExchangeTonStarsModal } from '@/components/pages/out-tabs/drawer/wallet/ExchangeTonStarsModal';
import { StarsHero } from './StarsHero';
import { StarsTopUpBlock } from './StarsTopUpBlock';
import { StarsTransactionHistory } from './StarsTransactionHistory';

type StarsModal = 'buy' | 'exchange' | null;

export function StarsContainer() {
  const { data: state, isLoading, isError, refetch } = useGetStarsStateQuery();
  const { data: transactions, isLoading: isTxLoading } = useGetStarsTransactionsQuery();
  // The TON side of the exchange: how much there is to spend, and whether a
  // wallet is bound at all. Same query the wallet screen reads, so the two
  // screens can never disagree about it.
  const { data: wallet } = useGetWalletStateQuery();
  const [modal, setModal] = useState<StarsModal>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // `?action=exchange` — the discount badge in the header lands here with the
  // sheet already open. The parameter is consumed immediately, so a back-and-
  // forth to this screen does not keep re-opening it.
  useEffect(() => {
    if (searchParams.get('action') !== 'exchange') return;
    setModal('exchange');
    router.replace(routes.stars, { scroll: false });
  }, [searchParams, router]);

  if (isError) return <QueryErrorState onRetry={() => refetch()} />;

  return (
    <div className="flex flex-col gap-4 px-4 pb-8 pt-2">
      <StarsHero
        state={state}
        transactions={transactions}
        loading={isLoading}
        onBuy={() => setModal('buy')}
        onExchange={() => setModal('exchange')}
        exchangeLocked={!wallet?.isConnected}
        className="animate-slide-in-bottom"
      />

      {/* Between the balance and the ledger on purpose: «how much I have» →
          «how to add» → «where it came from». */}
      <StarsTopUpBlock onCustomAmount={() => setModal('buy')} />

      <StarsTransactionHistory transactions={transactions} loading={isTxLoading} />

      {/* Both sheets are the wallet's own — same component, same mutations, so
          a purchase made here and one made there cannot drift apart. Each
          invalidates the whole stars group, which is what refreshes the balance
          above and the rows below without a manual refetch. */}
      <BuyStarsModal open={modal === 'buy'} onClose={() => setModal(null)} />
      <ExchangeTonStarsModal
        open={modal === 'exchange'}
        onClose={() => setModal(null)}
        tonBalance={wallet?.tonBalance ?? 0}
        isConnected={!!wallet?.isConnected}
      />
    </div>
  );
}
