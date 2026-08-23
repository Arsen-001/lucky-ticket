'use client';

import { twMerge } from 'tailwind-merge';
import { Ticket } from '@/components/shared/icons/Ticket';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { DuelTier } from '@/types/interfaces/duel.interfaces';

export interface DuelPotPreviewProps {
  /** Ставка одного игрока: на столе окажется вдвое больше. */
  stake: number;
  tier: DuelTier;
  className?: string;
}

/**
 * Банк на столе: два билета лицом друг к другу и цифра, которую забирает
 * победитель.
 *
 * Между ставкой и кнопками зияла пустая треть экрана, а самый важный ответ —
 * «сколько я получу» — стоял строчкой мелким шрифтом. Здесь он лежит на столе
 * тем самым билетом выбранной лиги: золото и бронза выглядят по-разному, и
 * решение «стоит ли» принимается по картинке.
 */
export function DuelPotPreview({ stake, tier, className }: DuelPotPreviewProps) {
  const t = useAppTranslations();

  return (
    <div className={twMerge('flex flex-col items-center justify-center gap-3', className)}>
      <span aria-hidden className="flex items-center">
        <Ticket
          type={tier}
          width={104}
          height={104}
          className="h-[66px] w-[104px] -rotate-6 object-contain drop-shadow-[0_14px_18px_rgba(0,0,0,0.6)]"
        />
        <Ticket
          type={tier}
          width={104}
          height={104}
          className="-ms-9 h-[66px] w-[104px] rotate-6 object-contain drop-shadow-[0_14px_18px_rgba(0,0,0,0.6)]"
        />
      </span>

      <span className="text-gold text-center text-[14px] font-extrabold tabular-nums">
        {t('duel winner takes', { count: stake * 2 })}
      </span>
    </div>
  );
}
