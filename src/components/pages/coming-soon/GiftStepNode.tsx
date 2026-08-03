'use client';

import { twMerge } from 'tailwind-merge';
import type { ReactNode } from 'react';

export type GiftStepState = 'done' | 'active' | 'idle';

export interface GiftStepNodeProps {
  state: GiftStepState;
  icon: ReactNode;
  /** The gift at the end of the ladder — drawn a size larger than a friend. */
  emphasized?: boolean;
  className?: string;
}

/**
 * One bead on the pre-launch gift ladder. @see ComingSoonGiftSteps
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
        'flex-center flex-shrink-0 rounded-full border transition-colors duration-300',
        emphasized ? 'h-9 w-9' : 'h-8 w-8',
        stateClasses[state],
        className
      )}
    >
      {icon}
    </span>
  );
}
