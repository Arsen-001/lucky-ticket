'use client';

import { Check, Copy, Diamond, LogOut } from 'lucide-react';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { formatTon, formatUsd, providerLabel, truncateAddress } from '@/utils/pages/wallet.utils';
import { TonWalletLocked } from './TonWalletLocked';
import { WalletAccountTonNote } from './WalletAccountTonNote';
import type { WalletState } from '@/types/interfaces/wallet.interfaces';

export interface TonWalletHeroProps {
  state?: WalletState;
  loading?: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  disconnecting?: boolean;
}

export function TonWalletHero({
  state,
  loading,
  onConnect,
  onDisconnect,
  disconnecting,
}: TonWalletHeroProps) {
  const isConnected = !!state?.isConnected;

  if (loading) {
    return (
      <div
        className="shine-card relative overflow-hidden rounded-2xl p-5"
        style={{ ['--shine-card-accent' as string]: 'var(--color-electric-purple)' }}
      >
        <Skeleton variant="rounded-rectangle" className="h-32 w-full" />
      </div>
    );
  }

  // Invite gate (admin-editable, enforced by the backend): show what it takes
  // to unlock the wallet rather than a connect button that 403s. `canConnect`
  // is the server's verdict — an older backend omits it and nothing is gated.
  if (!isConnected && state?.canConnect === false) {
    return (
      <TonWalletLocked
        required={state.connectMinReferrals ?? 0}
        current={state.referralsCount ?? 0}
        tonBalance={state.tonBalance}
        usdRate={state.usdRate}
      />
    );
  }

  if (!isConnected) {
    return (
      <TonWalletDisconnected
        onConnect={onConnect}
        tonBalance={state?.tonBalance ?? 0}
        usdRate={state?.usdRate ?? 0}
      />
    );
  }

  return (
    <TonWalletConnected state={state!} onDisconnect={onDisconnect} disconnecting={disconnecting} />
  );
}

interface TonWalletDisconnectedProps {
  onConnect: () => void;
  /** The account's TON — kept when a binding is removed, so it is shown here too. */
  tonBalance: number;
  usdRate: number;
}

function TonWalletDisconnected({ onConnect, tonBalance, usdRate }: TonWalletDisconnectedProps) {
  const t = useAppTranslations();

  return (
    <div
      className="shine-card relative overflow-hidden rounded-2xl p-5"
      style={{ ['--shine-card-accent' as string]: 'var(--color-electric-purple)' }}
    >
      <span
        aria-hidden
        className="bg-electric-purple/15 pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full blur-2xl"
      />
      <span
        aria-hidden
        className="bg-pink/10 pointer-events-none absolute -bottom-16 -left-12 h-40 w-40 rounded-full blur-2xl"
      />

      <div className="relative flex flex-col items-center gap-3 text-center">
        <div className="bg-electric-purple/15 flex-center h-14 w-14 rounded-2xl ring-1 ring-electric-purple/30">
          <Diamond size={28} className="text-electric-purple" strokeWidth={2.2} />
        </div>
        <h2 className="text-lg font-extrabold leading-tight text-white">
          {t('connect your ton wallet')}
        </h2>
        <p className="text-pink-secondary max-w-[260px] text-[12px]">
          {t('deposit withdraw buy stars seamlessly')}
        </p>
        <button
          type="button"
          onClick={onConnect}
          className="bg-pink-gradient mt-1 w-full rounded-xl px-5 py-3 text-sm font-bold text-white transition-transform active:scale-[0.99]"
        >
          {t('connect wallet')}
        </button>
        <WalletAccountTonNote balance={tonBalance} usdRate={usdRate} />
      </div>
    </div>
  );
}

interface TonWalletConnectedProps {
  state: WalletState;
  onDisconnect: () => void;
  disconnecting?: boolean;
}

function TonWalletConnected({ state, onDisconnect, disconnecting }: TonWalletConnectedProps) {
  const t = useAppTranslations();
  const [copied, setCopied] = useState(false);
  const usdValue = state.tonBalance * state.usdRate;

  const handleCopy = async () => {
    if (!state.address) return;
    try {
      await navigator.clipboard.writeText(state.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* noop */
    }
  };

  return (
    <div
      className="shine-card relative overflow-hidden rounded-2xl p-4"
      style={{ ['--shine-card-accent' as string]: 'var(--color-electric-purple)' }}
    >
      <span
        aria-hidden
        className="bg-pink/10 pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full blur-2xl"
      />
      <span
        aria-hidden
        className="bg-electric-purple/12 pointer-events-none absolute -bottom-16 -left-12 h-40 w-40 rounded-full blur-2xl"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rotate-12 -translate-x-1/3 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent"
      />

      <div className="relative flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="bg-electric-purple/15 flex-center h-8 w-8 flex-shrink-0 rounded-lg">
            <Diamond size={16} className="text-electric-purple" strokeWidth={2.4} />
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="text-pink-secondary text-[10px] font-bold uppercase tracking-wider">
              {providerLabel(state.provider)}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="group flex items-center gap-1 text-left"
            >
              <span className="font-mono text-[13px] font-semibold text-white">
                {truncateAddress(state.address)}
              </span>
              {copied ? (
                <Check size={12} className="text-success" strokeWidth={3} />
              ) : (
                <Copy
                  size={12}
                  className="text-pink-secondary group-hover:text-white transition-colors"
                  strokeWidth={2.4}
                />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="relative mt-4 flex items-end gap-2">
        <SkeletonSuspense
          loading={false}
          skeleton={<Skeleton variant="line" className="h-9 w-32" />}
        >
          <span className="text-gold text-3xl font-extrabold leading-none tabular-nums">
            {formatTon(state.tonBalance, 4)}
          </span>
        </SkeletonSuspense>
        <span className="text-gold/80 mb-0.5 text-sm font-extrabold uppercase tracking-wider">
          TON
        </span>
        <span className="text-pink-secondary mb-1 ml-auto text-[12px] font-semibold tabular-nums">
          ≈ {formatUsd(usdValue)}
        </span>
      </div>
      {/* Removing used to be an unlabelled door-with-an-arrow icon in the card's
          corner — the one control on a money screen nobody could find by name.
          It says what it does now, and sits where the eye ends up after the
          balance rather than fighting the address for the top row. */}
      <div className="relative mt-1 flex items-center justify-between gap-2">
        <span className="text-pink-secondary text-[10px] font-bold uppercase tracking-wider">
          {t('ton mainnet')}
        </span>
        <button
          type="button"
          onClick={onDisconnect}
          disabled={disconnecting}
          className={twMerge(
            'flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1.5 text-pink-secondary transition-colors',
            'hover:bg-white/10 hover:text-white disabled:opacity-50'
          )}
        >
          <LogOut size={12} strokeWidth={2.4} />
          <span className="text-[11px] font-bold">{t('remove wallet')}</span>
        </button>
      </div>
    </div>
  );
}
