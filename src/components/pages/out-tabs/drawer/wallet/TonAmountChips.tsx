'use client';

import { twMerge } from 'tailwind-merge';
import { formatTon } from '@/utils/pages/wallet.utils';

interface TonAmountChipsProps {
  /** Amounts to offer, already filtered against the limits the server enforces. */
  amounts: readonly number[];
  /** Currently typed amount — the matching chip reads as selected. */
  value: number;
  onPick: (amount: number) => void;
  className?: string;
}

/**
 * One-tap TON amounts. These are not a convenience: a Telegram keyboard without
 * a decimal key leaves no other way to enter 0.1 or 0.5, which is most of the
 * range the wallet allows.
 */
export function TonAmountChips({ amounts, value, onPick, className }: TonAmountChipsProps) {
  if (!amounts.length) return null;

  return (
    <div className={twMerge('flex flex-wrap gap-2', className)}>
      {amounts.map(amount => (
        <button
          key={amount}
          type="button"
          onClick={() => onPick(amount)}
          className={twMerge(
            'rounded-lg border px-3 py-1.5 text-[11px] font-extrabold tabular-nums transition-colors',
            value === amount
              ? 'border-electric-purple bg-electric-purple/20 text-white'
              : 'border-white/15 bg-white/5 text-pink-secondary hover:text-white'
          )}
        >
          {formatTon(amount, 4)} TON
        </button>
      ))}
    </div>
  );
}
