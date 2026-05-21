'use client';

import '@/styles/components/stakes.css';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { icons } from '@/constants/icons';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { GlobalConstants } from '@/constants/global.constants';
import { twMerge } from 'tailwind-merge';

export interface NewStakeStickyCtaProps {
  level: number;
  amount: number;
  minDeposit: number;
  balance: number;
  tierLocked?: boolean;
  loading?: boolean;
  onConfirm: () => void;
}

export function NewStakeStickyCta({
  level,
  amount,
  minDeposit,
  balance,
  tierLocked = false,
  loading = false,
  onConfirm,
}: NewStakeStickyCtaProps) {
  const t = useAppTranslations();
  const belowMin = amount < minDeposit;
  const insufficient = amount > balance;
  const valid = !belowMin && !insufficient && !tierLocked;

  let label: string;
  if (tierLocked) {
    label = t('locked');
  } else if (belowMin) {
    label = t('min {amount} {coin}', { amount: minDeposit, coin: GlobalConstants.coinName });
  } else if (insufficient) {
    label = t('not enough {coin}', { coin: GlobalConstants.coinName });
  } else {
    label = t('confirm level {level} stake', { level });
  }

  return (
    <div className="sticky bottom-0 mx-5 mt-2  p-0">
      <button
        type="button"
        onClick={valid && !loading ? onConfirm : undefined}
        disabled={!valid || loading}
        className={twMerge(
          'flex w-full items-center justify-between overflow-hidden rounded-2xl px-5 py-3 text-[13px] font-extrabold uppercase tracking-wider text-white transition-transform active:scale-[0.99]',
          valid && !loading
            ? 'stakes-liquid-glass stakes-btn-glow cursor-pointer'
            : 'cursor-not-allowed border border-white/10 bg-white/5 opacity-60 backdrop-blur-md'
        )}
      >
        <span className="relative z-10 mt-1">{label}</span>
        {loading ? (
          <Loader2 size={18} className="relative z-10 animate-spin" />
        ) : valid ? (
          <span className="relative z-10 inline-flex items-center gap-1.5 text-base">
            <Image src={icons.telegramStar} alt="" className="h-3.5 w-auto" />
            <span className="tabular-nums mt-1 font-bold">
              {Math.floor(amount / 100).toLocaleString()}
            </span>
          </span>
        ) : null}
      </button>
    </div>
  );
}
