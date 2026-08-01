'use client';

import '@/styles/components/stakes.css';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { icons } from '@/constants/icons';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useStakesDisplayConfig } from '@/hooks/useStakesDisplayConfig';
import { GlobalConstants } from '@/constants/global.constants';
import { twMerge } from 'tailwind-merge';

export interface NewStakeStickyCtaProps {
  level: number;
  amount: number;
  minDeposit: number;
  balance: number;
  stakeFee: number;
  stakeFeeFree: boolean;
  bronzeFreeRemaining: number;
  /** Hint text shown under the CTA explaining the duration trade-off. */
  hint?: string;
  /** LC balance left after this stake locks the deposit — shown as subtitle when valid. */
  balanceAfter?: number;
  tierLocked?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  /**
   * Tapped when the CTA is blocked by a gate the player can act on (an AP tier,
   * or an LC balance) rather than by something they simply retype. Without it
   * the button is a label that names a requirement and goes nowhere.
   */
  onBlocked?: (reason: 'tier' | 'coins') => void;
}

export function NewStakeStickyCta({
  level,
  amount,
  minDeposit,
  balance,
  stakeFee,
  stakeFeeFree,
  bronzeFreeRemaining,
  hint,
  balanceAfter,
  tierLocked = false,
  loading = false,
  onConfirm,
  onBlocked,
}: NewStakeStickyCtaProps) {
  const t = useAppTranslations();
  const stakeCfg = useStakesDisplayConfig();
  const belowMin = amount < minDeposit;
  const insufficient = amount > balance;
  const valid = !belowMin && !insufficient && !tierLocked;
  // "Below minimum" is fixed by typing a bigger number — the slider is right
  // there. The other two are earned elsewhere, so those stay tappable and
  // explain where. Tier wins when both apply: it blocks every amount.
  const blockedReason = tierLocked ? 'tier' : insufficient ? 'coins' : null;
  const explainBlock = blockedReason && onBlocked ? () => onBlocked(blockedReason) : undefined;
  const explainable = !!explainBlock && !loading;

  let label: string;
  if (tierLocked) {
    label = t('locked');
  } else if (belowMin) {
    label = t('min {amount} {coin}', {
      amount: minDeposit.toLocaleString(),
      coin: GlobalConstants.coinName,
    });
  } else if (insufficient) {
    label = t('not enough {coin}', { coin: GlobalConstants.coinName });
  } else {
    label = t('confirm level {level} stake', { level });
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={valid && !loading ? onConfirm : explainable ? explainBlock : undefined}
        disabled={(!valid && !explainable) || loading}
        className={twMerge(
          'flex w-full items-center justify-between overflow-hidden rounded-2xl px-5 py-3 text-[13px] font-extrabold uppercase tracking-wider text-white transition-transform active:scale-[0.99]',
          valid && !loading
            ? 'stakes-liquid-glass stakes-btn-glow cursor-pointer'
            : 'border border-white/10 bg-white/5 opacity-60 backdrop-blur-md',
          !valid && (explainable ? 'cursor-pointer' : 'cursor-not-allowed')
        )}
      >
        <span className="relative z-10">{label}</span>
        {loading ? (
          <Loader2 size={18} className="relative z-10 animate-spin" />
        ) : valid ? (
          stakeFeeFree ? (
            <span className="relative z-10 inline-flex items-center gap-1.5 text-[12px] font-extrabold uppercase tracking-wider text-white">
              <span className="leading-none">{t('free')}</span>
              <span className="text-bronze inline-flex items-center rounded-full bg-bronze/20 px-1.5 py-0.5 text-[9px] font-bold leading-none tabular-nums">
                {bronzeFreeRemaining}/{stakeCfg.bronzeFreeStartCount}
              </span>
            </span>
          ) : (
            <span className="relative z-10 inline-flex items-center gap-1.5 text-base">
              <Image src={icons.telegramStar} alt="" className="h-3.5 w-auto" />
              <span className="font-bold leading-none tabular-nums">
                {stakeFee.toLocaleString()}
              </span>
            </span>
          )
        ) : null}
      </button>
      {valid && balanceAfter !== undefined && (
        <div className="text-white-secondary mt-1.5 text-center text-[10px] tabular-nums">
          {t('balance after {n} {coin}', {
            n: balanceAfter.toLocaleString(),
            coin: GlobalConstants.coinName,
          })}
        </div>
      )}
      {hint && valid && (
        <div className="text-pink-secondary mt-1 text-center text-[10px] font-semibold">{hint}</div>
      )}
    </div>
  );
}
