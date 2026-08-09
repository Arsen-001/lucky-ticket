'use client';

import { Check, Play, Lock } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { AdSlot } from '@/types/interfaces/tasks.interfaces';
import { AdRewardRow } from './AdRewardRow';

/**
 * Lens width in px. Three rewards do not fit the default: at 176 the activity
 * points render as "+." and a ticket's count as a bare colon — both amounts
 * truncated to a single glyph, which is worse than no lens at all.
 */
export const adLensWidth = (slot: AdSlot): number => (slot.rewards.length >= 3 ? 216 : 176);

export interface AdRailLensProps {
  slot: AdSlot;
  /** Distance from the view that is up next: negative = spent, 0 = playable. */
  offset: number;
  /** This view pays something an ordinary one never does (a star, a ticket). */
  rich?: boolean;
  /** Horizontal centre of the scrubbed tick inside the rail, in px. */
  left: number;
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
 */
export function AdRailLens({ slot, offset, rich = false, left, className }: AdRailLensProps) {
  const t = useAppTranslations();

  const StatusIcon = slot.watched ? Check : offset === 0 ? Play : Lock;

  const status = slot.watched
    ? t('watched')
    : offset === 0
      ? t('ad up next')
      : t('in {n} views', { n: offset });

  return (
    <div
      style={{ left, width: adLensWidth(slot) }}
      className={twMerge(
        'pointer-events-none absolute bottom-full z-40 mb-2 -translate-x-1/2 rounded-2xl border p-2.5 shadow-2xl shadow-black/60 backdrop-blur-sm',
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
        <span className="text-[13px] font-extrabold tracking-normal tabular-nums text-white">
          {t('ad view number', { num: slot.index + 1 })}
        </span>
        <span className="ml-auto shrink-0 tabular-nums">{status}</span>
      </div>

      <AdRewardRow rewards={slot.rewards} muted={slot.watched} className="mt-1.5" />
    </div>
  );
}
