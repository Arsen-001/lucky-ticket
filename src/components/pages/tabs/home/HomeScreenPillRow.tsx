import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export interface HomeScreenPillRowProps {
  children: ReactNode;
  className?: string;
}

/**
 * Нижний ряд главной — один и тот же на обоих её экранах. Слева всегда
 * «Игры», справа — пилюля соседнего экрана («Движки» у Тикки, «Тикки» у
 * движков). Экраны меняются, ряд стоит на месте, и палец не ищет его заново.
 *
 * Ряд не знает, где он стоит: у Тикки он в потоке под лентой коллекции, у
 * движков — липнет к низу прокрутки (см. `HomeEnginesScreen`). Общее у них
 * только это — раскладка двух пилюль по краям.
 */
export function HomeScreenPillRow({ children, className }: HomeScreenPillRowProps) {
  return (
    <div
      data-testid="home-pill-row"
      className={twMerge('flex items-center justify-between gap-2', className)}
    >
      {children}
    </div>
  );
}
