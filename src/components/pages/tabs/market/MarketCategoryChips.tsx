'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { CircleStar, Cog, Crown, Cpu, Hammer, Palette, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { MessageIds } from '@/types/types/i18n.types';

export type MarketCategoryKey =
  | 'all'
  | 'engines'
  | 'chips'
  | 'builders'
  | 'boosters'
  | 'cosmetics'
  | 'passes'
  | 'status';

export const MARKET_CATEGORY_ORDER: MarketCategoryKey[] = [
  'all',
  'status',
  'boosters',
  'chips',
  'builders',
  'engines',
  'cosmetics',
  'passes',
];

const CATEGORY_ICON: Record<MarketCategoryKey, LucideIcon> = {
  all: Sparkles,
  engines: Cog,
  chips: Cpu,
  builders: Hammer,
  boosters: Sparkles,
  cosmetics: Palette,
  passes: Crown,
  status: CircleStar,
};

const CATEGORY_LABEL: Record<MarketCategoryKey, MessageIds> = {
  all: 'all',
  engines: 'engines',
  chips: 'chips',
  builders: 'chip builders',
  boosters: 'boosters',
  cosmetics: 'cosmetics',
  passes: 'passes',
  status: 'status',
};

export interface MarketCategoryChipsProps {
  active: MarketCategoryKey;
  onChange: (key: MarketCategoryKey) => void;
  className?: string;
}

export function MarketCategoryChips({ active, onChange, className }: MarketCategoryChipsProps) {
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

          {MARKET_CATEGORY_ORDER.map(key => {
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
                  isActive ? 'text-white' : 'bg-white/5 text-white-secondary hover:bg-white/10'
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
