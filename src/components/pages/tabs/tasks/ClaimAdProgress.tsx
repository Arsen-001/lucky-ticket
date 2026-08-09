'use client';

import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export interface ClaimAdProgressProps {
  /** Views already watched today, this one included. */
  watchedToday: number;
  total: number;
  className?: string;
}

/**
 * The day's ad allowance, shown in the reward modal where a task claim shows
 * its new balance.
 *
 * An ad grant carries no balance snapshot, so that band was blank — a third of
 * the card holding nothing, which read as a screen that had failed to finish
 * loading. This is the fact the player actually wants next: how many views are
 * left before the reset.
 */
export function ClaimAdProgress({ watchedToday, total, className }: ClaimAdProgressProps) {
  const t = useAppTranslations();
  const fraction = total > 0 ? Math.min(1, watchedToday / total) : 0;

  return (
    <div
      className={twMerge('flex w-full flex-col gap-1.5 rounded-2xl bg-white/5 p-2.5', className)}
    >
      <p className="text-center text-[10px] font-bold tracking-wider text-white/40 uppercase">
        {t('ads watched')}
      </p>
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold tabular-nums">
          {watchedToday}
          <span className="text-white/40">/{total}</span>
        </span>
        <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
          <span
            className="bg-pink-gradient block h-full rounded-full transition-[width] duration-500"
            style={{ width: `${fraction * 100}%` }}
          />
        </span>
      </div>
    </div>
  );
}
