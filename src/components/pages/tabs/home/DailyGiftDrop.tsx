'use client';

import { twMerge } from 'tailwind-merge';
import { Ticket } from '@/components/shared/icons/Ticket';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { formatNumber } from '@/utils/global/number.utils';
import type { TicketType } from '@/types/types/ticket.types';

export interface DailyGiftDropProps {
  tickets: number;
  lc: number;
  tier: TicketType;
  className?: string;
}

/**
 * Что платит сегодняшняя ступень — одной строкой, а не двумя плитками.
 *
 * Плитки были правильными, пока подарок был плоским: два числа на равных, и
 * читать их можно в любом порядке. У серии главное число — номер дня, а награда
 * при нём подпись, и строка ставит её на это место.
 *
 * Нулевая половина не рисуется вовсе: первые дни лестницы платят билетами, и
 * «+0 LC» рядом с ними выглядит как ошибка, а не как замысел.
 */
export function DailyGiftDrop({ tickets, lc, tier, className }: DailyGiftDropProps) {
  if (tickets <= 0 && lc <= 0) return null;

  return (
    <span
      className={twMerge(
        'inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 py-1.5 pr-3.5 pl-2',
        className
      )}
    >
      {tickets > 0 && (
        <span className="flex items-center gap-1.5">
          <Ticket type={tier} width={34} />
          <span className="text-[15px] font-extrabold tabular-nums text-white">
            {formatNumber(tickets)}
          </span>
        </span>
      )}

      {tickets > 0 && lc > 0 && <span className="text-muted text-[15px]">·</span>}

      {lc > 0 && (
        <span className="flex items-center gap-1.5">
          <LcLabel size={24} interactive={false} />
          <span className="text-[15px] font-extrabold tabular-nums text-white">
            {formatNumber(lc)}
          </span>
        </span>
      )}
    </span>
  );
}
