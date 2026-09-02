'use client';

import { twMerge } from 'tailwind-merge';
import '@/styles/components/tikki.css';

export interface TikkiFillBarProps {
  /** Сколько уже лежит в кликере. */
  fill: number;
  /** Сколько в него влезает: доход в час × окно. */
  capacity: number;
  className?: string;
}

/**
 * Полоса кликера: сколько накопилось из того, что помещается. 16 px ростом,
 * как в макете.
 *
 * Внутри неё ходит плазма, а не ровная заливка цветом тира: полоса — вторая по
 * заметности вещь на экране после самого Тикки, и живое движение говорит «тут
 * копится» без единого слова. Полная полоса — это остановленный доход, дальше
 * окна Тикки не копит.
 */
export function TikkiFillBar({ fill, capacity, className }: TikkiFillBarProps) {
  const share = capacity > 0 ? Math.min(1, Math.max(0, fill / capacity)) : 0;

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={Math.round(capacity)}
      aria-valuenow={Math.floor(fill)}
      className={twMerge(
        'h-4 overflow-hidden rounded-full bg-white/6',
        'shadow-[inset_0_1px_3px_rgba(0,0,0,0.55),inset_0_0_0_1px_rgba(255,255,255,0.06)]',
        className
      )}
    >
      <div
        className="tikki-plasma transition-[width] duration-200 ease-out"
        style={{ width: `${share * 100}%` }}
      >
        <span aria-hidden className="tikki-plasma-glow" />
      </div>
    </div>
  );
}
