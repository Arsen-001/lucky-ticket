'use client';

import { twMerge } from 'tailwind-merge';
import { Ticket } from '@/components/shared/icons/Ticket';
import type { DuelTier } from '@/types/interfaces/duel.interfaces';

export type DuelStakeAmountSize = 'sm' | 'md' | 'lg';

export interface DuelStakeAmountProps {
  stake: number;
  /** Лига стола: билет, которым платят, стоит сразу за числом. */
  tier: DuelTier;
  size?: DuelStakeAmountSize;
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
  className,
  classNames,
}: DuelStakeAmountProps) {
  const valueClasses: Record<DuelStakeAmountSize, string> = {
    sm: 'text-[13px]',
    md: 'text-[15px]',
    lg: 'text-[20px]',
  };
  const gapClasses: Record<DuelStakeAmountSize, string> = {
    sm: 'gap-1',
    md: 'gap-1',
    lg: 'gap-1.5',
  };
  const ticketSizes: Record<DuelStakeAmountSize, { width: number; height: number }> = {
    sm: { width: 21, height: 11 },
    md: { width: 25, height: 13 },
    lg: { width: 31, height: 16 },
  };

  return (
    <span className={twMerge('inline-flex items-center', gapClasses[size], className)}>
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
