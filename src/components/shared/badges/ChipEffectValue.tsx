'use client';

import { twMerge } from 'tailwind-merge';
import {
  SuperBoostBadge,
  type SuperBoostBadgeSize,
} from '@/components/shared/badges/SuperBoostBadge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { InventoryChip } from '@/types/interfaces/inventory.interfaces';
import { chipCapacityTickets, chipSpeedFactor } from '@/utils/global/inventory.utils';

export interface ChipEffectValueProps {
  chip: Pick<InventoryChip, 'type' | 'level'>;
  size?: SuperBoostBadgeSize;
  className?: string;
}

/**
 * What a chip does, in the form its class deserves: a Time chip is a super boost
 * and wears the gold `×N` pill, a Capacity chip adds whole tickets and reads as
 * plain text. The rendered twin of `chipEffectLabel`, which stays the string
 * form for the places that need one inside a sentence (confirm copy).
 */
export function ChipEffectValue({ chip, size = 'xs', className }: ChipEffectValueProps) {
  const t = useAppTranslations();

  if (chip.type === 'speed')
    return (
      <SuperBoostBadge multiplier={chipSpeedFactor(chip.level)} size={size} className={className} />
    );

  return (
    <span className={twMerge('whitespace-nowrap tabular-nums', className)}>
      {t('chip capacity effect', { n: chipCapacityTickets(chip.level) })}
    </span>
  );
}
