import type { CSSProperties } from 'react';
import Image from 'next/image';
import { twMerge } from 'tailwind-merge';
import { icons } from '@/constants/icons';

export interface BoltIconProps {
  size?: number;
  className?: string;
  style?: CSSProperties;
}

export function BoltIcon({ size = 18, className, style }: BoltIconProps) {
  return (
    <span
      className={twMerge('relative inline-flex shrink-0 rotate-[25deg]', className)}
      style={{ width: size, height: size, ...style }}
      aria-hidden
    >
      <Image
        src={icons.bolt}
        alt=""
        width={size}
        height={size}
        sizes={`${size}px`}
        className="h-full w-full object-contain"
      />
    </span>
  );
}
