'use client';
import type { CSSProperties } from 'react';
import Image from 'next/image';
import { twMerge } from 'tailwind-merge';
import { icons } from '@/constants/icons';
import type { TicketType } from '@/types/types/ticket.types';

export interface EngineIconProps {
  tier?: TicketType;
  size?: number;
  empty?: boolean;
  className?: string;
  style?: CSSProperties;
}

const ENGINE_SRC: Record<TicketType, (typeof icons)['bronzeEngine']> = {
  bronze: icons.bronzeEngine,
  silver: icons.silverEngine,
  gold: icons.goldenEngine,
  platinum: icons.platinumEngine,
  diamond: icons.diamondEngine,
};

export function EngineIcon({
  tier = 'gold',
  size = 48,
  empty = false,
  className,
  style,
}: EngineIconProps) {
  const src = ENGINE_SRC[tier];

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
    </span>
  );
}
