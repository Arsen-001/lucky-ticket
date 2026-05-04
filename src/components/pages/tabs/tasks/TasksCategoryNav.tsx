'use client';

import { type RefObject, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { TaskCategory } from '@/types/enums/tasks.enums';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { MessageIds } from '@/types/types/i18n.types';
import { TaskCategoryIcon } from './TaskCategoryIcon';

export interface CategoryNavItem {
  category: TaskCategory;
  readyCount: number;
}

export interface TasksCategoryNavProps {
  items: CategoryNavItem[];
  activeCategory: TaskCategory | null;
  onSelect: (category: TaskCategory) => void;
  containerRef?: RefObject<HTMLDivElement | null>;
  className?: string;
}

const CATEGORY_LABEL_KEY: Record<TaskCategory, MessageIds> = {
  [TaskCategory.ADS]: 'category ads',
  [TaskCategory.TOURNAMENTS]: 'category tournaments',
  [TaskCategory.SOCIAL]: 'category social',
  [TaskCategory.PROFILE]: 'category profile',
  [TaskCategory.FRIENDS]: 'category friends',
  [TaskCategory.QUEST]: 'category quest',
  [TaskCategory.MARKET]: 'category market',
  [TaskCategory.STAKES]: 'category stakes',
  [TaskCategory.PREMIUM]: 'category premium',
  [TaskCategory.VIP]: 'category vip',
  [TaskCategory.ACHIEVEMENTS]: 'category achievements',
  [TaskCategory.PARTNERS]: 'category partners',
};

export function TasksCategoryNav({
  items,
  activeCategory,
  onSelect,
  containerRef,
  className,
}: TasksCategoryNavProps) {
  const t = useAppTranslations();
  const scrollRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<Map<TaskCategory, HTMLButtonElement>>(new Map());
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  // Update sliding indicator position when active changes or layout shifts
  useLayoutEffect(() => {
    if (!activeCategory) {
      setIndicator(null);
      return;
    }
    const chip = chipRefs.current.get(activeCategory);
    if (!chip) return;
    setIndicator({ left: chip.offsetLeft, width: chip.offsetWidth });
  }, [activeCategory, items]);

  // Recompute indicator on resize / scroll resizing
  useEffect(() => {
    const handle = () => {
      if (!activeCategory) return;
      const chip = chipRefs.current.get(activeCategory);
      if (!chip) return;
      setIndicator({ left: chip.offsetLeft, width: chip.offsetWidth });
    };
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, [activeCategory]);

  // Auto-scroll the chip nav so the active chip stays centered
  useEffect(() => {
    if (!activeCategory) return;
    const chip = chipRefs.current.get(activeCategory);
    const wrap = scrollRef.current;
    if (!chip || !wrap) return;
    const chipCenter = chip.offsetLeft + chip.offsetWidth / 2;
    const wrapCenter = wrap.clientWidth / 2;
    wrap.scrollTo({ left: chipCenter - wrapCenter, behavior: 'smooth' });
  }, [activeCategory]);

  return (
    <div
      ref={containerRef}
      className={twMerge(
        'sticky top-0 z-30 backdrop-blur-md bg-background/85 border-b border-white/5',
        className
      )}
    >
      <div
        ref={scrollRef}
        className="scrollbar-hidden relative overflow-x-auto px-4 py-3 scroll-smooth"
      >
        <div ref={trackRef} className="relative inline-flex items-center gap-2">
          {/* Sliding active indicator — slides smoothly between chips during scroll */}
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

          {items.map(({ category, readyCount }) => {
            const active = category === activeCategory;
            return (
              <button
                key={category}
                type="button"
                ref={el => {
                  if (el) chipRefs.current.set(category, el);
                  else chipRefs.current.delete(category);
                }}
                onClick={() => onSelect(category)}
                className={twMerge(
                  'relative z-1 flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold whitespace-nowrap shrink-0 active:scale-95 transition-colors duration-300',
                  active ? 'text-white' : 'bg-white/5 text-white-secondary hover:bg-white/10'
                )}
                aria-pressed={active}
              >
                <TaskCategoryIcon
                  category={category}
                  size={14}
                  className={twMerge(
                    '!w-7 !h-7 transition-opacity duration-300',
                    !active && 'opacity-80'
                  )}
                />
                <span>{t(CATEGORY_LABEL_KEY[category])}</span>
                {readyCount > 0 && (
                  <span
                    className={twMerge(
                      'flex-center min-w-5 h-5 px-1.5 rounded-full text-[11px] font-bold tabular-nums transition-colors duration-300',
                      active ? 'bg-white text-electric-pink' : 'bg-electric-pink text-white'
                    )}
                  >
                    {readyCount}
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
