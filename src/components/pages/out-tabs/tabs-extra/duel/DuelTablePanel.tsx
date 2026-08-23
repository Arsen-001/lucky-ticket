'use client';

import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export interface DuelTablePanelProps {
  /** Сыгранные до конца дуэли и победы в них — из профиля игрока. */
  matches: number;
  wins: number;
  className?: string;
}

/**
 * Табличка под списком: чем этот стол кончался у вас.
 *
 * Правила стола отсюда уехали под кнопку «i» в шапке: их читают один раз, а
 * место в списке нужно всегда. Осталось то, что меняется, — свой счёт.
 * Не сыграно ни одной дуэли — таблички нет: «0 · побед 0 (0%)» это не факт,
 * а упрёк.
 */
export function DuelTablePanel({ matches, wins, className }: DuelTablePanelProps) {
  const t = useAppTranslations();

  if (matches < 1) return null;

  // Процент считается здесь: он производный, и два числа вместо трёх не могут
  // разойтись сами с собой.
  const rate = Math.round((wins / matches) * 100);

  return (
    <div
      className={twMerge(
        'duel-rim flex items-center justify-between gap-3 rounded-[14px] px-3 py-2.5 text-[12px]',
        className
      )}
    >
      <span className="text-pink-secondary">{t('duel your matches')}</span>
      <b className="font-extrabold tabular-nums">
        {t('duel matches value', { matches, wins, rate })}
      </b>
    </div>
  );
}
