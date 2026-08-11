'use client';

import { Lock } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export interface WalletWithdrawLockedProps {
  className?: string;
}

/**
 * The exit closed, rendered as a state of the screen.
 *
 * Both money exits (TON withdrawal, LC→TON conversion) answer 403
 * `withdrawals-disabled` while `walletConfig.withdrawalsEnabled` is off. Until
 * this existed the flag reached the player only as that rejection — after an
 * address and an amount had been typed — and the modal reported it as a generic
 * "action failed", which reads as a broken button rather than a closed door.
 *
 * There is no progress bar and no call to action on purpose: unlike the invite
 * gates, nothing the player does opens this one. Nor does the copy name a date —
 * it used to say "after the test period", which is a promise the switch does not
 * make: the way IN (binding a wallet, deposits) is open regardless, and only
 * this way OUT is closed, until it is opened by hand.
 */
export function WalletWithdrawLocked({ className }: WalletWithdrawLockedProps) {
  const t = useAppTranslations();

  return (
    <div className={twMerge('flex flex-col items-center gap-3 text-center', className)}>
      <div className="flex-center ring-electric-purple/20 h-14 w-14 rounded-2xl bg-white/5 ring-1">
        <Lock size={26} className="text-pink-secondary" strokeWidth={2.2} />
      </div>
      <h2 className="text-lg font-extrabold leading-tight text-white">
        {t('withdrawals temporarily closed')}
      </h2>
      <p className="text-pink-secondary max-w-[280px] text-[12px]">
        {t('withdrawals closed for now note')}
      </p>
    </div>
  );
}
