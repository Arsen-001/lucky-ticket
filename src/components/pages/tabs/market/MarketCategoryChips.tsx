'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { CircleStar, Cog, Gem, Gift, Palette, Sparkles, Ticket } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { MessageIds } from '@/types/types/i18n.types';

export type MarketCategoryKey =
  | 'all'
  | 'engines'
  | 'tickets'
  | 'shards'
  | 'cosmetics'
  | 'status'
  | 'gifts';

export const MARKET_CATEGORY_ORDER: MarketCategoryKey[] = [
  'all',
  'status',
  'tickets',
  'shards',
  'engines',
  'cosmetics',
  // Last on purpose: the counter is off by default and renders nothing at all
  // when it is, so a chip that leads to an empty screen sits where it is least
  // in the way.
  'gifts',
];

const CATEGORY_ICON: Record<MarketCategoryKey, LucideIcon> = {
  all: Sparkles,
  engines: Cog,
  tickets: Ticket,
  shards: Gem,
  cosmetics: Palette,
  status: CircleStar,
  gifts: Gift,
};

const CATEGORY_LABEL: Record<MarketCategoryKey, MessageIds> = {
  all: 'all',
  engines: 'engines',
  tickets: 'tickets',
  shards: 'shards title',
  cosmetics: 'cosmetics',
  status: 'status',
  gifts: 'gifts',
};

export interface MarketCategoryChipsProps {
  active: MarketCategoryKey;
  onChange: (key: MarketCategoryKey) => void;
  /**
   * Which chips to draw. Defaults to every category — pass a narrower list when
   * one of them has nothing behind it. A chip whose section renders nothing is
   * worse than a missing chip: it reads as a broken screen, not an absent
   * feature (the gift counter ships switched off, so this is its normal state).
   */
  order?: MarketCategoryKey[];
  className?: string;
}

export function MarketCategoryChips({
  active,
  onChange,
  order = MARKET_CATEGORY_ORDER,
  className,
}: MarketCategoryChipsProps) {
  const t = useAppTranslations();
  const scrollRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<Map<MarketCategoryKey, HTMLButtonElement>>(new Map());
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  // Update sliding indicator position when active changes or layout shifts
  useLayoutEffect(() => {
    const chip = chipRefs.current.get(active);
    if (!chip) return;
    setIndicator({ left: chip.offsetLeft, width: chip.offsetWidth });
  }, [active]);

  // Recompute indicator on resize
  useEffect(() => {
    const handle = () => {
      const chip = chipRefs.current.get(active);
      if (!chip) return;
      setIndicator({ left: chip.offsetLeft, width: chip.offsetWidth });
    };
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, [active]);

  // Auto-scroll the chip nav so the active chip stays centered
  useEffect(() => {
    const chip = chipRefs.current.get(active);
    const wrap = scrollRef.current;
    if (!chip || !wrap) return;
    const chipCenter = chip.offsetLeft + chip.offsetWidth / 2;
    const wrapCenter = wrap.clientWidth / 2;
    wrap.scrollTo({ left: chipCenter - wrapCenter, behavior: 'smooth' });
  }, [active]);

  return (
    <div className={twMerge('relative', className)}>
      <div ref={scrollRef} className="scrollbar-hidden relative overflow-x-auto scroll-smooth">
        <div ref={trackRef} className="relative inline-flex items-center gap-2">
          {/* Sliding active indicator — slides smoothly between chips */}
          {indicator && (
            <span
              aria-hidden
              className="pointer-events-none absolute top-0 bottom-0 rounded-full bg-pink-gradient shadow-lg shadow-electric-pink/30 transition-[transform,width] duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{
                width: indicator.width,
                transform: `translateX(${indicator.left}px)`,
              }}
            />
          )}

          {order.map(key => {
            const isActive = key === active;
            const Icon = CATEGORY_ICON[key];
            return (
              <button
                key={key}
                type="button"
                ref={el => {
                  if (el) chipRefs.current.set(key, el);
                  else chipRefs.current.delete(key);
                }}
                onClick={() => onChange(key)}
                aria-pressed={isActive}
                className={twMerge(
                  'relative z-1 flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold whitespace-nowrap shrink-0 active:scale-95 transition-colors duration-300',
                  isActive
                    ? 'text-white'
                    : 'bg-background-overlay text-white-secondary hover:bg-surface-hover'
                )}
              >
                <Icon
                  size={14}
                  className={twMerge(
                    'relative shrink-0 transition-opacity duration-300',
                    isActive ? 'text-white' : 'text-white/55 opacity-80'
                  )}
                  strokeWidth={2.4}
                />
                <span className="relative capitalize leading-none mt-[1px]">
                  {t(CATEGORY_LABEL[key])}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
