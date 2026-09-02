'use client';

import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export interface TikkiBoostChipProps {
  /** Что покупка двигает — «пассив», «за тап». */
  label: string;
  /** Текущее значение крупно: его игрок и сравнивает до и после покупки. */
  value: ReactNode;
  /** Куда отнести стрелку: она всегда уходит во ВНЕШНИЙ угол, к краю экрана. */
  side?: 'left' | 'right';
  /** Ступень куплена вся: стрелки нет, чип остаётся как показание. */
  maxed?: boolean;
  /** Денег не хватает: стрелка гаснет, но чип по-прежнему открывает окно. */
  poor?: boolean;
  onClick: () => void;
  className?: string;
}

/**
 * Точка прокачки прямо на сцене — 78×51, по одной у каждого края.
 *
 * Стоят они вокруг Тикки, а не списком под ним: покупка меняет то, что игрок в
 * этот момент видит, и цифра обязана быть рядом с тем, что она описывает.
 * Стрелка — бейдж 17×17 во внешнем углу: он слегка выходит за карточку, чтобы
 * читался как значок действия, а не как часть числа.
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
        'relative grid w-[78px] flex-none justify-items-center gap-px rounded-[14px] px-1 py-2',
        'bg-[rgba(20,18,36,0.6)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] backdrop-blur-[2px]',
        'focus-visible:outline-teal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        maxed && 'opacity-70',
        className
      )}
    >
      <span className="flex items-center text-[15px] font-extrabold leading-[1.4] text-white tabular-nums">
        {value}
      </span>
      <span className="text-muted text-[9px] font-extrabold uppercase leading-[1.45] tracking-[0.08em]">
        {label}
      </span>

      {!maxed && (
        <span
          aria-hidden
          className={twMerge(
            'absolute -top-0.5 grid size-[17px] place-items-center rounded-full text-[9.5px] font-extrabold leading-none',
            side === 'left' ? '-start-px' : '-end-px',
            poor
              ? 'bg-background text-[#6f6880] shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.12)]'
              : 'bg-[#2f7a5c] text-[#dff3ea] shadow-[0_0_0_1.5px_rgba(27,25,48,0.95),0_0_7px_rgba(47,122,92,0.4)]'
          )}
        >
          ↑
        </span>
      )}
    </button>
  );
}
