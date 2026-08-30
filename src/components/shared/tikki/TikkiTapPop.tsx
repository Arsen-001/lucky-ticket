'use client';

import { GlobalConstants } from '@/constants/global.constants';
import { formatCompact } from '@/utils/global/number.utils';

export interface TikkiTapPopProps {
  /** Координаты внутри карточки, в процентах — чтобы цифра вылетала из-под пальца. */
  x: number;
  y: number;
  amount: number;
}

/** Цифра, вылетающая вверх по тапу. Живёт до конца анимации и удаляется родителем. */
export function TikkiTapPop({ x, y, amount }: TikkiTapPopProps) {
  return (
    <span
      aria-hidden
      className="animate-tikki-pop pointer-events-none absolute z-10 -translate-x-1/2 text-[13px] font-extrabold tabular-nums text-white drop-shadow-[0_2px_6px_rgba(0,0,0,.55)]"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      +{formatCompact(amount)} {GlobalConstants.coinName}
    </span>
  );
}
