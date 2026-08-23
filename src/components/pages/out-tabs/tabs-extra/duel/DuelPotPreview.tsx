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

/** С четырёх штук веер лёжа перестаёт помещаться — билеты встают. */
const STANDING_FROM = 4;

/**
 * Банк на столе: билеты лицом к игроку и цифра, которую забирает победитель.
 *
 * На стол кладут РОВНО столько билетов, сколько ставят: ставка это не число в
 * подписи, а стопка, которая растёт под рукой. До трёх они лежат веером, с
 * четырёх — встают в ряд: лёжа четвёртый и пятый уже не помещаются в колонку,
 * а мельчить билет нельзя, по нему узнают лигу.
 */
export function DuelPotPreview({ stake, tier, className }: DuelPotPreviewProps) {
  const t = useAppTranslations();

  const standing = stake >= STANDING_FROM;
  const count = Math.max(1, stake);
  // Веер симметричен относительно середины: середина стопки смотрит прямо.
  const middle = (count - 1) / 2;

  return (
    <div className={twMerge('flex flex-col items-center justify-center gap-3', className)}>
      <span aria-hidden className="flex items-center justify-center">
        {Array.from({ length: count }, (_, index) => {
          const tilt = (index - middle) * (standing ? 6 : 9);

          if (standing) {
            return (
              <span
                key={index}
                className={twMerge(
                  'flex-center h-[104px] w-[58px] shrink-0',
                  index > 0 && '-ms-[10px]'
                )}
                style={{ transform: `rotate(${tilt}deg)` }}
              >
                {/* Билет повёрнут, а коробка под него — вертикальная: поворот
                    не меняет место в раскладке, и без обёртки соседи налезали
                    бы на пустоту вместо картинки. */}
                <Ticket
                  type={tier}
                  width={96}
                  height={50}
                  className="max-w-none rotate-90 object-contain drop-shadow-[0_14px_18px_rgba(0,0,0,0.6)]"
                />
              </span>
            );
          }

          return (
            <Ticket
              key={index}
              type={tier}
              width={104}
              height={54}
              className={twMerge(
                'shrink-0 object-contain drop-shadow-[0_14px_18px_rgba(0,0,0,0.6)]',
                index > 0 && '-ms-9'
              )}
              style={{ transform: `rotate(${tilt}deg)` }}
            />
          );
        })}
      </span>

      <span className="text-gold text-center text-[14px] font-extrabold tabular-nums">
        {t('duel winner takes', { count: stake * 2 })}
      </span>
    </div>
  );
}
