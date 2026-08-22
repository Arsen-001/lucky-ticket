'use client';

import { useAppTranslations } from '@/hooks/useAppTranslations';
import { Ticket } from '@/components/shared/icons/Ticket';
import type { DuelTier } from '@/types/interfaces/duel.interfaces';

export interface DuelGameHeaderProps {
  tickets: number;
  /** Лига: её имя слева, её билеты справа. */
  tier?: DuelTier;
}

/**
 * Шапка игры: лига слева, запас билетов справа.
 *
 * Стоит на КАЖДОЙ фазе — в списке, в ожидании, в готовности, в матче. Игрок
 * должен видеть остаток билетов ровно тогда, когда решает, ставить ли их, а
 * не возвращаться за этим в список.
 */
export function DuelGameHeader({ tickets, tier = 'bronze' }: DuelGameHeaderProps) {
  const t = useAppTranslations();

  return (
    <div className="flex items-center justify-between px-0.5 pb-1">
      <span className="text-[12px] font-black tracking-[0.14em] uppercase">
        {t('duel league')} · <span className="text-gold">{t(tier)}</span>
      </span>
      <span className="text-pink-secondary text-[11px] font-bold tracking-[0.1em] uppercase">
        <Ticket
          type={tier}
          width={22}
          height={22}
          className="mr-1 inline-block h-[14px] w-[22px] object-contain align-[-2px]"
        />
        <span className="text-gold text-[14px] tabular-nums">{tickets}</span>
      </span>
    </div>
  );
}
