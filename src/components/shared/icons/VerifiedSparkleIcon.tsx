import type { CSSProperties } from 'react';
import Image from 'next/image';
import { twMerge } from 'tailwind-merge';
import { icons } from '@/constants/icons';

export interface VerifiedSparkleIconProps {
  size?: number;
  className?: string;
  style?: CSSProperties;
}

export function VerifiedSparkleIcon({ size = 14, className, style }: VerifiedSparkleIconProps) {
  return (
    <span
      className={twMerge('relative inline-flex shrink-0', className)}
      style={{ width: size, height: size, ...style }}
      aria-hidden
    >
      <Image
        src={icons.verified}
        alt=""
        width={size}
        height={size}
        sizes={`${size}px`}
        className="h-full w-full object-contain"
      />
    </span>
  );
}
