'use client';

import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';

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
 * The hero amount doubles as the input: tap the number and type any sum.
 * The slider and the presets stay for coarse picks, but they can't express
 * "exactly 137,500", which is what typing is for.
 *
 * Only the balance clamps on commit. A below-minimum amount is left alone on
 * purpose — the sticky CTA already answers it with "min 10,000 LC", which
 * teaches the rule instead of silently overwriting what the player typed.
 */
export function NewStakeAmountField({ value, max, onChange, className }: NewStakeAmountFieldProps) {
  const t = useAppTranslations();
  const [draft, setDraft] = useState<string | null>(null);

  const shown = draft ?? value.toLocaleString();

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
        setDraft(value.toLocaleString());
        event.target.select();
      }}
      onChange={event => {
        const digits = digitsOf(event.target.value);
        setDraft(digits ? Number(digits).toLocaleString() : '');
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
