'use client';

import { twMerge } from 'tailwind-merge';
import { tierAccentColors } from '@/constants/tier-colors';
import type { TikkiTier } from './tikki.constants';

export interface TikkiGoalSlotsProps {
  count: number;
  size: number;
  tier: TikkiTier;
  className?: string;
}

/**
 * Четыре квадратика «сколько собрано»: залитые — цветом тира, пустые —
 * пунктиром. Та же запись, что призрачные места в ленте, только мелко.
 */
export function TikkiGoalSlots({ count, size, tier, className }: TikkiGoalSlotsProps) {
  const accent = tierAccentColors[tier];

  return (
    <span aria-hidden className={twMerge('inline-flex gap-[3px]', className)}>
      {Array.from({ length: size }, (_, index) => (
        <i
          key={index}
          className={twMerge(
            'size-[9px] rounded-[3px]',
            index >= count && 'border-[1.5px] border-dashed border-white/28'
          )}
          style={index < count ? { backgroundColor: accent } : undefined}
        />
      ))}
    </span>
  );
}
