'use client';

import { twMerge } from 'tailwind-merge';
import { Check } from 'lucide-react';
import type { DailyGiftStep } from '@/types/interfaces/status-gift.interfaces';

export interface DailyGiftPathProps {
  steps: DailyGiftStep[];
  /** Ступень, которая на столе сегодня, с единицы. */
  day: number;
  className?: string;
}

/**
 * Серия семью точками: пройденное, сегодняшнее и то, что впереди.
 *
 * Показывает ровно одно — где игрок стоит. Числа ступеней здесь намеренно нет:
 * лестница нужна, чтобы захотелось вернуться завтра, а таблица наград на
 * четыре дня вперёд превращает подарок в расписание.
 *
 * Последняя точка крупнее и золотая: это вершина, и она обязана быть видна с
 * первого дня — иначе непонятно, ради чего цепочка.
 */
export function DailyGiftPath({ steps, day, className }: DailyGiftPathProps) {
  return (
    <span className={twMerge('flex items-center justify-center gap-1.5', className)}>
      {steps.map(step => {
        const done = step.day < day;
        const now = step.day === day;
        const top = step.day === steps.length;

        return (
          <span
            key={step.day}
            className={twMerge(
              'flex-center rounded-full border text-[10px] font-extrabold tabular-nums transition-transform',
              top ? 'size-7' : 'size-6',
              done && 'border-success-text/40 bg-success/15 text-success-text',
              now && 'border-gold bg-gold scale-[1.15] text-[#2a1c05]',
              !done && !now && 'border-white/12 text-muted',
              !done && !now && top && 'border-gold/45 text-gold'
            )}
          >
            {done ? <Check size={12} strokeWidth={3} /> : step.day}
          </span>
        );
      })}
    </span>
  );
}
