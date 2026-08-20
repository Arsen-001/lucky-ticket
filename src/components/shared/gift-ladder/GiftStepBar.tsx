'use client';

import { twMerge } from 'tailwind-merge';

export interface GiftStepBarProps {
  /** Filled once the friend on its right has actually arrived. */
  filled: boolean;
}

/**
 * The rail between two beads of the gift ladder.
 *
 * Capped short (8px) and allowed to shrink to nothing: on a long ladder the
 * beads are what has to survive, and the rail is the part that gives the pixels
 * back. Uncapped rails ate the row — at ten steps the beads sat on their floor
 * while every rail grew to 14px.
 * @see GiftStepNode
 */
export function GiftStepBar({ filled }: GiftStepBarProps) {
  return (
    <span
      className={twMerge(
        'h-[3px] min-w-0 max-w-2 flex-1 basis-0 overflow-hidden rounded-full bg-white/10'
      )}
    >
      <span
        className={twMerge(
          'block h-full rounded-full transition-all duration-300',
          filled && 'bg-pink-gradient'
        )}
        style={{ width: filled ? '100%' : 0 }}
      />
    </span>
  );
}
