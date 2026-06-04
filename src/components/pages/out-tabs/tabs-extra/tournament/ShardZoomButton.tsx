'use client';

import { useState, type MouseEvent } from 'react';
import { twMerge } from 'tailwind-merge';
import { ChipShardIcon } from '@/components/shared/icons/ChipShardIcon';
import { ShardZoomModal } from '@/components/pages/out-tabs/tabs-extra/tournament/ShardZoomModal';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { InventoryChipType } from '@/types/interfaces/inventory.interfaces';
import type { TicketType } from '@/types/types/ticket.types';

export interface ShardZoomButtonProps {
  type: InventoryChipType;
  tier: TicketType;
  size?: number;
  className?: string;
}

/**
 * Tappable chip-shard icon that opens an enlarged ("zoom") preview. Drops in
 * wherever a shard reward is shown so the user can tap it to see which shard it
 * is. Stops propagation so it never triggers a surrounding card/podium click.
 */
export function ShardZoomButton({ type, tier, size = 16, className }: ShardZoomButtonProps) {
  const t = useAppTranslations();
  const [open, setOpen] = useState(false);

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setOpen(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        aria-label={t('shard')}
        className={twMerge(
          'focus-outline -m-0.5 inline-flex shrink-0 cursor-pointer items-center justify-center rounded-md p-0.5 transition-transform active:scale-90',
          className
        )}
      >
        <ChipShardIcon type={type} tier={tier} size={size} />
      </button>
      <ShardZoomModal open={open} onClose={() => setOpen(false)} type={type} tier={tier} />
    </>
  );
}
