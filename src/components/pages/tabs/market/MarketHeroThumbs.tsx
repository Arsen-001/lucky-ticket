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
 * a thumbnail says what each slide holds and is 34px wide to tap.
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
            'market-hero-thumb h-[34px] w-[34px] shrink-0 overflow-hidden rounded-[10px] transition-all',
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
