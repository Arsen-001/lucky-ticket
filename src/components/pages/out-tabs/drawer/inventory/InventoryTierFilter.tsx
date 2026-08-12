'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { QUALITY_ACCENT, QUALITY_TIERS } from '@/utils/global/inventory.utils';
import type { TicketType } from '@/types/types/ticket.types';

export type InventoryTierFilterValue = 'all' | TicketType;

const TIER_VALUES: InventoryTierFilterValue[] = ['all', ...QUALITY_TIERS];

export interface InventoryTierFilterProps {
  value: InventoryTierFilterValue;
  onChange: (next: InventoryTierFilterValue) => void;
  className?: string;
}

export function InventoryTierFilter({ value, onChange, className }: InventoryTierFilterProps) {
  const t = useAppTranslations();
  const scrollRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<Map<InventoryTierFilterValue, HTMLButtonElement>>(new Map());
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  useLayoutEffect(() => {
    const chip = chipRefs.current.get(value);
    if (!chip) return;
    setIndicator({ left: chip.offsetLeft, width: chip.offsetWidth });
  }, [value]);

  useEffect(() => {
    const handle = () => {
      const chip = chipRefs.current.get(value);
      if (!chip) return;
      setIndicator({ left: chip.offsetLeft, width: chip.offsetWidth });
    };
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, [value]);

  useEffect(() => {
    const chip = chipRefs.current.get(value);
    const wrap = scrollRef.current;
    if (!chip || !wrap) return;
    const chipCenter = chip.offsetLeft + chip.offsetWidth / 2;
    const wrapCenter = wrap.clientWidth / 2;
    wrap.scrollTo({ left: chipCenter - wrapCenter, behavior: 'smooth' });
  }, [value]);

  return (
    <div className={twMerge('bg-background/85 sticky top-0 z-30 backdrop-blur-md', className)}>
      <div ref={scrollRef} className="scrollbar-hidden relative overflow-x-auto scroll-smooth py-3">
        <div className="relative inline-flex items-center gap-2">
          {indicator && (
            <span
              aria-hidden
              className="bg-pink-gradient pointer-events-none absolute top-0 bottom-0 rounded-full transition-[transform,width] duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{
                width: indicator.width,
                transform: `translateX(${indicator.left}px)`,
              }}
            />
          )}

          {TIER_VALUES.map(tier => {
            const active = tier === value;
            const accent = tier === 'all' ? null : QUALITY_ACCENT[tier];
            return (
              <button
                key={tier}
                type="button"
                ref={el => {
                  if (el) chipRefs.current.set(tier, el);
                  else chipRefs.current.delete(tier);
                }}
                onClick={() => onChange(tier)}
                aria-pressed={active}
                className={twMerge(
                  'tap-target relative z-1 flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-2 text-[12px] font-extrabold uppercase tracking-wider transition-colors duration-300 active:scale-95',
                  active ? 'text-white' : 'text-white-secondary bg-white/5 hover:bg-white/10'
                )}
              >
                {accent && (
                  <span
                    className="h-2 w-2 rounded-full transition-shadow duration-300"
                    style={{
                      backgroundColor: accent,
                      boxShadow: active ? `0 0 8px ${accent}` : 'none',
                    }}
                  />
                )}
                <span>{t(tier)}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
