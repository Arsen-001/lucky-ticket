'use client';

import { twMerge } from 'tailwind-merge';
import { Ticket } from '@/components/shared/icons/Ticket';

export interface DuelStakeBadgeProps {
  stake: number;
  className?: string;
}

/**
 * Ставка лобби — числом и самим билетом.
 *
 * Билет здесь настоящий (бронзовый, как на балансе), а не эмодзи и не слово
 * «ставка»: игрок должен видеть, чем платит, тем же предметом, которым платит.
 */
export function DuelStakeBadge({ stake, className }: DuelStakeBadgeProps) {
  return (
    <span
      className={twMerge(
        'bg-gold/15 text-gold flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1',
        'text-xs font-extrabold tabular-nums',
        className
      )}
    >
      <Ticket type="bronze" width={30} height={15} className="h-auto w-[30px]" />
      {stake}
    </span>
  );
}
