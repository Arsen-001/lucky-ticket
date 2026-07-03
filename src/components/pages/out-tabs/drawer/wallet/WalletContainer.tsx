'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useGetWalletStateQuery, useGetWalletTransactionsQuery } from '@/api/wallet.api';
import { useGetLcStateQuery } from '@/api/lc.api';
import { routes } from '@/constants/routes';
import { useTonWalletConnect } from '@/hooks/useTonWalletConnect';
import { TonWalletHero } from './TonWalletHero';
import { WalletActionButtons } from './WalletActionButtons';
import { StarsBalanceCard } from './StarsBalanceCard';
import { WalletLcCard } from './WalletLcCard';
import { WalletTransactionHistory } from './WalletTransactionHistory';
import { WalletOnchainHistory } from './WalletOnchainHistory';
import { DepositTonModal } from './DepositTonModal';
import { WithdrawTonModal } from './WithdrawTonModal';
import { BuyStarsModal } from './BuyStarsModal';
import { ExchangeTonStarsModal } from './ExchangeTonStarsModal';
import { LcConvertTonModal } from '@/components/pages/out-tabs/drawer/lc/LcConvertTonModal';
import { QueryErrorState } from '@/components/shared/error/QueryErrorState';

type WalletModal = 'deposit' | 'withdraw' | 'buyStars' | 'convertLc' | 'exchange' | null;

export function WalletContainer() {
  const t = useAppTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: state, isLoading, isError, refetch } = useGetWalletStateQuery();
  const {
    data: transactions,
    isLoading: isTxLoading,
    refetch: refetchTransactions,
  } = useGetWalletTransactionsQuery();
  const { data: lcState } = useGetLcStateQuery();
  const { connect, disconnect, isDisconnecting } = useTonWalletConnect();
  const [modal, setModal] = useState<WalletModal>(null);
  const [pendingTopUp, setPendingTopUp] = useState<number | undefined>(undefined);
  const [historyTab, setHistoryTab] = useState<'app' | 'onchain'>('app');

  const isConnected = !!state?.isConnected;
  const tonBalance = state?.tonBalance ?? 0;

  useEffect(() => {
    const topUpRaw = searchParams.get('topUp');
    const topUpAmount = topUpRaw ? Number(topUpRaw) : NaN;
    if (!Number.isFinite(topUpAmount) || topUpAmount <= 0) return;
    setPendingTopUp(topUpAmount);
    // Buying stars pays with real Telegram Stars — no TON wallet needed.
    setModal('buyStars');
    router.replace(routes.wallet, { scroll: false });
  }, [searchParams, router]);

  if (isError) return <QueryErrorState onRetry={() => refetch()} />;

  // TON-only actions (deposit / withdraw) require a connected wallet — open the
  // TON Connect sheet first when there isn't one.
  const requireConnected = (next: WalletModal) => {
    if (isConnected) setModal(next);
    else void connect();
  };

  // A real deposit is credited by the backend watcher within ~a minute — refresh
  // the balance + history shortly after it's broadcast.
  const handleDeposited = () => {
    setTimeout(() => {
      refetch();
      refetchTransactions();
    }, 45_000);
  };

  return (
    <div className="flex flex-col gap-4 px-4 pb-8 pt-2">
      <TonWalletHero
        state={state}
        loading={isLoading}
        onConnect={() => void connect()}
        onDisconnect={() => void disconnect()}
        disconnecting={isDisconnecting}
      />

      <WalletActionButtons
        disabled={isLoading}
        onDeposit={() => requireConnected('deposit')}
        onWithdraw={() => requireConnected('withdraw')}
        onExchange={() => requireConnected('exchange')}
      />

      <StarsBalanceCard
        balance={state?.starsBalance}
        loading={isLoading}
        disabled={isLoading}
        onBuyMore={() => setModal('buyStars')}
      />

      <WalletLcCard onConvert={() => setModal('convertLc')} />

      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <h3 className="flex-1 text-sm font-extrabold uppercase tracking-wider text-white">
            {t('transactions')}
          </h3>
          <div className="bg-background-overlay/60 flex gap-0.5 rounded-full border border-white/5 p-0.5">
            {(['app', 'onchain'] as const).map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setHistoryTab(tab)}
                className={twMerge(
                  'rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors',
                  historyTab === tab ? 'bg-pink-gradient text-white' : 'text-pink-secondary'
                )}
              >
                {t(tab === 'app' ? 'in-app' : 'on-chain')}
              </button>
            ))}
          </div>
        </div>

        {historyTab === 'app' ? (
          <WalletTransactionHistory
            transactions={transactions}
            loading={isTxLoading}
            isConnected={isConnected}
            hideHeader
          />
        ) : (
          <WalletOnchainHistory isConnected={isConnected} />
        )}
      </section>

      <DepositTonModal
        open={modal === 'deposit'}
        onClose={() => setModal(null)}
        onDeposited={handleDeposited}
      />
      <WithdrawTonModal
        open={modal === 'withdraw'}
        onClose={() => setModal(null)}
        tonBalance={tonBalance}
      />
      <BuyStarsModal
        open={modal === 'buyStars'}
        onClose={() => {
          setModal(null);
          setPendingTopUp(undefined);
        }}
        initialStars={pendingTopUp}
      />
      <LcConvertTonModal
        open={modal === 'convertLc'}
        onClose={() => setModal(null)}
        balance={lcState?.balance ?? 0}
      />
      <ExchangeTonStarsModal
        open={modal === 'exchange'}
        onClose={() => setModal(null)}
        tonBalance={tonBalance}
        isConnected={isConnected}
      />
    </div>
  );
}
