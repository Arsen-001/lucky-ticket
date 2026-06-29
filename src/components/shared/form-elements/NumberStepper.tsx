'use client';

import type { ReactNode } from 'react';
import { Minus, Plus } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export interface NumberStepperProps {
  value: number;
  onChange: (value: number) => void;
  /** Amount added/removed by the −/+ buttons. */
  step?: number;
  min?: number;
  max?: number;
  /** Rendered after the value (e.g. a currency label). */
  suffix?: ReactNode;
  className?: string;
}

/**
 * Controlled number field with −/+ stepper buttons. The buttons move by `step`
 * (clamped to `[min, max]`); the centre value is still free-typed for big jumps,
 * snapping back up to `min` on blur.
 */
export function NumberStepper({
  value,
  onChange,
  step = 1,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  suffix,
  className,
}: NumberStepperProps) {
  const t = useAppTranslations();
  const clamp = (n: number) => Math.min(max, Math.max(min, n));

  const btn =
    'flex-center h-11 w-11 shrink-0 rounded-lg bg-white/10 text-white transition hover:bg-white/15 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white/10 focus-outline';

  const handleInput = (raw: string) => {
    const digits = raw.replace(/[^\d]/g, '');
    onChange(digits ? Math.min(max, Number(digits)) : 0);
  };

  return (
    <div className={twMerge('flex items-center gap-2 rounded-xl bg-white/5 p-1.5', className)}>
      <button
        type="button"
        aria-label={t('decrease')}
        disabled={value <= min}
        onClick={() => onChange(clamp(value - step))}
        className={btn}
      >
        <Minus className="h-5 w-5" strokeWidth={2.6} />
      </button>

      <div className="flex min-w-0 flex-1 items-center justify-center gap-1.5">
        <input
          type="text"
          inputMode="numeric"
          value={value ? value.toLocaleString('en-US') : ''}
          onChange={e => handleInput(e.target.value)}
          onBlur={() => onChange(clamp(value))}
          className="w-full min-w-0 bg-transparent text-center text-lg font-extrabold tabular-nums text-white outline-none"
        />
        {suffix}
      </div>

      <button
        type="button"
        aria-label={t('increase')}
        disabled={value >= max}
        onClick={() => onChange(clamp(value + step))}
        className={btn}
      >
        <Plus className="h-5 w-5" strokeWidth={2.6} />
      </button>
    </div>
  );
}
