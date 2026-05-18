'use client';
import type { CSSProperties } from 'react';
import Image from 'next/image';
import { twMerge } from 'tailwind-merge';
import { CHIP_SHARD_ASSET } from '@/utils/global/inventory.utils';
import type { InventoryChipType } from '@/types/interfaces/inventory.interfaces';
import type { TicketType } from '@/types/types/ticket.types';

export interface ChipShardIconProps {
  type: InventoryChipType;
  tier?: TicketType;
  size?: number;
  empty?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function ChipShardIcon({
  type,
  tier = 'gold',
  size = 24,
  empty = false,
  className,
  style,
}: ChipShardIconProps) {
  const src = CHIP_SHARD_ASSET[tier][type];

  return (
    <span
      className={twMerge('relative inline-flex shrink-0', className)}
      style={{ width: size, height: size, opacity: empty ? 0.32 : 1, ...style }}
      aria-hidden
    >
      <Image
        src={src}
        alt=""
        width={size}
        height={size}
        sizes={`${size}px`}
        className="h-full w-full object-contain"
      />
    </span>
  );
}
