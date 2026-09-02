'use client';

import { CoinIcon } from '@/components/shared/icons/CoinIcon';
import { formatCompact } from '@/utils/global/number.utils';

export interface TikkiTapPopProps {
  /** Координаты внутри карточки, в процентах — чтобы цифра вылетала из-под пальца. */
  x: number;
  y: number;
  amount: number;
}

/**
 * Цифра, вылетающая вверх по тапу. Живёт до конца анимации и удаляется родителем.
 *
 * Впереди числа стоит монета, а не слово «LC»: на экране Тикки валюта нигде не
 * пишется буквами, и три знака под пальцем читались бы дольше, чем живёт сама
 * цифра.
 */
export function TikkiTapPop({ x, y, amount }: TikkiTapPopProps) {
  return (
    <span
      aria-hidden
      className="animate-tikki-pop pointer-events-none absolute z-10 flex -translate-x-1/2 items-center gap-0.5 text-[13px] font-extrabold tabular-nums text-white drop-shadow-[0_2px_6px_rgba(0,0,0,.55)]"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      +<CoinIcon size={12} />
      {formatCompact(amount)}
    </span>
  );
}
