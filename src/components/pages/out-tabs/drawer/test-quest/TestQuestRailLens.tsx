'use client';

import { Crown, Gift } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { TestQuestRewardChips } from './TestQuestRewardChips';
import type { TestQuestScreenCard } from './useTestQuestScreen';

export interface TestQuestRailLensProps {
  card: TestQuestScreenCard;
  /** Distance from today in days: negative = already banked, positive = ahead. */
  offsetDays: number;
  /** Vertical centre of the scrubbed day inside the rail box, in px. */
  top: number;
  className?: string;
}

/**
 * The magnifier that rides the finger while the rail is being scrubbed. The rail
 * itself is 12px per day — far too small to read — so the day under the finger is
 * repeated here at full size, with its reward, before the finger is lifted.
 * Pointer-events are off: it must never eat the drag it is describing.
 */
export function TestQuestRailLens({ card, offsetDays, top, className }: TestQuestRailLensProps) {
  const t = useAppTranslations();

  return (
    <div
      style={{ top }}
      className={twMerge(
        'pointer-events-none absolute left-full z-40 ml-2 w-[176px] -translate-y-1/2 rounded-2xl border p-2.5 shadow-2xl shadow-black/60 backdrop-blur-sm',
        card.crown || card.wall
          ? 'border-gold/50 bg-[#241F42]/95'
          : 'border-electric-pink/40 bg-background-overlay/95',
        className
      )}
    >
      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-white/55">
        {card.crown ? (
          <Crown size={11} className="text-gold" />
        ) : (
          <Gift size={10} className={card.wall ? 'text-gold' : 'text-electric-pink'} />
        )}
        <span className="text-[13px] font-extrabold capitalize tracking-normal tabular-nums text-white">
          {t('day')} {card.day}
        </span>
        <span className="ml-auto tabular-nums">
          {offsetDays === 0
            ? t('today')
            : offsetDays > 0
              ? t('in {n} days', { n: offsetDays })
              : t('claimed')}
        </span>
      </div>
      <TestQuestRewardChips label={card.drop} crown={card.crown} className="mt-1.5" />
    </div>
  );
}
