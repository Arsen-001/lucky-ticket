'use client';

import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { Crown } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { triggerHaptic } from '@/utils/global/haptic.utils';
import { parseRewardChips } from '@/utils/pages/testQuest.utils';
import type { TestQuestScreenCard } from './useTestQuestScreen';
import { TestQuestRailLens } from './TestQuestRailLens';

export interface TestQuestRewardRailProps {
  cards: readonly TestQuestScreenCard[];
  currentLevel: number;
  selectedLevel: number;
  onSelect: (level: number) => void;
  /** How many upcoming walls get their LC amount printed on the rail. */
  labelledWalls?: number;
  className?: string;
}

/** One day of the rail, in px. Fixed on purpose: the drag maps a Y coordinate
 *  straight onto a day, so the grid has to stay uniform even where a row draws a
 *  taller thing (today's bubble, a reward pill) — those are absolutely centred. */
const ROW = 12;
/** How many neighbours bulge around the finger, and by how much at the centre. */
const FISHEYE_REACH = 4;
const FISHEYE_MAX = 1.9;

/** "30k LC" → "30k": the rail has room for the magnitude, not the unit. */
const lcAmount = (drop: string): string | null =>
  parseRewardChips(drop)
    .find(c => c.kind === 'lc')
    ?.text.replace(/\s*LC\s*/i, '') ?? null;

/**
 * The vertical gauge — and the way to reach any day of the test.
 *
 * Two things beyond a progress bar:
 * - the nearest reward walls carry their LC amount, so "what is coming" needs no
 *   interaction at all;
 * - it **scrubs**. Press and drag along it: the rail magnifies around the finger,
 *   a lens shows that day and its reward at full size, and the day under the
 *   finger when it lifts becomes the selected one. The track sets
 *   `touch-action: none`, so dragging it never scrolls the page underneath
 *   (Telegram's own swipe-to-collapse is already off — `disableVerticalSwipes()`
 *   runs at boot in `TelegramProvider`).
 *
 * A plain tap is a zero-length drag, so it still selects a day, and the rail is
 * one `slider` for keyboards and screen readers.
 */
export function TestQuestRewardRail({
  cards,
  currentLevel,
  selectedLevel,
  onSelect,
  labelledWalls = 3,
  className,
}: TestQuestRewardRailProps) {
  const t = useAppTranslations();
  const trackRef = useRef<HTMLDivElement>(null);
  // Day (1…31) under the finger while scrubbing; null when idle.
  const [scrubDay, setScrubDay] = useState<number | null>(null);

  const currentDay = cards.find(c => c.level === currentLevel)?.day ?? 1;
  const selectedDay = cards.find(c => c.level === selectedLevel)?.day ?? currentDay;
  const activeDay = scrubDay ?? selectedDay;

  // Only the nearest walls get a label — ten of them would collide at this height.
  const labelled = new Set(
    cards
      .filter(c => c.level < currentLevel && (c.wall || c.crown))
      .slice(0, labelledWalls)
      .map(c => c.level)
  );

  /** Viewport Y → day (1…31), clamped to the track. */
  const dayAt = (clientY: number): number => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return currentDay;
    const index = Math.floor(((clientY - rect.top) / rect.height) * cards.length);
    return Math.min(cards.length, Math.max(1, index + 1));
  };

  const commit = (day: number) => {
    const card = cards[day - 1];
    if (card) onSelect(card.level);
  };

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    // Claims the pointer so the drag keeps reporting even when the finger wanders
    // off the 44px-wide rail — without it the gesture dies at the first sideways px.
    trackRef.current?.setPointerCapture(e.pointerId);
    setScrubDay(dayAt(e.clientY));
    triggerHaptic('light');
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (scrubDay == null) return;
    const day = dayAt(e.clientY);
    if (day === scrubDay) return;
    setScrubDay(day);
    triggerHaptic('light'); // one tick per day crossed — the rail feels notched
  };

  const handlePointerUp = () => {
    if (scrubDay == null) return;
    commit(scrubDay);
    setScrubDay(null);
    triggerHaptic('medium');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.key === 'ArrowUp' ? -1 : e.key === 'ArrowDown' ? 1 : 0;
    if (!step && e.key !== 'Home' && e.key !== 'End') return;
    e.preventDefault();
    const target = e.key === 'Home' ? 1 : e.key === 'End' ? cards.length : selectedDay + step;
    commit(Math.min(cards.length, Math.max(1, target)));
  };

  const scrubbing = scrubDay != null;
  const scrubCard = scrubbing ? cards[scrubDay - 1] : undefined;

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label={t('day')}
      aria-valuemin={1}
      aria-valuemax={cards.length}
      aria-valuenow={activeDay}
      aria-valuetext={`${t('day')} ${activeDay}`}
      onKeyDown={handleKeyDown}
      className={twMerge(
        'relative w-10 shrink-0 rounded-2xl border bg-background-overlay py-2.5 transition-colors',
        scrubbing ? 'border-gold/40' : 'border-white/10',
        className
      )}
    >
      <div
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        // touch-action: none — the drag belongs to the rail, not to the page's
        // scroller underneath it.
        className="flex touch-none select-none flex-col items-center"
      >
        {cards.map(card => {
          const isToday = card.level === currentLevel;
          const isSelected = card.level === selectedLevel;
          const amount = labelled.has(card.level) ? lcAmount(card.drop) : null;
          // Fish-eye: the rail swells around the finger so the day being picked
          // stays visible past it — transform only, nothing in layout moves.
          const distance = scrubbing ? Math.abs(card.day - scrubDay) : Infinity;
          const bulge =
            distance <= FISHEYE_REACH ? 1 + (FISHEYE_MAX - 1) * (1 - distance / FISHEYE_REACH) : 1;
          const isScrubbed = scrubbing && card.day === scrubDay;

          return (
            <div
              key={card.level}
              className="relative flex w-full items-center justify-center"
              style={{ height: ROW }}
            >
              {isScrubbed ? (
                <span className="flex-center absolute z-10 h-[22px] w-9 rounded-full bg-gradient-to-b from-gold to-orange text-[11px] font-extrabold tabular-nums text-black/75 shadow-[0_0_16px] shadow-gold/70">
                  {card.day}
                </span>
              ) : isToday ? (
                <span className="flex-center animation-blink absolute h-[22px] w-8 rounded-full bg-gradient-to-b from-electric-pink to-electric-purple text-[11px] font-extrabold tabular-nums text-white shadow-[0_0_14px] shadow-electric-purple/70">
                  {card.day}
                </span>
              ) : amount ? (
                <span className="flex-center absolute h-3.5 w-9 rounded-full bg-gold/20 text-[9.5px] font-extrabold leading-none tabular-nums text-gold ring-1 ring-inset ring-gold/50">
                  {amount}
                </span>
              ) : (
                <span
                  style={{ transform: bulge > 1 ? `scale(${bulge.toFixed(2)})` : undefined }}
                  className={twMerge(
                    'h-2 rounded-full transition-transform',
                    card.crown ? 'w-7' : card.wall ? 'w-6' : 'w-5',
                    card.taken
                      ? 'bg-gradient-to-r from-electric-pink to-electric-purple'
                      : card.crown
                        ? 'bg-gradient-to-r from-gold to-orange'
                        : card.wall
                          ? 'bg-gold/40'
                          : 'bg-white/12',
                    isSelected && !scrubbing && 'w-8 ring-1 ring-gold'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      <Crown size={12} className="mx-auto mt-1 text-gold" />

      {scrubCard && (
        <TestQuestRailLens
          card={scrubCard}
          offsetDays={scrubCard.day - currentDay}
          // Row centre inside the rail box: the py-2.5 padding plus half a row.
          top={10 + (scrubCard.day - 0.5) * ROW}
        />
      )}
    </div>
  );
}
