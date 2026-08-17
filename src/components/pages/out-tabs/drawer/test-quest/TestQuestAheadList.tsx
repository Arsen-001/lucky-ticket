'use client';

import { useState } from 'react';
import { Telescope } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type {
  TestQuestAction,
  TestQuestProgress,
  TestQuestStepDto,
} from '@/types/interfaces/testQuest.interfaces';
import type { TestQuestScreenCard } from './useTestQuestScreen';
import { TestQuestAheadRow } from './TestQuestAheadRow';

export interface TestQuestAheadListProps {
  /** The full ladder, day 1 → 31. */
  cards: readonly TestQuestScreenCard[];
  currentLevel: number;
  currentDay: number;
  progress?: TestQuestProgress;
  baselines?: Partial<Record<TestQuestAction, number>>;
  /** Server-sent checklist for a level — see `useTestQuestScreen().stepsFor`. */
  stepsFor?: (level: number) => TestQuestStepDto[] | undefined;
  className?: string;
}

/** Consecutive days shown right after today before jumping to the next walls. */
const NEXT_DAYS = 3;
/** Reward walls shown beyond that run, so the big drops are never out of sight. */
const NEXT_WALLS = 2;

/**
 * "What's next" — the days after today, each with its reward visible without a
 * tap, and its checklist one tap away. It shows the next few days in a row, then
 * jumps to the nearest reward walls, so both "tomorrow" and "the big one" are on
 * screen while today's claim button stays above.
 */
export function TestQuestAheadList({
  cards,
  currentLevel,
  currentDay,
  progress,
  baselines,
  stepsFor,
  className,
}: TestQuestAheadListProps) {
  const t = useAppTranslations();
  const [openLevel, setOpenLevel] = useState<number | null>(null);

  const upcoming = cards.filter(c => c.level < currentLevel);
  const nextDays = upcoming.slice(0, NEXT_DAYS);
  const walls = upcoming
    .filter(c => (c.wall || c.crown) && !nextDays.includes(c))
    .slice(0, NEXT_WALLS);

  if (!upcoming.length) return null;

  // A gap between the consecutive run and the walls is real — mark it instead of
  // letting the numbers jump silently (day 9 → day 12 reads as if 10–11 vanished).
  const gap = walls.length ? walls[0].day - (nextDays.at(-1)?.day ?? currentDay) - 1 : 0;

  return (
    <div className={twMerge('flex flex-col gap-1.5', className)}>
      <div className="flex items-center gap-1.5 px-1 pt-0.5 text-[11px] font-bold uppercase tracking-wider text-white/60">
        <Telescope size={12} className="text-electric-pink" />
        {t('what is next')}
      </div>

      {nextDays.map(card => (
        <TestQuestAheadRow
          key={card.level}
          card={card}
          inDays={card.day - currentDay}
          open={openLevel === card.level}
          onToggle={level => setOpenLevel(l => (l === level ? null : level))}
          progress={progress}
          baselines={baselines}
          steps={stepsFor?.(card.level)}
        />
      ))}

      {gap > 0 && (
        <div className="flex items-center gap-2 px-2 py-0.5">
          <span className="h-px flex-1 bg-white/[0.07]" />
          <span className="text-[10px] font-semibold tabular-nums text-white/25">+{gap}</span>
          <span className="h-px flex-1 bg-white/[0.07]" />
        </div>
      )}

      {walls.map(card => (
        <TestQuestAheadRow
          key={card.level}
          card={card}
          inDays={card.day - currentDay}
          open={openLevel === card.level}
          onToggle={level => setOpenLevel(l => (l === level ? null : level))}
          progress={progress}
          baselines={baselines}
          steps={stepsFor?.(card.level)}
        />
      ))}
    </div>
  );
}
