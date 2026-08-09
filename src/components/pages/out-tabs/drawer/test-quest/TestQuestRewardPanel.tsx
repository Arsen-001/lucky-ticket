'use client';

import { CornerUpLeft, Gift } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { TestQuestRewardChips } from './TestQuestRewardChips';
import type { TestQuestScreenCard } from './useTestQuestScreen';

export interface TestQuestRewardPanelProps {
  card: TestQuestScreenCard;
  /** The shown level is today's ⇒ hide the "back to today" chip. */
  isToday: boolean;
  onBackToToday: () => void;
  className?: string;
}

/**
 * "What drops on this day" — the reward chips with a day/level caption, shared by
 * every design prototype so the variants differ in their *map*, not in how a
 * reward reads. When the player is browsing another day, a chip returns to today.
 */
export function TestQuestRewardPanel({
  card,
  isToday,
  onBackToToday,
  className,
}: TestQuestRewardPanelProps) {
  const t = useAppTranslations();

  return (
    <div
      className={twMerge(
        'flex flex-col gap-1.5 rounded-2xl border border-white/10 bg-background-overlay p-2.5',
        className
      )}
    >
      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-white/55">
        <Gift size={12} className={card.crown ? 'text-gold' : 'text-electric-pink'} />
        {t('reward')} ·
        <span className="text-[14px] font-extrabold capitalize tracking-normal tabular-nums text-white">
          {t('day')} {card.day}
        </span>
        {!isToday && (
          <button
            type="button"
            onClick={onBackToToday}
            className="flex-center ml-auto gap-1 rounded-full bg-electric-pink/20 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-electric-pink active:scale-95"
          >
            <CornerUpLeft size={10} />
            {t('today')}
          </button>
        )}
      </div>
      <TestQuestRewardChips label={card.drop} crown={card.crown} />
    </div>
  );
}
