'use client';

import { twMerge } from 'tailwind-merge';
import { Ticket } from '@/components/shared/icons/Ticket';
import { DUEL_TIERS } from '@/components/pages/out-tabs/tabs-extra/duel/DuelTierPicker';
import type { DuelTier } from '@/types/interfaces/duel.interfaces';

export interface DuelPurseProps {
  balances: Readonly<Record<DuelTier, number>>;
  className?: string;
}

/**
 * Весь кошелёк в шапке: пять лиг сразу.
 *
 * В списке лежат столы всех лиг, и одно число «17 билетов» отвечало только про
 * бронзу — по золотому столу игрок не мог сказать, хватает ему или нет, не
 * уходя на экран ставки. Пустая лига видна, но приглушена: ноль тоже ответ.
 */
export function DuelPurse({ balances, className }: DuelPurseProps) {
  return (
    <span className={twMerge('flex items-center gap-2', className)}>
      {DUEL_TIERS.map(tier => {
        const count = balances[tier] ?? 0;
        return (
          <span
            key={tier}
            className={twMerge(
              'flex items-center gap-1 text-[12.5px] font-extrabold tabular-nums',
              count < 1 && 'opacity-30'
            )}
          >
            {/* Коробка билета равна самому билету (256×133): квадрат 20×20
                держал шесть пустых пикселей, и число отъезжало от картинки. */}
            <Ticket type={tier} width={21} height={11} className="object-contain" />
            {count}
          </span>
        );
      })}
    </span>
  );
}
