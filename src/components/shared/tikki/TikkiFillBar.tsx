'use client';

import { twMerge } from 'tailwind-merge';

export interface TikkiFillBarProps {
  /** Сколько уже лежит в кликере. */
  fill: number;
  /** Сколько в него влезает: доход в час × окно. */
  capacity: number;
  /** Цвет тира — полоса красится в металл того Тикки, чью она. */
  accent: string;
  className?: string;
}

/**
 * Полоса кликера: сколько накопилось из того, что помещается.
 *
 * Полная полоса — это остановленный доход: дальше окна Тикки не копит, и всё,
 * что он мог бы дать, теряется. Поэтому она красится в цвет тира и светится, а
 * не остаётся серой линией, которую легко не заметить.
 */
export function TikkiFillBar({ fill, capacity, accent, className }: TikkiFillBarProps) {
  const share = capacity > 0 ? Math.min(1, Math.max(0, fill / capacity)) : 0;
  const full = share >= 1;

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={Math.round(capacity)}
      aria-valuenow={Math.floor(fill)}
      className={twMerge(
        'relative h-3.5 overflow-hidden rounded-full border border-white/10 bg-white/6',
        className
      )}
    >
      <div
        className={twMerge('h-full rounded-full transition-[width] duration-700 ease-out')}
        style={{
          width: `${share * 100}%`,
          background: `linear-gradient(90deg, ${accent}55 0%, ${accent} 100%)`,
          boxShadow: full ? `0 0 12px ${accent}99` : undefined,
        }}
      />
    </div>
  );
}
