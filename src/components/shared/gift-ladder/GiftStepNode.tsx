'use client';

import { twMerge } from 'tailwind-merge';
import type { ReactNode } from 'react';

export type GiftStepState = 'done' | 'active' | 'idle';

export interface GiftStepNodeProps {
  state: GiftStepState;
  /**
   * Drawn at half the bead's own width, not at a pixel size: the bead itself
   * is fluid, and a 15px icon inside an 18px bead is a blot. @see GiftLadder
   */
  icon: ReactNode;
  /** The gift at the end of the ladder — drawn a size larger than a friend. */
  emphasized?: boolean;
  className?: string;
}

/**
 * One bead on the gift ladder.
 *
 * **Fluid, never a fixed size.** The beads used to be `h-8 w-8` and the ladder
 * fitted because there were seven of them. The threshold is an admin setting
 * now (5 → 7 → 10 so far), and at ten the fixed row measured 356px inside a
 * 332px card: the rails collapsed to nothing and the gift hung off the right
 * edge. So each bead takes an equal share of whatever the row has and stops
 * growing at the old size — no floor, because a floor is what turns "smaller
 * beads" back into "a gift hanging off the card" on a 320px phone.
 * @see GiftLadder
 */
export function GiftStepNode({ state, icon, emphasized = false, className }: GiftStepNodeProps) {
  const stateClasses: Record<GiftStepState, string> = {
    done: 'bg-pink-gradient border-transparent text-white shadow-[0_0_14px_-2px_var(--color-electric-pink)]',
    // The one the player is working on right now — so the ladder reads as
    // "you are here", not just as a score.
    active: 'border-electric-pink/60 bg-electric-pink/12 text-electric-pink',
    idle: 'border-white/12 bg-white/5 text-white/40',
  };

  return (
    <span
      className={twMerge(
        'flex-center aspect-square min-w-0 flex-1 basis-0 rounded-full border transition-colors duration-300',
        emphasized ? 'max-w-9' : 'max-w-8',
        stateClasses[state],
        className
      )}
    >
      {icon}
    </span>
  );
}
