'use client';

import { Lock } from 'lucide-react';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { WalletAccountTonNote } from './WalletAccountTonNote';

export interface TonWalletClosedProps {
  /** The account's TON — an LC→TON conversion credits it with no wallet bound. */
  tonBalance?: number;
}

/**
 * The wallet hero while binding is closed (`walletConfig.connectEnabled`, the
 * server's own switch — `POST /wallet/connect` answers 403
 * `wallet-connect-disabled`).
 *
 * Off by default now: binding a wallet and depositing are open to everyone, and
 * only the way OUT is closed ([`WalletWithdrawLocked`](./WalletWithdrawLocked.tsx)).
 * This screen stays as the kill switch behind it — an incident on the TON side
 * shuts binding without shutting the app.
 *
 * Deliberately not [`TonWalletLocked`](./TonWalletLocked.tsx): that one is the
 * invite gate, and it is right to show a progress bar and the invite page,
 * because inviting friends actually opens it. Nothing the player does opens
 * this one, so offering a way forward would be a lie.
 */
export function TonWalletClosed({ tonBalance = 0 }: TonWalletClosedProps) {
  const t = useAppTranslations();

  return (
    <div
      className="shine-card relative overflow-hidden rounded-2xl p-5"
      style={{ ['--shine-card-accent' as string]: 'var(--color-electric-purple)' }}
    >
      <span
        aria-hidden
        className="bg-electric-purple/12 pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full blur-2xl"
      />

      <div className="relative flex flex-col items-center gap-3 text-center">
        <div className="flex-center ring-electric-purple/20 h-14 w-14 rounded-2xl bg-white/5 ring-1">
          <Lock size={26} className="text-pink-secondary" strokeWidth={2.2} />
        </div>
        <h2 className="text-lg font-extrabold leading-tight text-white">
          {t('wallet connect temporarily closed')}
        </h2>
        <p className="text-pink-secondary max-w-[280px] text-[12px]">
          {t('wallet connect closed note')}
        </p>
      </div>

      <div className="relative">
        <WalletAccountTonNote balance={tonBalance} />
      </div>
    </div>
  );
}
