import Image from 'next/image';
import type { CSSProperties } from 'react';
import { twMerge } from 'tailwind-merge';
import { icons } from '@/constants/icons';

export interface TelegramStarIconProps {
  size?: number;
  className?: string;
  style?: CSSProperties;
  alt?: string;
}

export function TelegramStarIcon({ size = 14, className, style, alt = '' }: TelegramStarIconProps) {
  return (
    <span
      className={twMerge('relative inline-block shrink-0', className)}
      style={{ width: size, height: size, ...style }}
    >
      <Image
        src={icons.telegramStar}
        alt={alt}
        aria-hidden={alt === '' ? true : undefined}
        fill
        sizes={`${size}px`}
        style={{ objectFit: 'contain' }}
      />
    </span>
  );
}
