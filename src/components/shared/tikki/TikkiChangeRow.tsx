'use client';

import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';

export interface TikkiChangeRowProps {
  label: string;
  from: ReactNode;
  /** Опущено — строка просто показывает величину, а не её изменение. */
  to?: ReactNode;
}

/**
 * Строка «было → станет» в окне покупки.
 *
 * Одна цена без второго числа ничего не говорит: 8 760 LC — это дорого или
 * дёшево, зависит от того, что они двигают. Поэтому у каждой покупки на экране
 * стоят обе величины, а не только та, что получится.
 */
export function TikkiChangeRow({ label, from, to }: TikkiChangeRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/8 py-2 last:border-0">
      <span className="text-muted text-xs">{label}</span>
      <span className="flex items-center gap-1.5 text-sm font-bold tabular-nums">
        <span className={to === undefined ? 'text-white' : 'text-white/45'}>{from}</span>
        {to !== undefined && (
          <>
            <ArrowRight size={13} className="text-white/35" aria-hidden />
            <span className="text-white">{to}</span>
          </>
        )}
      </span>
    </div>
  );
}
