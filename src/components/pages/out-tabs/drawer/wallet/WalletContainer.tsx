'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useGetWalletStateQuery, useGetWalletTransactionsQuery } from '@/api/wallet.api';
import { useGetLcStateQuery } from '@/api/lc.api';
import { routes } from '@/constants/routes';
import { useTonWalletConnect } from '@/hooks/useTonWalletConnect';
import { useWalletLimits } from '@/hooks/useWalletLimits';
import { TonWalletHero } from './TonWalletHero';
import { WalletActionButtons } from './WalletActionButtons';
import { StarsBalanceCard } from './StarsBalanceCard';
import { WalletLcCard } from './WalletLcCard';
import { WalletTransactionHistory } from './WalletTransactionHistory';
import { DepositTonModal } from './DepositTonModal';
import { WithdrawTonModal } from './WithdrawTonModal';
import { BuyStarsModal } from './BuyStarsModal';
import { ExchangeTonStarsModal } from './ExchangeTonStarsModal';
import { LcConvertTonModal } from '@/components/pages/out-tabs/drawer/lc/LcConvertTonModal';
import { ConfirmModal } from '@/components/shared/modals/ConfirmModal';
import { RequirementModal } from '@/components/shared/modals/RequirementModal';
import { QueryErrorState } from '@/components/shared/error/QueryErrorState';

type WalletModal =
  | 'deposit'
  | 'withdraw'
  | 'buyStars'
  | 'convertLc'
  | 'exchange'
  | 'removeWallet'
  | 'connectGate'
  | null;

export function WalletContainer() {
  const t = useAppTranslations();
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
  const { connect, disconnect, isConnecting, isDisconnecting, referralGate, dismissReferralGate } =
    useTonWalletConnect();
  const { withdrawalsEnabled } = useWalletLimits();
  const [modal, setModal] = useState<WalletModal>(null);
  const [pendingTopUp, setPendingTopUp] = useState<number | undefined>(undefined);
  // Sent here from the exchange sheet with too little TON: point at the button
  // that fixes it, then stop — a ring that never stops becomes wallpaper.
  const [highlightDeposit, setHighlightDeposit] = useState(false);
  const [depositWatch, setDepositWatch] = useState<{ polls: number; fromBalance: number } | null>(
    null
  );

  const isConnected = !!state?.isConnected;
  const tonBalance = state?.tonBalance ?? 0;
  // Binding kill switch (`walletConfig.connectEnabled`), off by default — the
  // way IN is open. When it is thrown, no action of the player's opens it,
  // unlike the invite gate below, so the screen offers none: the TON row goes
  // away instead of sitting there refusing taps.
  const isConnectClosed = state?.connectEnabled === false && !isConnected;
  // Invite gate on binding a wallet (`walletConfig.connectMinReferrals`), the
  // server's own verdict — an older backend omits it and nothing is gated.
  const isGated = state?.canConnect === false && !isConnected;
  const required = state?.connectMinReferrals ?? 0;
  // The second, heavier gate: money on the way OUT. Connecting a wallet only
  // opens deposits, so this one is checked separately at withdrawal time.
  const isWithdrawGated = state?.canWithdraw === false;

  useEffect(() => {
    if (searchParams.get('highlight') !== 'deposit') return;
    setHighlightDeposit(true);
    router.replace(routes.wallet, { scroll: false });
    const timer = setTimeout(() => setHighlightDeposit(false), 6_000);
    return () => clearTimeout(timer);
  }, [searchParams, router]);

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
  // unmet the backend rejects that connect, so show the gate — what is missing
  // AND the way to it — instead of a sheet whose only outcome is an error.
  const requireConnected = (next: WalletModal) => {
    // The exit is closed for everyone: open the modal that says so instead of a
    // TON Connect sheet. Binding a wallet does not open this door, so asking for
    // one first would collect a signature and then refuse.
    if (next === 'withdraw' && !withdrawalsEnabled) setModal('withdraw');
    else if (isConnected) setModal(next);
    // The switch is off: no sheet, and above all no invite gate — its progress
    // bar would promise an unlock that inviting friends cannot deliver.
    else if (isConnectClosed) return;
    else if (isGated) setModal('connectGate');
    else void connect();
  };

  // Both routes into the connect gate: tapping a TON action while it is unmet,
  // and the backend's own 403 when the count moved between load and connect.
  const gateOpen = modal === 'connectGate' || !!referralGate;
  const gateRequired = referralGate?.required ?? required;
  const gateCurrent = referralGate?.current ?? state?.referralsCount ?? 0;

  const closeConnectGate = () => {
    if (modal === 'connectGate') setModal(null);
    dismissReferralGate();
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
        connecting={isConnecting}
      />

      {/*
        Deposit / withdraw / exchange are all TON-only, so with binding closed
        every one of them is a dead button. Stars and LC below keep working —
        the switch closes the TON wallet, not the account.

        Withdrawal is the one that is closed today, and it is marked here rather
        than only inside its modal: the two buttons beside it work, so an
        unmarked one that answers "closed" reads as this screen being broken.
      */}
      {!isConnectClosed && (
        <WalletActionButtons
          disabled={isLoading}
          highlightDeposit={highlightDeposit}
          withdrawLocked={!withdrawalsEnabled}
          onDeposit={() => requireConnected('deposit')}
          onWithdraw={() => requireConnected('withdraw')}
          onExchange={() => requireConnected('exchange')}
        />
      )}

      <StarsBalanceCard
        balance={state?.starsBalance}
        loading={isLoading}
        disabled={isLoading}
        onBuyMore={() => setModal('buyStars')}
      />

      <WalletLcCard onConvert={() => setModal('convertLc')} locked={!withdrawalsEnabled} />

      {/*
        Our own ledger only. The wallet's blockchain history used to sit next to
        it behind a tab; it is off the Mini App now — inside Telegram the wallet
        app already shows it, and every row here that has an on-chain hash still
        links out to the explorer.
      */}
      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">
          {t('transactions')}
        </h3>

        {/*
          A failed history query must not read as "no transactions yet" — that is
          indistinguishable from a lost payment to the user.
        */}
        {isTxError ? (
          <QueryErrorState onRetry={() => refetchTransactions()} className="pt-6" />
        ) : (
          <WalletTransactionHistory
            transactions={transactions}
            loading={isTxLoading}
            isConnected={isConnected}
            connectClosed={isConnectClosed}
            network={state?.network}
            hideHeader
          />
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
        minWithdrawTon={state?.minWithdrawTon}
        firstWithdrawal={state?.firstWithdrawal}
        nextWithdrawMinTon={state?.nextWithdrawMinTon}
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
      <RequirementModal
        open={gateOpen}
        onClose={closeConnectGate}
        title={t('wallet unlocks with friends')}
        description={t('invite {num} friends to connect a wallet', { num: gateRequired })}
        progress={{ label: t('friends invited'), current: gateCurrent, required: gateRequired }}
        action={{ label: t('invite friends'), href: routes.inviteFriends }}
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
