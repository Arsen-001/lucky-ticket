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
  /** The band the deposit falls in, or `0` when it clears none. */
  level: number;
  amount: number;
  balance: number;
  stakeFee: number;
  stakeFeeFree: boolean;
  freeStartsRemaining: number;
  /** Hint text shown under the CTA explaining the duration trade-off. */
  hint?: string;
  /** LC balance left after this stake locks the deposit — shown as subtitle when valid. */
  balanceAfter?: number;
  loading?: boolean;
  onConfirm: () => void;
  /**
   * Tapped when the CTA is blocked by something the player can act on (an LC
   * balance). Without it the button is a label that names a requirement and
   * goes nowhere.
   */
  onBlocked?: (reason: 'coins') => void;
}

/**
 * The confirm button, and — when it refuses — the reason.
 *
 * Two of the three refusals it used to carry are gone: there is no tier gate on
 * a band any more, and no minimum deposit to fall under. What is left is an
 * empty amount (fixed by typing) and a balance that will not cover it (fixed
 * elsewhere, so that one stays tappable and says where).
 */
export function NewStakeStickyCta({
  level,
  amount,
  balance,
  stakeFee,
  stakeFeeFree,
  freeStartsRemaining,
  hint,
  balanceAfter,
  loading = false,
  onConfirm,
  onBlocked,
}: NewStakeStickyCtaProps) {
  const t = useAppTranslations();
  const stakeCfg = useStakesDisplayConfig();
  const empty = amount <= 0;
  const insufficient = amount > balance;
  const valid = !empty && !insufficient;
  const explainBlock = insufficient && onBlocked ? () => onBlocked('coins') : undefined;
  const explainable = !!explainBlock && !loading;

  let label: string;
  let reason: string | null = null;
  if (empty) {
    label = t('enter an amount');
    reason = null;
  } else if (insufficient) {
    label = t('not enough {coin}', { coin: GlobalConstants.coinName });
    reason = t('not enough coins description', {
      balance: `${balance.toLocaleString()} ${GlobalConstants.coinName}`,
      required: `${amount.toLocaleString()} ${GlobalConstants.coinName}`,
    });
  } else {
    // A level-0 stake is a stake, so the button confirms it by name rather than
    // quoting "level 0" at a player who never picked a level.
    label = level > 0 ? t('confirm level {level} stake', { level }) : t('confirm stake');
  }

  return (
    <div>
      {/* Everything explanatory sits ABOVE the button so the button itself is
          the last thing on the screen, flush against the bottom edge. With the
          balance-after line and the duration hint underneath it, the tap target
          floated two text rows up from the edge it is supposed to sit on. */}
      {valid && balanceAfter !== undefined && (
        <div className="text-white-secondary mb-1.5 text-center text-[10px] tabular-nums">
          {t('balance after {n} {coin}', {
            n: balanceAfter.toLocaleString(),
            coin: GlobalConstants.coinName,
          })}
        </div>
      )}
      {hint && valid && (
        <div className="text-pink-secondary mb-1.5 text-center text-[10px] font-semibold">
          {hint}
        </div>
      )}
      {!valid && (reason || explainable) && (
        <div className="text-error-text mb-1.5 text-center text-[10px] font-bold leading-snug">
          {reason}
          {explainable && (
            <span className="text-white-secondary block font-semibold">
              {t('tap to see how to unlock')}
            </span>
          )}
        </div>
      )}
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
                {freeStartsRemaining}/{stakeCfg.freeStartCount}
              </span>
            </span>
          ) : (
            <span className="relative z-10 inline-flex items-center gap-1.5 text-base">
              <Image sizes="14px" src={icons.telegramStar} alt="" className="h-3.5 w-auto" />
              <span className="font-bold leading-none tabular-nums">
                {stakeFee.toLocaleString()}
              </span>
            </span>
          )
        ) : null}
      </button>
    </div>
  );
}
