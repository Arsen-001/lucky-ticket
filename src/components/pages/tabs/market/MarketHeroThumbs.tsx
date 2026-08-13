'use client';

import { twMerge } from 'tailwind-merge';
import type { MarketFeaturedItem } from '@/hooks/useMarketFeaturedItems';

export interface MarketHeroThumbsProps {
  items: MarketFeaturedItem[];
  activeIndex: number;
  onPick: (index: number) => void;
  className?: string;
}

/**
 * The showcase's navigation: the offers themselves, small. It replaces a row of
 * dots, which said only "there are five of something" and gave a 5px target;
 * a thumbnail says what each slide holds and is 44px wide to tap.
 *
 * 44, not 34, since 13.08.2026 — and by its own size, because the thumbnail
 * crops its artwork with `overflow-hidden` and that clips the invisible
 * `tap-target` zone the rest of the app uses. Measured before the change: 10px
 * of clear space above and 16px below, against the 5px each side a 44px zone
 * would have needed, so the row had the room either way; growing the box is
 * simply the option that works here.
 */
export function MarketHeroThumbs({ items, activeIndex, onPick, className }: MarketHeroThumbsProps) {
  if (items.length < 2) return null;

  return (
    <div className={twMerge('scrollbar-hidden flex gap-2 overflow-x-auto', className)}>
      {items.map((item, index) => (
        <button
          key={item.id}
          type="button"
          aria-label={item.title}
          aria-current={index === activeIndex}
          onClick={() => onPick(index)}
          style={{ '--hero-accent': item.accentColor } as React.CSSProperties}
          className={twMerge(
            'market-hero-thumb h-11 w-11 shrink-0 overflow-hidden rounded-[10px] transition-all',
            index === activeIndex ? 'market-hero-thumb-active' : 'opacity-55'
          )}
        >
          {item.imageUrl ? (
            // Admin-provided URL — plain <img>, as everywhere else in the market.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.imageUrl}
              alt=""
              className="h-full w-full object-cover object-[50%_20%]"
            />
          ) : (
            <span className="flex-center h-full w-full">{item.renderIcon(30)}</span>
          )}
        </button>
      ))}
    </div>
  );
}
