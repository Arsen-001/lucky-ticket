'use client';

import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { TikkiGoal } from './tikki.goal';

export interface TikkiGoalNoteProps {
  goal: TikkiGoal;
  className?: string;
}

/**
 * Подпись под лентой — «1 из 4 до сплава». Стоит там, куда главная ставит
 * свои пилюли: на `/tikki` под лентой оставалось 48 px обрыва, и одна строка
 * объясняет призраки прямо под ними.
 */
export function TikkiGoalNote({ goal, className }: TikkiGoalNoteProps) {
  const t = useAppTranslations();

  return (
    <p
      className={twMerge(
        'text-center text-[9.5px] font-semibold tracking-[0.02em] text-[#7d7391] tabular-nums',
        className
      )}
    >
      {goal.ready
        ? t('merge is open')
        : t('{count} of {size} to merge', {
            count: Math.min(goal.count, goal.size),
            size: goal.size,
          })}
    </p>
  );
}
