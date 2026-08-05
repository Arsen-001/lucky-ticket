'use client';

import { Lock } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export interface WalletWithdrawLockedProps {
  className?: string;
}

/**
 * The exit closed for the test period, rendered as a state of the screen.
 *
 * Both money exits (TON withdrawal, LC→TON conversion) answer 403
 * `withdrawals-disabled` while `walletConfig.withdrawalsEnabled` is off. Until
 * this existed the flag reached the player only as that rejection — after an
 * address and an amount had been typed — and the modal reported it as a generic
 * "action failed", which reads as a broken button rather than a closed door.
 *
 * There is no progress bar and no call to action on purpose: unlike the invite
 * gates, nothing the player does opens this one — the door and its opening date
 * are the whole message.
 */
export function WalletWithdrawLocked({ className }: WalletWithdrawLockedProps) {
  const t = useAppTranslations();

  return (
    <div className={twMerge('flex flex-col items-center gap-3 text-center', className)}>
      <div className="flex-center ring-electric-purple/20 h-14 w-14 rounded-2xl bg-white/5 ring-1">
        <Lock size={26} className="text-pink-secondary" strokeWidth={2.2} />
      </div>
      <h2 className="text-lg font-extrabold leading-tight text-white">
        {t('withdrawals open after the test')}
      </h2>
      <p className="text-pink-secondary max-w-[280px] text-[12px]">
        {t('withdrawals closed during the test')}
      </p>
    </div>
  );
}
