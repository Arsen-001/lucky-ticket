'use client';

import { Info } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { Ticket } from '@/components/shared/icons/Ticket';
import { DuelPurse } from '@/components/pages/out-tabs/tabs-extra/duel/DuelPurse';
import type { DuelTier } from '@/types/interfaces/duel.interfaces';

export interface DuelGameHeaderProps {
  tickets: number;
  /** Лига: её имя слева, её билеты справа. */
  tier?: DuelTier;
  /**
   * Идёт раунд — слева стоит его номер вместо названия лиги.
   *
   * В матче лига уже выбрана и не меняется, а вот «какой сейчас раунд» —
   * единственное, что двигается и чего больше нигде на экране нет.
   */
  round?: number | null;
  /**
   * Называть ли лигу рядом с игрой.
   *
   * В списке — нет: там лежат столы ВСЕХ лиг, и слово «бронза» над золотым
   * столом читалось как фильтр, которого нет.
   */
  showLeague?: boolean;
  /** Весь кошелёк вместо одной лиги: нужен там, где столы разных лиг. */
  balances?: Readonly<Record<DuelTier, number>>;
  /** Правила стола: их читают один раз, поэтому они живут под кнопкой. */
  onInfo?: () => void;
  /**
   * Показывать ли кошелёк справа.
   *
   * На экране ставки — нет: плитки лиг под ним и так показывают остаток
   * каждой, и число в шапке повторяло бы одну из них.
   */
  wallet?: boolean;
  className?: string;
}

/**
 * Кромка стола: слева — где мы, справа — сколько билетов на руках.
 *
 * Стоит на КАЖДОЙ фазе — в списке, в ожидании, в готовности, в матче. Игрок
 * должен видеть остаток билетов ровно тогда, когда решает, ставить ли их, а
 * не возвращаться за этим в список.
 */
export function DuelGameHeader({
  tickets,
  tier = 'bronze',
  round,
  showLeague = true,
  balances,
  onInfo,
  wallet = true,
  className,
}: DuelGameHeaderProps) {
  const t = useAppTranslations();

  return (
    <div
      className={twMerge(
        'border-electric-purple/25 flex items-center justify-between gap-2 border-b px-0.5 pb-1.5',
        className
      )}
    >
      <span className="flex items-center gap-1.5 text-[11.5px] font-black tracking-[0.14em] uppercase">
        {round ? (
          <>
            {t('duel round')} <span className="text-gold tabular-nums">{round}</span>
          </>
        ) : showLeague ? (
          <>
            {t('duel league')} · <span className="text-purple-secondary">{t(tier)}</span>
          </>
        ) : (
          t('duel league')
        )}

        {onInfo && (
          <button
            type="button"
            onClick={onInfo}
            aria-label={t('duel table rules')}
            className="text-pink-secondary flex-center border-electric-purple/55 size-[18px] rounded-full border"
          >
            <Info size={11} />
          </button>
        )}
      </span>

      {!wallet ? null : balances ? (
        <DuelPurse balances={balances} />
      ) : (
        <span className="text-pink-secondary flex items-center gap-1 text-[11px] font-bold">
          <Ticket type={tier} width={23} height={12} className="object-contain" />
          <span className="text-gold text-[15px] font-extrabold tabular-nums">{tickets}</span>
        </span>
      )}
    </div>
  );
}
