'use client';

import { ChevronDown, Crown } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { getTestQuestZone } from '@/constants/testQuest.constants';

export interface TestQuestPyramidProps {
  /** Current daily level (31 → 1). Levels above it read as taken/built. */
  currentLevel: number;
  /** Level whose checklist is shown below — highlighted on the pyramid. */
  selectedLevel: number;
  /** Tap a level to drive the "what to do" panel below to that level. */
  onSelect: (level: number) => void;
  className?: string;
}

// Pyramid rows, apex (level 1 = the crown) → base (31 = the start). Fixed for the
// 31-level design; numbers grow downward so the goal (1) sits at the peak.
const ROWS: readonly (readonly number[])[] = [
  [1],
  [2, 3],
  [4, 5, 6],
  [7, 8, 9, 10],
  [11, 12, 13, 14, 15, 16],
  [17, 18, 19, 20, 21, 22, 23],
  [24, 25, 26, 27, 28, 29, 30, 31],
];

const nodeClasses = (level: number, currentLevel: number): string => {
  const zone = getTestQuestZone(level);
  const isApex = level === 1;
  const isCrown = zone === 'crown';
  const isWall = zone === 'wall';
  const taken = level > currentLevel;
  const current = level === currentLevel;

  return twMerge(
    'relative flex-center rounded-lg text-[11px] font-extrabold tabular-nums transition-all active:scale-95',
    isApex ? 'h-9 w-12 text-[15px]' : 'h-7 w-9',
    // ladder
    !isCrown &&
      !isWall &&
      (taken
        ? 'bg-gradient-to-b from-electric-pink to-electric-purple text-white/90 shadow-md shadow-electric-purple/30'
        : 'bg-white/[0.08] text-white/40'),
    // status walls — gold
    isWall &&
      (taken
        ? 'bg-gradient-to-b from-gold to-orange text-black/70'
        : 'text-gold/70 ring-1 ring-inset ring-gold/40 bg-gold/[0.14]'),
    // crown (1·2·3) always gold
    isCrown && 'bg-gradient-to-b from-gold to-orange text-black/70',
    // apex (1) glows as the summit goal
    isApex && 'shadow-[0_0_22px] shadow-gold/60',
    // current — pulsing marker
    current &&
      'animation-blink z-10 bg-gradient-to-b from-electric-pink to-electric-purple text-white shadow-[0_0_16px] shadow-electric-purple/70'
  );
};

/**
 * The 31 → 1 climb as a stepped pyramid — apex (1 = the crown) at the summit,
 * numbers growing down to the base (31 = start). Built rungs fill pink→purple,
 * status walls and the crown are gold, the current rung pulses under a marker.
 * It's a **selector**: tapping a level drives the "what to do" checklist below to
 * that level; the selected level gets a gold ring.
 */
export function TestQuestPyramid({
  currentLevel,
  selectedLevel,
  onSelect,
  className,
}: TestQuestPyramidProps) {
  const t = useAppTranslations();

  return (
    <div
      className={twMerge('rounded-2xl border border-white/10 bg-background-overlay p-2', className)}
    >
      <div className="flex flex-col items-center gap-1.5 pt-3">
        {ROWS.map((row, ri) => (
          <div key={ri} className="flex justify-center gap-1">
            {row.map(level => (
              <button
                key={level}
                type="button"
                onClick={() => onSelect(level)}
                aria-label={`${t('level')} ${level}`}
                className={twMerge(
                  nodeClasses(level, currentLevel),
                  selectedLevel === level &&
                    'ring-2 ring-gold ring-offset-2 ring-offset-background-overlay'
                )}
              >
                {level === 1 && (
                  <Crown
                    size={16}
                    className="absolute -top-[18px] left-1/2 -translate-x-1/2 text-gold drop-shadow"
                  />
                )}
                {level === currentLevel && (
                  <ChevronDown
                    size={14}
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-white drop-shadow"
                  />
                )}
                {level}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
