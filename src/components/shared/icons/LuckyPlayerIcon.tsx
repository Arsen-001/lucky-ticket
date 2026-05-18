'use client';
import type { CSSProperties } from 'react';
import Image from 'next/image';
import { twMerge } from 'tailwind-merge';
import { icons } from '@/constants/icons';

export type LuckyPlayerIconState = 'active' | 'idle' | 'locked';

export interface LuckyPlayerIconProps {
  size?: number;
  state?: LuckyPlayerIconState;
  /** Kept for backwards compatibility; webp asset doesn't animate. */
  animated?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function LuckyPlayerIcon({
  size = 36,
  state = 'active',
  className,
  style,
}: LuckyPlayerIconProps) {
  const isLocked = state === 'locked';

  return (
    <span
      className={twMerge('relative inline-flex shrink-0', className)}
      style={{
        width: size,
        height: size,
        filter: isLocked ? 'grayscale(1) brightness(0.7)' : undefined,
        opacity: isLocked ? 0.55 : 1,
        ...style,
      }}
      aria-hidden
    >
      <Image
        src={icons.luckyPlayer}
        alt=""
        width={size}
        height={size}
        sizes={`${size}px`}
        className="h-full w-full object-contain"
      />
    </span>
  );
}
