'use client';

import { Check } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export interface DuelReadyMarkProps {
  ready: boolean;
  /** Подпись под знаком: «подтвердил» / «ждём вас». */
  caption: string;
  size?: number;
  /**
   * Сторона соперника: подпись встаёт НАД знаком.
   *
   * Стол зеркален — сверху «имя · подпись · знак», снизу «знак · подпись ·
   * имя», и знаки обоих оказываются одинаково близко к табличке между ними.
   */
  captionFirst?: boolean;
  className?: string;
}

/**
 * Знак готовности на месте рубашки жетона.
 *
 * На фазе готовности рубашка «?» не значит ничего: ходов ещё не сделано, — а
 * само подтверждение стояло мелкой пилюлей под именем. Теперь это самое
 * крупное на экране: подтвердивший — зелёный круг с галочкой, ожидаемый —
 * пустой пунктирный, дышащий кольцами. Промахнуться мимо своего состояния
 * невозможно.
 */
export function DuelReadyMark({
  ready,
  caption,
  size = 132,
  captionFirst = false,
  className,
}: DuelReadyMarkProps) {
  return (
    // Подпись стоит в потоке, а не absolute: прижатая к кругу отрицательным
    // отступом, она налезала на имя игрока под собой.
    <span
      className={twMerge(
        'flex flex-col items-center gap-2.5',
        captionFirst && 'flex-col-reverse',
        className
      )}
    >
      <span
        style={{ width: size, height: size }}
        className={twMerge(
          'flex-center relative rounded-full',
          ready
            ? 'border-success-text/85 bg-success/25 text-success-text border-2 shadow-[0_0_44px_rgba(52,211,153,0.32)]'
            : 'duel-pulse border-electric-purple/50 border-2 border-dashed text-white/45'
        )}
      >
        {ready ? (
          <Check size={size * 0.42} strokeWidth={3} />
        ) : (
          <span className="text-[34px] leading-none tracking-[0.12em]">···</span>
        )}
      </span>

      <span
        className={twMerge(
          'text-[11px] font-black tracking-[0.16em] whitespace-nowrap uppercase',
          ready ? 'text-success-text' : 'text-pink-secondary'
        )}
      >
        {caption}
      </span>
    </span>
  );
}
