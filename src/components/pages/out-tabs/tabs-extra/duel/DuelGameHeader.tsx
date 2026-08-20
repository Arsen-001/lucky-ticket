'use client';

import { useAppTranslations } from '@/hooks/useAppTranslations';

export interface DuelGameHeaderProps {
  tickets: number;
}

/**
 * Шапка игры: лига слева, запас билетов справа.
 *
 * Стоит на КАЖДОЙ фазе — в списке, в ожидании, в готовности, в матче. Игрок
 * должен видеть остаток билетов ровно тогда, когда решает, ставить ли их, а
 * не возвращаться за этим в список.
 */
export function DuelGameHeader({ tickets }: DuelGameHeaderProps) {
  const t = useAppTranslations();

  return (
    <div className="flex items-center justify-between px-0.5 pb-1">
      <span className="text-[12px] font-black tracking-[0.14em] uppercase">
        {t('duel league')} · <span className="text-gold">{t('duel league bronze')}</span>
      </span>
      <span className="text-pink-secondary text-[11px] font-bold tracking-[0.1em] uppercase">
        <span className="text-gold text-[14px] tabular-nums">{tickets}</span>{' '}
        {t('duel tickets left')}
      </span>
    </div>
  );
}
