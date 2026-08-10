'use client';

import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { Star, Ticket } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { triggerHaptic } from '@/utils/global/haptic.utils';
import { TaskRewardType } from '@/types/enums/tasks.enums';
import type { AdSlot } from '@/types/interfaces/tasks.interfaces';
import { AdRailLens } from './AdRailLens';

/** Currencies an ordinary view never pays — what makes a slot worth marking. */
const RARE_TYPES: TaskRewardType[] = [TaskRewardType.STARS, TaskRewardType.TICKETS];

/**
 * Slots worth pointing at ahead of time: the ones paying stars or a ticket.
 *
 * "Anything above the usual reward" was the first rule and it was wrong on the
 * live ladder — with the admin's ten steps (view 1 pays 1 AP, most pay AP + LC,
 * only 5 and 10 pay a star or a ticket) it marked **seven slots out of ten**.
 * A mark on 70% of the strip is a background, not a mark; that is the same
 * mistake the old carousel made with ten rarity frames over one flat reward.
 *
 * Stars and tickets are the two things a view cannot pay by default, so they
 * are the honest "look here". Empty when nothing rare is on the ladder (the
 * app's out-of-the-box state) and, at the other end, when *every* slot is rare
 * — marking all of them says nothing either.
 */
function findStandoutSlots(slots: AdSlot[]): Set<string> {
  if (slots.length < 2) return new Set();

  const standout = new Set<string>();
  for (const slot of slots) {
    if (slot.rewards.some(reward => RARE_TYPES.includes(reward.type))) standout.add(slot.id);
  }
  return standout.size === slots.length ? new Set() : standout;
}

/** Rail height in px. The scrubbed bubble is the tallest thing in it, and every
 *  bar sits on the same baseline, so no bulge is ever allowed past this. */
const RAIL_H = 24;
/** Base bar heights, in px — needed to cap the fish-eye against `RAIL_H`. */
const BAR_H = 10;
const BAR_H_NEXT = 16;
/** How many neighbours bulge around the finger, and by how much at the centre. */
const FISHEYE_REACH = 4;
const FISHEYE_MAX = 2.2;
/** Past this many views a tick is narrower than a glyph — icons come off. */
const ICON_LIMIT = 16;

export interface AdRewardRailProps {
  slots: AdSlot[];
  /** The slot that can be watched right now; `-1` once the day is spent. */
  activeIndex: number;
  className?: string;
}

/**
 * The day as one tick per view — and the way to read *any* view's reward before
 * reaching it.
 *
 * It started as a passive strip that replaced a carousel of twenty cards
 * (nineteen of them unreachable at any moment and all of them scrollable past).
 * The strip answered "how far into the day am I" and "which views pay more" for
 * free, but the reward itself still needed a tap it had no way to accept.
 *
 * So it **scrubs**, the way the test-quest rail does: press and drag along it,
 * the bars swell around the finger, the view under it is repeated full size in
 * {@link AdRailLens} with its whole reward, and lifting the finger simply ends
 * the preview — the watch button never moves off the view that is actually
 * playable. A plain tap is a zero-length drag, so it previews too. The track
 * sets `touch-action: none`, so dragging it never scrolls the tasks page
 * underneath.
 *
 * The rail is one `slider` for keyboards and screen readers; arrows walk the
 * preview, `Escape` drops it.
 */
export function AdRewardRail({ slots, activeIndex, className }: AdRewardRailProps) {
  const t = useAppTranslations();
  const trackRef = useRef<HTMLDivElement>(null);
  /** Track geometry, frozen for the length of one gesture: the card above the
   *  rail can repaint mid-drag, and re-measuring would move the mapping under
   *  the finger. */
  const rectRef = useRef<DOMRect | null>(null);
  // Index under the finger while scrubbing, with the track width it was read
  // against; null when idle.
  const [scrub, setScrub] = useState<{ index: number; trackW: number } | null>(null);

  const standout = findStandoutSlots(slots);

  /** Viewport X → slot index, clamped to the track. */
  const indexAt = (clientX: number, rect: DOMRect): number => {
    const raw = Math.floor(((clientX - rect.left) / rect.width) * slots.length);
    return Math.min(slots.length - 1, Math.max(0, raw));
  };

  const measure = (): DOMRect | null => trackRef.current?.getBoundingClientRect() ?? null;

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    const rect = measure();
    if (!rect) return;
    rectRef.current = rect;
    // Claims the pointer so the drag keeps reporting even when the finger
    // wanders off the 24px-tall rail — without it the gesture dies at the first
    // vertical px.
    trackRef.current?.setPointerCapture(e.pointerId);
    setScrub({ index: indexAt(e.clientX, rect), trackW: rect.width });
    triggerHaptic('light');
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const rect = rectRef.current;
    if (!scrub || !rect) return;
    const index = indexAt(e.clientX, rect);
    if (index === scrub.index) return;
    setScrub({ index, trackW: rect.width });
    triggerHaptic('light'); // one tick per view crossed — the rail feels notched
  };

  const handlePointerUp = () => {
    if (!scrub) return;
    setScrub(null);
    rectRef.current = null;
    triggerHaptic('medium');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      setScrub(null);
      return;
    }
    const step = e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : 0;
    if (!step && e.key !== 'Home' && e.key !== 'End') return;
    e.preventDefault();
    const rect = measure();
    if (!rect) return;
    const from = scrub?.index ?? (activeIndex >= 0 ? activeIndex : slots.length - 1);
    const target = e.key === 'Home' ? 0 : e.key === 'End' ? slots.length - 1 : from + step;
    setScrub({
      index: Math.min(slots.length - 1, Math.max(0, target)),
      trackW: rect.width,
    });
  };

  if (!slots.length) return null;

  const scrubSlot = scrub ? slots[scrub.index] : undefined;
  const shownIndex = scrub?.index ?? (activeIndex >= 0 ? activeIndex : slots.length - 1);
  const showIcons = slots.length <= ICON_LIMIT;

  // Centre of the scrubbed tick. Keeping it inside the card is the lens's own
  // job — only it knows how wide the day's rewards and the locale's wording
  // made it, and that is a measurement, not a number this file can predict.
  const tickCenter = scrub ? ((scrub.index + 0.5) / slots.length) * scrub.trackW : 0;

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label={t('category ads')}
      aria-valuemin={1}
      aria-valuemax={slots.length}
      aria-valuenow={shownIndex + 1}
      aria-valuetext={t('ad view number', { num: shownIndex + 1 })}
      onKeyDown={handleKeyDown}
      onBlur={() => setScrub(null)}
      className={twMerge(
        'rounded-xl border px-1.5 py-1 transition-colors',
        scrub ? 'border-gold/40 bg-white/[0.06]' : 'border-white/[0.06] bg-white/[0.03]',
        className
      )}
    >
      <div
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ height: RAIL_H }}
        // touch-action: none — the drag belongs to the rail, not to the tasks
        // page's scroller underneath it.
        className="relative flex touch-none items-end gap-[3px] select-none"
      >
        {slots.map((slot, index) => {
          const isNext = index === activeIndex;
          const rich = standout.has(slot.id);
          const isScrubbed = scrub?.index === index;

          // Fish-eye: the rail swells around the finger so the view being read
          // stays visible past it. Vertical only — the bars are already flush
          // against their neighbours — and capped so nothing leaves the rail.
          const distance = scrub ? Math.abs(index - scrub.index) : Infinity;
          const reach =
            distance <= FISHEYE_REACH ? 1 + (FISHEYE_MAX - 1) * (1 - distance / FISHEYE_REACH) : 1;
          const bulge = Math.min(reach, RAIL_H / (isNext ? BAR_H_NEXT : BAR_H));

          const RichIcon = slot.rewards.some(r => r.type === TaskRewardType.STARS) ? Star : Ticket;

          return (
            <span key={slot.id} className="relative flex h-full flex-1 items-end justify-center">
              {/* The bubble is absolute so a two-digit number can overlap its
                  neighbours instead of widening the grid the drag maps onto. */}
              {isScrubbed && (
                <span className="flex-center from-gold to-orange absolute bottom-0 z-10 h-[22px] min-w-[26px] rounded-full bg-gradient-to-b px-1 text-[11px] font-extrabold tabular-nums text-black/75 shadow-[0_0_16px] shadow-gold/70">
                  {index + 1}
                </span>
              )}

              {showIcons && rich && !slot.watched && !isScrubbed && (
                <RichIcon
                  size={9}
                  strokeWidth={2.6}
                  className="text-gold absolute bottom-[13px]"
                  aria-hidden
                />
              )}

              <span
                // Height is inline, not a class: the fish-eye cap above has to
                // know it to keep a swollen bar inside the rail.
                style={{
                  height: isNext ? BAR_H_NEXT : BAR_H,
                  transform: bulge > 1 ? `scaleY(${bulge.toFixed(2)})` : undefined,
                }}
                className={twMerge(
                  'w-full origin-bottom rounded-[3px] bg-white/8 transition-transform',
                  slot.watched && 'from-electric-purple/55 to-gradient-purple bg-gradient-to-b',
                  !slot.watched && slot.paid && 'bg-gold/30',
                  !slot.watched && rich && 'from-gold/85 to-bronze/70 bg-gradient-to-b',
                  isNext && 'bg-pink-gradient shadow-[0_0_8px_rgba(222,0,155,0.5)]',
                  // A live slot that also pays more keeps the pink fill and
                  // takes the gold as an inner edge — otherwise one of the two
                  // facts always loses.
                  isNext &&
                    rich &&
                    'shadow-[0_0_8px_rgba(222,0,155,0.5),inset_0_0_0_1.5px_#f8bd3e]',
                  // Same trick once it is spent: violet fill, gold memory.
                  slot.watched && rich && 'shadow-[inset_0_0_0_1px_rgba(248,189,62,0.55)]',
                  isScrubbed && 'opacity-0'
                )}
              />
            </span>
          );
        })}

        {scrub && scrubSlot && (
          <AdRailLens
            slot={scrubSlot}
            offset={activeIndex >= 0 ? scrubSlot.index - activeIndex : -1}
            rich={standout.has(scrubSlot.id)}
            center={tickCenter}
            trackW={scrub.trackW}
          />
        )}
      </div>
    </div>
  );
}
