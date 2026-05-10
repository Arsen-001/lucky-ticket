'use client';

import { useEffect, useRef } from 'react';
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
  const chipRefs = useRef<Map<MarketCategoryKey, HTMLButtonElement>>(new Map());

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
        <div className="relative inline-flex items-center gap-2">
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
                  'relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold whitespace-nowrap shrink-0 active:scale-95 transition-colors duration-300 overflow-hidden',
                  isActive ? 'text-white' : 'bg-white/3 text-white-secondary hover:bg-white/6'
                )}
                style={
                  isActive
                    ? {
                        backgroundColor: 'rgba(255,255,255,0.12)',
                      }
                    : undefined
                }
              >
                <Icon
                  size={14}
                  className={twMerge(
                    'relative shrink-0',
                    isActive ? 'text-white' : 'text-white/55'
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
