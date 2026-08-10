'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { Check, Play, Lock } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { AdSlot } from '@/types/interfaces/tasks.interfaces';
import { AdRewardRow } from './AdRewardRow';

/**
 * Narrowest the lens may get, in px. Nothing forces it — a view paying one
 * small reward would otherwise shrink to the width of its own header — but a
 * bubble that changes size on every tick reads as jitter, and a single chip
 * needs room to look like a chip.
 */
const MIN_W = 176;

export interface AdRailLensProps {
  slot: AdSlot;
  /** Distance from the view that is up next: negative = spent, 0 = playable. */
  offset: number;
  /** This view pays something an ordinary one never does (a star, a ticket). */
  rich?: boolean;
  /** Horizontal centre of the scrubbed tick inside the rail, in px. */
  center: number;
  /** Track width in px. The lens never grows past it nor hangs off either end. */
  trackW: number;
  className?: string;
}

/**
 * The magnifier that rides the finger while the ad rail is being scrubbed. The
 * rail gives one tick per view — eight pixels wide on a forty-view day, far too
 * small to carry a reward — so the view under the finger is repeated here at
 * full size before the finger is lifted.
 *
 * Pointer-events are off: it must never eat the drag it is describing, and it
 * floats over the watch button on purpose — nothing in the card's layout moves
 * while the gesture is running.
 *
 * Its width is **measured, not declared**. The header is two translated
 * strings, and the pair that fits a fixed 176px in English ("View #20 · in 19
 * views") is half again as wide in Russian ("Просмотр №20 · через 19
 * показов"): at 176 the status ran clean outside the rounded border, and at
 * 216 the title broke onto a second line mid-word. So the box takes its content
 * width, capped at the rail, and the position is clamped against what it
 * actually measured — in `useLayoutEffect`, so the corrected place is the first
 * one painted.
 */
export function AdRailLens({
  slot,
  offset,
  rich = false,
  center,
  trackW,
  className,
}: AdRailLensProps) {
  const t = useAppTranslations();
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const measured = ref.current?.getBoundingClientRect().width ?? 0;
    setWidth(current => (Math.abs(current - measured) > 0.5 ? measured : current));
  });

  // Unmeasured (the very first pass) or wider than the rail it sits on: both
  // can only be centred. Otherwise keep the bubble over the finger, stopping a
  // half-width short of each end so neither edge leaves the card.
  const half = width / 2;
  const left =
    !width || width >= trackW ? trackW / 2 : Math.min(Math.max(center, half), trackW - half);

  const StatusIcon = slot.watched ? Check : offset === 0 ? Play : Lock;

  const status = slot.watched
    ? t('watched')
    : offset === 0
      ? t('ad up next')
      : t('in {n} views', { n: offset });

  return (
    <div
      ref={ref}
      style={{ left, minWidth: Math.min(MIN_W, trackW), maxWidth: trackW }}
      className={twMerge(
        'pointer-events-none absolute bottom-full z-40 mb-2 w-max -translate-x-1/2 rounded-2xl border p-2.5 shadow-2xl shadow-black/60 backdrop-blur-sm',
        rich
          ? 'border-gold/50 bg-[#241F42]/95'
          : offset === 0
            ? 'border-electric-pink/40 bg-background-overlay/95'
            : 'bg-background-overlay/95 border-white/12',
        className
      )}
    >
      <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-white/55">
        <StatusIcon
          size={11}
          strokeWidth={2.4}
          className={twMerge(
            'shrink-0',
            rich ? 'text-gold' : offset === 0 ? 'text-electric-pink' : 'text-white/45'
          )}
        />
        <span className="min-w-0 truncate text-[13px] font-extrabold tracking-normal tabular-nums text-white">
          {t('ad view number', { num: slot.index + 1 })}
        </span>
        {/* Never wraps: this row is what the box is sized to, so a break here
            would trade the width the measurement asked for against a second
            line nobody asked for. `truncate` above is the last resort on a rail
            too narrow for both strings — an ellipsis inside the border, never a
            spill outside it. */}
        <span className="ml-auto shrink-0 whitespace-nowrap tabular-nums">{status}</span>
      </div>

      <AdRewardRow rewards={slot.rewards} muted={slot.watched} className="mt-1.5" />
    </div>
  );
}
