'use client';

import { ChevronDown, Lock } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type {
  TestQuestAction,
  TestQuestProgress,
  TestQuestStepDto,
} from '@/types/interfaces/testQuest.interfaces';
import { TestQuestRewardChips } from './TestQuestRewardChips';
import { TestQuestSteps } from './TestQuestSteps';
import type { TestQuestScreenCard } from './useTestQuestScreen';

export interface TestQuestAheadRowProps {
  card: TestQuestScreenCard;
  /** Days between today and this one — "in N days". */
  inDays: number;
  open: boolean;
  onToggle: (level: number) => void;
  /** Live counters, so a future day's badges read as "35/93" — what is LEFT. */
  progress?: TestQuestProgress;
  baselines?: Partial<Record<TestQuestAction, number>>;
  /** The level's checklist as the server sent it (falls back when absent). */
  steps?: TestQuestStepDto[];
  className?: string;
}

/**
 * One upcoming day in the "what's next" list: its reward is always visible, and
 * one tap unfolds the tasks it will ask for — measured against the player's live
 * counters, so the preview answers "how much is still missing", not "what the
 * target is". Today's card stays above, untouched.
 */
export function TestQuestAheadRow({
  card,
  inDays,
  open,
  onToggle,
  progress,
  baselines,
  steps,
  className,
}: TestQuestAheadRowProps) {
  const t = useAppTranslations();

  return (
    <div
      className={twMerge(
        'rounded-xl border transition-colors',
        card.wall || card.crown
          ? 'border-gold/25 bg-gold/[0.04]'
          : 'border-white/[0.06] bg-white/[0.03]',
        open && 'border-electric-pink/40 bg-electric-pink/[0.05]',
        className
      )}
    >
      <button
        type="button"
        onClick={() => onToggle(card.level)}
        className="flex w-full items-center gap-2.5 px-2.5 py-2 text-start active:scale-[0.99]"
      >
        <span
          className={twMerge(
            'flex-center h-8 w-8 shrink-0 rounded-lg text-[13px] font-extrabold tabular-nums',
            card.crown
              ? 'bg-gradient-to-b from-gold to-orange text-black/70'
              : card.wall
                ? 'bg-gold/15 text-gold'
                : 'bg-white/[0.06] text-white/50'
          )}
        >
          {card.day}
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-white/55">
            <Lock size={10} className="shrink-0" />
            {inDays === 1 ? t('tomorrow') : t('in {n} days', { n: inDays })}
          </span>
          <TestQuestRewardChips label={card.drop} crown={card.crown} className="mt-1" />
        </span>

        <ChevronDown
          size={15}
          className={twMerge('shrink-0 text-white/30 transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="px-1 pb-1">
          <TestQuestSteps
            level={card.level}
            steps={steps}
            title={t('steps for quest level {n}', { n: card.day })}
            progress={progress}
            baselines={baselines}
            className="border-white/[0.07] bg-black/25 p-2"
          />
        </div>
      )}
    </div>
  );
}
