import Image from 'next/image';
import type { CSSProperties } from 'react';
import { twMerge } from 'tailwind-merge';
import { icons } from '@/constants/icons';

export interface CoinIconProps {
  size?: number;
  className?: string;
  style?: CSSProperties;
}

export function CoinIcon({ size = 24, className, style }: CoinIconProps) {
  return (
    <Image
      src={icons.coin}
      width={size * 2}
      height={size * 2}
      quality={100}
      alt=""
      aria-hidden
      className={twMerge('coin-icon shrink-0', className)}
      style={{ width: size, height: size, ...style }}
    />
  );
}
