'use client';

import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { formatNumber } from '@/utils/global/number.utils';

export interface NewStakeAmountFieldProps {
  /** Committed deposit in LC. */
  value: number;
  /** Hard ceiling — a player can never lock more LC than they hold. */
  max: number;
  onChange: (value: number) => void;
  className?: string;
}

const digitsOf = (raw: string) => raw.replace(/\D/g, '');

/**
 * Grouped the way every other number on the screen is — `formatNumber` follows
 * the APP's language, while a bare `toLocaleString()` follows the BROWSER's, so
 * a Russian UI in an English Chrome printed "150,000" here beside "1 800 AP"
 * one card below.
 */

/**
 * The hero amount doubles as the input: tap the number and type any sum.
 * The slider and the presets stay for coarse picks, but they can't express
 * "exactly 137,500", which is what typing is for.
 *
 * Only the balance clamps on commit — there is no minimum any more. A deposit
 * under the cheapest band is a perfectly valid stake; it just earns the plain
 * duration APR with no band boost, which the hero says out loud.
 */
export function NewStakeAmountField({ value, max, onChange, className }: NewStakeAmountFieldProps) {
  const t = useAppTranslations();
  const [draft, setDraft] = useState<string | null>(null);

  const shown = draft ?? formatNumber(value);

  const commit = () => {
    if (draft === null) return;
    const digits = digitsOf(draft);
    setDraft(null);
    onChange(Math.min(digits ? Number(digits) : 0, max));
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      value={shown}
      aria-label={t('you will lock')}
      onFocus={event => {
        setDraft(formatNumber(value));
        event.target.select();
      }}
      onChange={event => {
        const digits = digitsOf(event.target.value);
        setDraft(digits ? formatNumber(Number(digits)) : '');
      }}
      onBlur={commit}
      onKeyDown={event => {
        if (event.key === 'Enter') event.currentTarget.blur();
        if (event.key === 'Escape') {
          setDraft(null);
          event.currentTarget.blur();
        }
      }}
      // `ch` tracks the digit width under tabular-nums, so the field hugs the
      // number instead of stretching the whole hero row.
      style={{ width: `${Math.max(4, shown.length)}ch` }}
      className={twMerge(
        'text-gold caret-electric-pink border-b border-dashed border-white/20 bg-transparent text-center',
        'text-[38px] font-extrabold leading-none tabular-nums tracking-tight',
        'transition-colors focus:border-electric-pink focus:outline-none',
        className
      )}
    />
  );
}
