'use client';

import '@/styles/components/stakes.css';
import Image from 'next/image';
import { Loader2, Lock } from 'lucide-react';
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
  /** What the tier gate is still short of, already localized. */
  tierLockedHint?: string;
  loading?: boolean;
  onConfirm: () => void;
  /**
   * Tapped when the CTA is blocked by a gate the player can act on (an AP tier,
   * or an LC balance) rather than by something they simply retype. Without it
   * the button is a label that names a requirement and goes nowhere.
   */
  onBlocked?: (reason: 'tier' | 'coins') => void;
}

/**
 * The confirm button, and — when it refuses — the reason.
 *
 * A dimmed button labelled "Locked" is read as a bug, not as a rule: players
 * tapped it, scrolled past it, and asked why the screen was broken. So a
 * blocked CTA now carries an error skin, a lock, a sentence naming what is
 * missing, and an invitation to tap it for the screen that fixes it.
 */
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
  tierLockedHint,
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
  let reason: string | null = null;
  if (tierLocked) {
    label = t('level {level} is locked', { level });
    reason = tierLockedHint ?? null;
  } else if (belowMin) {
    label = t('min {amount} {coin}', {
      amount: minDeposit.toLocaleString(),
      coin: GlobalConstants.coinName,
    });
    reason = t('raise the amount to at least {amount} {coin}', {
      amount: minDeposit.toLocaleString(),
      coin: GlobalConstants.coinName,
    });
  } else if (insufficient) {
    label = t('not enough {coin}', { coin: GlobalConstants.coinName });
    reason = t('not enough coins description', {
      balance: `${balance.toLocaleString()} ${GlobalConstants.coinName}`,
      required: `${amount.toLocaleString()} ${GlobalConstants.coinName}`,
    });
  } else {
    label = t('confirm level {level} stake', { level });
  }

  return (
    <div>
      <button
        type="button"
        onClick={valid && !loading ? onConfirm : explainable ? explainBlock : undefined}
        disabled={(!valid && !explainable) || loading}
        aria-disabled={!valid}
        className={twMerge(
          'flex w-full items-center justify-between overflow-hidden rounded-2xl px-5 py-3 text-[13px] font-extrabold uppercase tracking-wider text-white transition-transform active:scale-[0.99]',
          valid && !loading
            ? 'stakes-liquid-glass stakes-btn-glow cursor-pointer'
            : 'border-error/50 bg-error/20 text-error-text border backdrop-blur-md',
          !valid && (explainable ? 'cursor-pointer' : 'cursor-not-allowed')
        )}
      >
        <span className="relative z-10 flex items-center gap-2">
          {!valid && !loading && <Lock size={14} strokeWidth={2.8} className="shrink-0" />}
          {label}
        </span>
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
      {/* The refusal always says why, right under the button that refused. */}
      {!valid && (reason || explainable) && (
        <div className="text-error-text mt-1.5 text-center text-[10px] font-bold leading-snug">
          {reason}
          {explainable && (
            <span className="text-white-secondary block font-semibold">
              {t('tap to see how to unlock')}
            </span>
          )}
        </div>
      )}
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
