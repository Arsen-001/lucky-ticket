import Image from 'next/image';
import type { CSSProperties } from 'react';
import type { ImageProps } from 'next/image';
import { twMerge } from 'tailwind-merge';
import { icons } from '@/constants/icons';

export interface TelegramStarIconProps {
  size?: number;
  className?: string;
  style?: CSSProperties;
  alt?: string;
  nextLoading?: ImageProps['loading'];
}

/**
 * Laid out with explicit `width`/`height` rather than `fill` — same as the other
 * image icons (`Ticket`, `Medal`, `EngineIcon`). A `fill` image is absolutely
 * positioned off its wrapper, which iOS mis-rasterizes at these sizes inside the
 * home cube's 3D layer (`transform-style: preserve-3d` + `backface-visibility`).
 *
 * `nextLoading` defaults to eager for the same reason the ticket/medal icons do:
 * the star is a ~15KB shared asset used in prices, and lazy loading inside a
 * composited 3D layer is exactly where iOS skips the intersection callback.
 */
export function TelegramStarIcon({
  size = 14,
  className,
  style,
  alt = '',
  nextLoading = 'eager',
}: TelegramStarIconProps) {
  return (
    <span
      className={twMerge('relative inline-flex shrink-0', className)}
      style={{ width: size, height: size, ...style }}
    >
      <Image
        src={icons.telegramStar}
        alt={alt}
        aria-hidden={alt === '' ? true : undefined}
        width={size}
        height={size}
        sizes={`${size}px`}
        loading={nextLoading}
        className="h-full w-full object-contain"
      />
    </span>
  );
}
