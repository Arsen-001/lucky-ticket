'use client';
import type { CSSProperties } from 'react';
import Image from 'next/image';
import { Timer } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { CHIP_ASSET, QUALITY_ACCENT } from '@/utils/global/inventory.utils';
import type { InventoryChipType } from '@/types/interfaces/inventory.interfaces';
import type { TicketType } from '@/types/types/ticket.types';

export interface ChipIconProps {
  type: InventoryChipType;
  tier?: TicketType;
  size?: number;
  temporary?: boolean;
  empty?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function ChipIcon({
  type,
  tier = 'gold',
  size = 24,
  temporary = false,
  empty = false,
  className,
  style,
}: ChipIconProps) {
  const src = CHIP_ASSET[tier][type];
  const accent = QUALITY_ACCENT[tier];

  return (
    <span
      className={twMerge('relative inline-flex shrink-0', className)}
      style={{ width: size, height: size, opacity: empty ? 0.35 : 1, ...style }}
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
      {temporary && (
        <span
          className="flex-center absolute -top-0.5 -right-0.5 rounded-full border"
          style={{
            width: Math.max(12, Math.round(size * 0.32)),
            height: Math.max(12, Math.round(size * 0.32)),
            backgroundColor: 'rgba(20,16,38,0.92)',
            borderColor: accent,
            boxShadow: `0 0 6px color-mix(in srgb, ${accent} 60%, transparent)`,
            color: accent,
          }}
        >
          <Timer
            size={Math.max(8, Math.round(size * 0.2))}
            stroke="currentColor"
            strokeWidth={2.6}
          />
        </span>
      )}
    </span>
  );
}
