'use client';

import { twMerge } from 'tailwind-merge';
import { DuelStakeAmount } from '@/components/pages/out-tabs/tabs-extra/duel/DuelStakeAmount';
import type { DuelTier } from '@/types/interfaces/duel.interfaces';

export interface DuelStakePickerProps {
  value: number;
  min: number;
  max: number;
  /** Билеты в выбранной лиге: чего нет на руках, того нельзя поставить. */
  tickets: number;
  /** Лига: её билет стоит вплотную к числу. */
  tier: DuelTier;
  onChange: (stake: number) => void;
  className?: string;
}

/**
 * Сколько билетов на кону — фишками, а не ползунком.
 *
 * Фишка это цена: она лежит на столе, её видно целиком, и недоступные суммы
 * гаснут по остатку билетов — до тапа, а не после отказа сервера. Число и билет
 * стоят в одну строку, как пишут любую сумму: столбиком между ними зияли
 * полтора десятка пустых пикселей, и цифра читалась отдельно от того, чем
 * платят.
 */
export function DuelStakePicker({
  value,
  min,
  max,
  tickets,
  tier,
  onChange,
  className,
}: DuelStakePickerProps) {
  return (
    <div className={twMerge('grid grid-cols-5 gap-2', className)}>
      {Array.from({ length: max - min + 1 }, (_, i) => i + min).map(stake => (
        <button
          key={stake}
          type="button"
          aria-pressed={value === stake}
          disabled={stake > tickets}
          onClick={() => onChange(stake)}
          className={twMerge(
            'duel-rim flex h-14 items-center justify-center rounded-xl transition',
            'disabled:opacity-30',
            value === stake && 'duel-rim-on'
          )}
        >
          {/* Билет лиги, а не сокращение «бил.»: картинку не нужно переводить,
              и сразу видно, чем платят. */}
          <DuelStakeAmount
            stake={stake}
            tier={tier}
            size="lg"
            classNames={{ value: value === stake ? 'text-gold' : 'text-white' }}
          />
        </button>
      ))}
    </div>
  );
}
