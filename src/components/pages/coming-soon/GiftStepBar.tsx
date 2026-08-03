'use client';

import { twMerge } from 'tailwind-merge';

export interface GiftStepBarProps {
  /** Filled once the friend on its right has actually arrived. */
  filled: boolean;
}

/** The rail between two beads of the gift ladder. @see ComingSoonGiftSteps */
export function GiftStepBar({ filled }: GiftStepBarProps) {
  return (
    <span className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/10">
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
