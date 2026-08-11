'use client';

import { useAppTranslations } from '@/hooks/useAppTranslations';
import { formatTon } from '@/utils/pages/wallet.utils';

export interface WalletAccountTonNoteProps {
  balance: number;
}

/**
 * The account's TON while no wallet is bound.
 *
 * The balance lives on the ACCOUNT, not on the wallet — an LC→TON conversion
 * credits it with no wallet involved, and removing a binding leaves it
 * untouched. Both hero states without a connection used to render nothing at
 * all, so a player who converted coins (or simply swapped wallets) opened the
 * wallet screen and saw no trace of their own money.
 */
export function WalletAccountTonNote({ balance }: WalletAccountTonNoteProps) {
  const t = useAppTranslations();
  if (balance <= 0) return null;

  return (
    <div className="bg-background-overlay/60 mt-3 flex w-full items-center justify-between rounded-xl px-3 py-2">
      <span className="text-pink-secondary text-[10px] font-bold uppercase tracking-wider">
        {t('ton on account')}
      </span>
      <span className="text-gold text-sm font-extrabold tabular-nums">
        {formatTon(balance, 4)} TON
      </span>
    </div>
  );
}
