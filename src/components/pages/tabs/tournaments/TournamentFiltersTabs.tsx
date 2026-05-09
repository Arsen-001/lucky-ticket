'use client';

import { type RefObject, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Clock, History, Layers, type LucideIcon, TrendingUp } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { MessageIds } from '@/types/types/i18n.types';

export type TournamentFilterKey = 'all' | 'top' | 'participated' | 'history';

export interface TournamentFilterTab {
  key: TournamentFilterKey;
  count: number;
}

interface TournamentFiltersTabsProps {
  active: TournamentFilterKey;
  onChange: (key: TournamentFilterKey) => void;
  tabs: TournamentFilterTab[];
  className?: string;
  containerRef?: RefObject<HTMLDivElement | null>;
}

const TAB_ICON: Record<TournamentFilterKey, LucideIcon> = {
  all: Layers,
  top: TrendingUp,
  participated: Clock,
  history: History,
};

const TAB_LABEL_KEY: Record<TournamentFilterKey, MessageIds> = {
  all: 'all',
  top: 'top',
  participated: 'participated-filter',
  history: 'history',
};

export function TournamentFiltersTabs({
  active,
  onChange,
  tabs,
  className,
  containerRef,
}: TournamentFiltersTabsProps) {
  const t = useAppTranslations();
  const scrollRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<Map<TournamentFilterKey, HTMLButtonElement>>(new Map());
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  useLayoutEffect(() => {
    const chip = chipRefs.current.get(active);
    if (!chip) return;
    setIndicator({ left: chip.offsetLeft, width: chip.offsetWidth });
  }, [active, tabs]);

  useEffect(() => {
    const handle = () => {
      const chip = chipRefs.current.get(active);
      if (!chip) return;
      setIndicator({ left: chip.offsetLeft, width: chip.offsetWidth });
    };
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, [active]);

  useEffect(() => {
    const chip = chipRefs.current.get(active);
    const wrap = scrollRef.current;
    if (!chip || !wrap) return;
    const chipCenter = chip.offsetLeft + chip.offsetWidth / 2;
    const wrapCenter = wrap.clientWidth / 2;
    wrap.scrollTo({ left: chipCenter - wrapCenter, behavior: 'smooth' });
  }, [active]);

  return (
    <div ref={containerRef} className={twMerge('relative', className)}>
      <div ref={scrollRef} className="scrollbar-hidden relative overflow-x-auto scroll-smooth">
        <div ref={trackRef} className="relative inline-flex items-center gap-2">
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

          {tabs.map(({ key, count }) => {
            const isActive = key === active;
            const Icon = TAB_ICON[key];
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
                  'relative z-1 flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[12px] font-semibold whitespace-nowrap shrink-0 active:scale-95 transition-colors duration-300',
                  isActive ? 'text-white' : 'bg-white/5 text-white-secondary hover:bg-white/10'
                )}
              >
                <Icon
                  className={twMerge(
                    'w-3.5 h-3.5 transition-opacity duration-300',
                    !isActive && 'opacity-80'
                  )}
                  strokeWidth={2.4}
                />
                <span>{t(TAB_LABEL_KEY[key])}</span>
                {count > 0 && (
                  <span
                    className={twMerge(
                      'flex-center min-w-4 h-4 px-1 rounded-full text-[10px] font-bold tabular-nums transition-colors duration-300',
                      isActive ? 'bg-white text-electric-pink' : 'bg-electric-pink text-white'
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
