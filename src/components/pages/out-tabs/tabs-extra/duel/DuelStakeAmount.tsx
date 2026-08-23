'use client';

import { twMerge } from 'tailwind-merge';
import { Ticket } from '@/components/shared/icons/Ticket';
import type { DuelTier } from '@/types/interfaces/duel.interfaces';

export type DuelStakeAmountSize = 'sm' | 'md' | 'lg';

/**
 * Куда кладётся билет относительно числа.
 *
 * `row` — в строку, как пишут сумму. `column` — числом сверху, билетом под ним:
 * так стоят фишки ставки, где пять плиток в ряд и вширь места нет.
 */
export type DuelStakeAmountLayout = 'row' | 'column';

export interface DuelStakeAmountProps {
  stake: number;
  /** Лига стола: билет, которым платят, стоит сразу за числом. */
  tier: DuelTier;
  size?: DuelStakeAmountSize;
  layout?: DuelStakeAmountLayout;
  className?: string;
  classNames?: { value?: string; ticket?: string };
}

/**
 * Ставка пишется как деньги: число и вплотную за ним билет, которым платят.
 *
 * Раньше каждый экран собирал эту пару сам, и билет уезжал от числа: `Ticket`
 * ставит инлайновый `style={{width,height}}`, который бьёт классы `h-`/`w-`,
 * поэтому `width={28} height={28}` рисовал картинку 28×15 в коробке 28×28 —
 * шесть пустых пикселей сверху и снизу вдобавок к отступу. Здесь коробка равна
 * самому билету (256×133 ⇒ ≈1.93), и пара читается одним числом.
 */
export function DuelStakeAmount({
  stake,
  tier,
  size = 'md',
  layout = 'row',
  className,
  classNames,
}: DuelStakeAmountProps) {
  // Размер и интерлиньяж ОДНИМ классом (`text-[20px]/none`), а не двумя.
  // Отдельный `leading-none` рядом с `text-[…]` съедает `twMerge`: у него
  // размер шрифта конфликтует с интерлиньяжем, потому что в Tailwind размер
  // умеет задавать оба (`text-lg/none`). Разница видна на фишке ставки: строка
  // числа становилась 30 px вместо 20, лишние 5 px падали ПОД цифру, и билет
  // оказывался в 7 px от числа и в 4 px от нижней кромки — то есть ближе к
  // кромке, чем к тому, к чему относится.
  const valueClasses: Record<DuelStakeAmountSize, string> = {
    sm: 'text-[13px]/none',
    md: 'text-[15px]/none',
    lg: 'text-[20px]/none',
  };
  // Вплотную: 3 px в строке и 2 px столбиком. Дальше уже не пара, а две вещи.
  const gapClasses: Record<DuelStakeAmountSize, string> = {
    sm: 'gap-[3px]',
    md: 'gap-[3px]',
    lg: 'gap-[4px]',
  };
  const columnGapClasses: Record<DuelStakeAmountSize, string> = {
    sm: 'gap-[1px]',
    md: 'gap-[2px]',
    lg: 'gap-[2px]',
  };
  const ticketSizes: Record<DuelStakeAmountSize, { width: number; height: number }> = {
    sm: { width: 21, height: 11 },
    md: { width: 25, height: 13 },
    lg: { width: 31, height: 16 },
  };

  return (
    <span
      className={twMerge(
        'inline-flex items-center',
        layout === 'column' ? `flex-col ${columnGapClasses[size]}` : gapClasses[size],
        className
      )}
    >
      <span
        className={twMerge(
          'text-gold font-extrabold tabular-nums',
          valueClasses[size],
          classNames?.value
        )}
      >
        {stake}
      </span>
      <Ticket
        type={tier}
        width={ticketSizes[size].width}
        height={ticketSizes[size].height}
        className={twMerge('object-contain', classNames?.ticket)}
      />
    </span>
  );
}
