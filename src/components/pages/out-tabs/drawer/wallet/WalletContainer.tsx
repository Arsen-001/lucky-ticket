'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useGetWalletStateQuery, useGetWalletTransactionsQuery } from '@/api/wallet.api';
import { useGetLcStateQuery } from '@/api/lc.api';
import { routes } from '@/constants/routes';
import { useToast } from '@/hooks/useToast';
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
import { ConfirmModal } from '@/components/shared/modals/ConfirmModal';
import { QueryErrorState } from '@/components/shared/error/QueryErrorState';

type WalletModal =
  | 'deposit'
  | 'withdraw'
  | 'buyStars'
  | 'convertLc'
  | 'exchange'
  | 'removeWallet'
  | null;

export function WalletContainer() {
  const t = useAppTranslations();
  const toast = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: state, isLoading, isError, refetch } = useGetWalletStateQuery();
  const {
    data: transactions,
    isLoading: isTxLoading,
    isError: isTxError,
    refetch: refetchTransactions,
  } = useGetWalletTransactionsQuery();
  const { data: lcState } = useGetLcStateQuery();
  const { connect, disconnect, isDisconnecting } = useTonWalletConnect();
  const [modal, setModal] = useState<WalletModal>(null);
  const [pendingTopUp, setPendingTopUp] = useState<number | undefined>(undefined);
  const [historyTab, setHistoryTab] = useState<'app' | 'onchain'>('app');
  const [depositWatch, setDepositWatch] = useState<{ polls: number; fromBalance: number } | null>(
    null
  );

  const isConnected = !!state?.isConnected;
  const tonBalance = state?.tonBalance ?? 0;
  // Invite gate on binding a wallet (`walletConfig.connectMinReferrals`), the
  // server's own verdict — an older backend omits it and nothing is gated.
  const isGated = state?.canConnect === false && !isConnected;
  const required = state?.connectMinReferrals ?? 0;
  // The second, heavier gate: money on the way OUT. Connecting a wallet only
  // opens deposits, so this one is checked separately at withdrawal time.
  const isWithdrawGated = state?.canWithdraw === false;

  useEffect(() => {
    const topUpRaw = searchParams.get('topUp');
    const topUpAmount = topUpRaw ? Number(topUpRaw) : NaN;
    if (!Number.isFinite(topUpAmount) || topUpAmount <= 0) return;
    setPendingTopUp(topUpAmount);
    // Buying stars pays with real Telegram Stars — no TON wallet needed.
    setModal('buyStars');
    router.replace(routes.wallet, { scroll: false });
  }, [searchParams, router]);

  // A real deposit is credited by the backend watcher (~40–80 s after it lands),
  // so poll for a couple of minutes rather than firing one blind refetch on a
  // timer that nothing cancels when the screen closes. Stops as soon as the
  // balance moves, and on unmount.
  useEffect(() => {
    if (!depositWatch) return;
    if (tonBalance > depositWatch.fromBalance || depositWatch.polls <= 0) {
      setDepositWatch(null);
      return;
    }
    const timer = setTimeout(() => {
      refetch();
      refetchTransactions();
      setDepositWatch(watch => (watch ? { ...watch, polls: watch.polls - 1 } : null));
    }, 15_000);
    return () => clearTimeout(timer);
  }, [depositWatch, tonBalance, refetch, refetchTransactions]);

  if (isError) return <QueryErrorState onRetry={() => refetch()} />;

  // TON-only actions (deposit / withdraw) require a connected wallet — open the
  // TON Connect sheet first when there isn't one. While the invite gate is
  // unmet the backend rejects that connect, so say what's missing instead of
  // opening a sheet whose only outcome is an error.
  const requireConnected = (next: WalletModal) => {
    if (isConnected) setModal(next);
    else if (isGated) toast.info(t('invite {num} friends to connect a wallet', { num: required }));
    else void connect();
  };

  const handleDeposited = () => setDepositWatch({ polls: 8, fromBalance: tonBalance });

  // Removing a wallet is a one-tap irreversible action on a money screen, so it
  // asks first — and says what does NOT happen, since "remove wallet" reads like
  // it might take the balance with it.
  const handleRemoveWallet = async () => {
    setModal(null);
    await disconnect();
  };

  return (
    <div className="flex flex-col gap-4 px-4 pb-8 pt-2">
      <TonWalletHero
        state={state}
        loading={isLoading}
        onConnect={() => void connect()}
        onDisconnect={() => setModal('removeWallet')}
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
          // A failed history query must not read as "no transactions yet" —
          // that is indistinguishable from a lost payment to the user.
          isTxError ? (
            <QueryErrorState onRetry={() => refetchTransactions()} className="pt-6" />
          ) : (
            <WalletTransactionHistory
              transactions={transactions}
              loading={isTxLoading}
              isConnected={isConnected}
              network={state?.network}
              hideHeader
            />
          )
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
        network={state?.network}
        gated={isWithdrawGated}
        requiredReferrals={state?.withdrawMinReferrals ?? 0}
        currentReferrals={state?.referralsCount ?? 0}
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
      <ConfirmModal
        open={modal === 'removeWallet'}
        onClose={() => setModal(null)}
        onConfirm={() => void handleRemoveWallet()}
        title={t('remove wallet')}
        content={<p className="text-pink-secondary text-[13px]">{t('remove wallet note')}</p>}
        confirmText={t('remove')}
        loading={isDisconnecting}
      />
    </div>
  );
}
