'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  useDisconnectWalletMutation,
  useGetWalletStateQuery,
  useGetWalletTransactionsQuery,
} from '@/api/wallet.api';
import { routes } from '@/constants/routes';
import { TonWalletHero } from './TonWalletHero';
import { WalletActionButtons } from './WalletActionButtons';
import { StarsBalanceCard } from './StarsBalanceCard';
import { LcWalletComingSoonCard } from './LcWalletComingSoonCard';
import { WalletTransactionHistory } from './WalletTransactionHistory';
import { ConnectWalletModal } from './ConnectWalletModal';
import { DepositTonModal } from './DepositTonModal';
import { WithdrawTonModal } from './WithdrawTonModal';
import { BuyStarsModal } from './BuyStarsModal';
import { LcNotifyMeModal } from './LcNotifyMeModal';
import { NotEnoughStarsModal } from '@/components/pages/tabs/home/NotEnoughStarsModal';

type WalletModal =
  | 'connect'
  | 'deposit'
  | 'withdraw'
  | 'buyStars'
  | 'notifyLc'
  | 'notEnough'
  | null;

export function WalletContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: state, isLoading } = useGetWalletStateQuery();
  const { data: transactions, isLoading: isTxLoading } = useGetWalletTransactionsQuery();
  const [disconnect, { isLoading: isDisconnecting }] = useDisconnectWalletMutation();
  const [modal, setModal] = useState<WalletModal>(null);
  const [pendingTopUp, setPendingTopUp] = useState<number | undefined>(undefined);

  const isConnected = !!state?.isConnected;
  const tonBalance = state?.tonBalance ?? 0;
  const starsBalance = state?.starsBalance ?? 0;

  useEffect(() => {
    const topUpRaw = searchParams.get('topUp');
    const topUpAmount = topUpRaw ? Number(topUpRaw) : NaN;
    if (!Number.isFinite(topUpAmount) || topUpAmount <= 0) return;
    setPendingTopUp(topUpAmount);
    setModal(state?.isConnected ? 'buyStars' : 'connect');
    router.replace(routes.wallet, { scroll: false });
  }, [searchParams, state?.isConnected, router]);

  const requireConnected = (next: WalletModal) => {
    setModal(isConnected ? next : 'connect');
  };

  const handleTopUp = (amount: number) => {
    setPendingTopUp(amount);
    setModal(isConnected ? 'buyStars' : 'connect');
  };

  return (
    <div className="flex flex-col gap-4 px-4 pb-8 pt-2">
      <TonWalletHero
        state={state}
        loading={isLoading}
        onConnect={() => setModal('connect')}
        onDisconnect={() => disconnect()}
        disconnecting={isDisconnecting}
      />

      <WalletActionButtons
        disabled={isLoading}
        onDeposit={() => requireConnected('deposit')}
        onWithdraw={() => requireConnected('withdraw')}
        onBuyStars={() => requireConnected('buyStars')}
      />

      <StarsBalanceCard
        balance={state?.starsBalance}
        loading={isLoading}
        disabled={isLoading}
        onBuyMore={() => setModal('notEnough')}
      />

      <LcWalletComingSoonCard onNotifyMe={() => setModal('notifyLc')} />

      <WalletTransactionHistory
        transactions={transactions}
        loading={isTxLoading}
        isConnected={isConnected}
      />

      <ConnectWalletModal open={modal === 'connect'} onClose={() => setModal(null)} />
      <DepositTonModal open={modal === 'deposit'} onClose={() => setModal(null)} />
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
        tonBalance={tonBalance}
        initialStars={pendingTopUp}
      />
      <LcNotifyMeModal open={modal === 'notifyLc'} onClose={() => setModal(null)} />
      <NotEnoughStarsModal
        open={modal === 'notEnough'}
        onClose={() => setModal(null)}
        currentStars={starsBalance}
        onTopUp={handleTopUp}
      />
    </div>
  );
}
