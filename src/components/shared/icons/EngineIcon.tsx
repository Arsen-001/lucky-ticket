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
  /**
   * Load this one immediately — for the engine already on screen when a route
   * paints (the onboarding gift list is the case that reached the console).
   * Next lazy-loads images by default, so an engine above the fold ends up
   * being the Largest Contentful Paint AND the last thing requested.
   *
   * `loading="eager"` + `fetchPriority="high"`, not `priority`: that prop is
   * deprecated in Next 16 (@see node_modules/next/dist/docs — Image, `preload`),
   * and passing it does nothing at all, silently.
   *
   * Deliberately opt-in: eager on every engine icon would front-load the twenty
   * in the market grid and cost more than it saves.
   */
  eager?: boolean;
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
  eager = false,
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
        loading={eager ? 'eager' : undefined}
        fetchPriority={eager ? 'high' : undefined}
        className="h-full w-full object-contain"
      />
    </span>
  );
}
