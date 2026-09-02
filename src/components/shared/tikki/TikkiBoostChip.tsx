'use client';

import type { ReactNode } from 'react';
import { ArrowUp } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export interface TikkiBoostChipProps {
  /** Что покупка двигает — «пассив», «за тап», «окно». */
  label: string;
  /** Текущее значение крупно: его игрок и сравнивает до и после покупки. */
  value: ReactNode;
  /** Куда отнести стрелку — чтобы она не налезала на Тикки в центре. */
  side?: 'left' | 'right';
  /** Ступень куплена вся: стрелки нет, чип остаётся как показание. */
  maxed?: boolean;
  /** Денег не хватает: чип нажимается, но окно покупки скажет, сколько нужно. */
  poor?: boolean;
  onClick: () => void;
  className?: string;
}

/**
 * Точка прокачки прямо на сцене. Их четыре, по одной на каждый буст, и стоят
 * они вокруг Тикки, а не списком под ним: покупка меняет то, что игрок в этот
 * момент видит, и цифра обязана быть рядом с тем, что она описывает.
 */
export function TikkiBoostChip({
  label,
  value,
  side = 'left',
  maxed = false,
  poor = false,
  onClick,
  className,
}: TikkiBoostChipProps) {
  const t = useAppTranslations();

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={maxed}
      aria-label={`${label} — ${maxed ? t('max level') : t('upgrade')}`}
      className={twMerge(
        'card-outlined relative flex min-w-[92px] flex-col items-start gap-0.5 rounded-2xl px-3 py-2',
        'text-left transition-opacity disabled:opacity-60',
        'focus-visible:outline-teal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        className
      )}
    >
      <span className="flex items-center gap-1 text-base font-extrabold tabular-nums leading-none">
        {value}
      </span>
      <span className="text-muted text-[10px] font-bold uppercase tracking-wide">{label}</span>

      {!maxed && (
        <span
          aria-hidden
          className={twMerge(
            'absolute -top-2 flex size-6 items-center justify-center rounded-full border',
            side === 'left' ? '-left-2' : '-right-2',
            poor
              ? 'border-white/15 bg-white/10 text-white/45'
              : 'border-success/50 bg-success/25 text-success'
          )}
        >
          <ArrowUp size={13} strokeWidth={3} />
        </span>
      )}
    </button>
  );
}
