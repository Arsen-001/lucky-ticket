'use client';

import type { CSSProperties, KeyboardEvent, MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import { twMerge } from 'tailwind-merge';
import { CoinIcon } from '@/components/shared/icons/CoinIcon';
import { routes } from '@/constants/routes';

export interface LcLabelProps {
  size?: number;
  className?: string;
  style?: CSSProperties;
  /** When true, blocks parent click handlers (default: true). */
  stopPropagation?: boolean;
  /** When false, renders a plain decorative coin with no link to /lc (default: true). */
  interactive?: boolean;
}

/**
 * Clickable LC affordance: renders the LC coin asset and routes to /lc on click.
 * Use anywhere "LC" would otherwise appear as plain text — the icon stands in
 * for the currency abbreviation.
 */
export function LcLabel({
  size = 14,
  className,
  style,
  stopPropagation = true,
  interactive = true,
}: LcLabelProps) {
  const router = useRouter();

  if (!interactive) {
    return (
      <span
        aria-label="LC"
        style={style}
        className={twMerge('inline-flex shrink-0 items-center align-middle', className)}
      >
        <CoinIcon size={size} />
      </span>
    );
  }

  const go = () => router.push(routes.lc);

  const handleClick = (event: MouseEvent) => {
    event.preventDefault();
    if (stopPropagation) event.stopPropagation();
    go();
  };

  const handleKey = (event: KeyboardEvent) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    if (stopPropagation) event.stopPropagation();
    go();
  };

  return (
    <span
      role="link"
      tabIndex={0}
      aria-label="LC"
      onClick={handleClick}
      onKeyDown={handleKey}
      style={style}
      className={twMerge(
        'inline-flex shrink-0 cursor-pointer items-center align-middle transition-opacity hover:opacity-80 active:opacity-60',
        className
      )}
    >
      <CoinIcon size={size} />
    </span>
  );
}
