'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { Eye } from 'lucide-react';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useCountDown } from '@/hooks/useCountDown';
import { TaskCategory } from '@/types/enums/tasks.enums';
import type { AdSlot, AdsBlock } from '@/types/interfaces/tasks.interfaces';
import { TaskCategoryIcon } from './TaskCategoryIcon';
import { AdSlideCard } from './AdSlideCard';
import { SectionShine } from './SectionShine';
import { ArrivalShine } from '@/components/shared/ArrivalShine';

export interface AdsSectionProps {
  ads?: AdsBlock;
  loading?: boolean;
  onWatch: (slot: AdSlot) => void;
  registerSection?: (category: TaskCategory, el: HTMLElement | null) => void;
  className?: string;
  highlightToken?: number | null;
}

const SLIDE_WIDTH = 176;

export function AdsSection({
  ads,
  loading,
  onWatch,
  registerSection,
  className,
  highlightToken,
}: AdsSectionProps) {
  const t = useAppTranslations();
  const { leftTime, expired } = useCountDown(ads?.resetAt);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const slots = ads?.slots ?? [];
  const watched = ads?.watchedToday ?? 0;
  const total = ads?.total ?? 0;

  const recomputeActive = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const center = scroller.scrollLeft + scroller.clientWidth / 2;
    const slideEls = scroller.querySelectorAll<HTMLDivElement>('[data-ad-slide]');
    let bestIdx = 0;
    let bestDist = Infinity;
    slideEls.forEach(el => {
      const idx = Number(el.dataset.adIndex);
      const slideCenter = el.offsetLeft + el.offsetWidth / 2;
      const dist = Math.abs(slideCenter - center);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = idx;
      }
    });
    setActiveIndex(bestIdx);
  }, []);

  const scrollToIndex = useCallback((index: number, behavior: ScrollBehavior = 'smooth') => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const el = scroller.querySelector<HTMLDivElement>(`[data-ad-index="${index}"]`);
    if (!el) return;
    const target = el.offsetLeft + el.offsetWidth / 2 - scroller.clientWidth / 2;
    scroller.scrollTo({ left: target, behavior });
  }, []);

  // Track active slide via native scroll
  useEffect(() => {
    if (!slots.length) return;
    recomputeActive();
    const scroller = scrollerRef.current;
    if (!scroller) return;
    scroller.addEventListener('scroll', recomputeActive, { passive: true });
    window.addEventListener('resize', recomputeActive);
    return () => {
      scroller.removeEventListener('scroll', recomputeActive);
      window.removeEventListener('resize', recomputeActive);
    };
  }, [recomputeActive, slots.length]);

  // Auto-scroll to first unwatched on mount + after each watch
  const firstUnwatched = slots.findIndex(s => !s.watched);
  useEffect(() => {
    if (firstUnwatched < 0) return;
    // Wait one paint so scroller layout is ready
    const id = window.setTimeout(() => scrollToIndex(firstUnwatched, 'smooth'), 50);
    return () => window.clearTimeout(id);
  }, [firstUnwatched, scrollToIndex]);

  return (
    <section
      ref={el => registerSection?.(TaskCategory.ADS, el)}
      data-category={TaskCategory.ADS}
      className={twMerge(
        'flex flex-col gap-3 px-4 pt-5 pb-5 scroll-mt-20 border-y border-white/[0.07]',
        className
      )}
    >
      <header className="relative flex items-center gap-3 rounded-2xl overflow-hidden">
        <SectionShine token={highlightToken ?? null} />
        <TaskCategoryIcon category={TaskCategory.ADS} size={20} />
        <div className="min-w-0 flex-1">
          <ArrivalShine id="watchVideo" variant="title">
            <h2 className="text-base font-extrabold leading-tight">{t('category ads')}</h2>
          </ArrivalShine>
          <p className="text-[11px] text-pink-secondary">{t('ads progress', { watched, total })}</p>
        </div>
        {ads?.resetAt && !expired && (
          <span className="rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-bold text-white/60 tabular-nums">
            {leftTime}
          </span>
        )}
      </header>

      {slots.length === 0 ? (
        <div className="rounded-2xl bg-white/5 border border-white/5 px-4 py-6 text-center text-sm text-white/50">
          <Eye size={28} className="mx-auto mb-2 text-white/30" />
          {t('no ads available')}
        </div>
      ) : (
        <div
          ref={scrollerRef}
          className="scrollbar-hidden flex snap-x snap-mandatory items-center gap-3 overflow-x-auto overflow-y-visible -mx-4"
          style={{
            scrollPaddingInline: `calc(50% - ${SLIDE_WIDTH / 2}px)`,
            paddingInline: `calc(50% - ${SLIDE_WIDTH / 2}px)`,
          }}
        >
          {slots.map((slot, index) => {
            const isActive = index === activeIndex;
            const sideOffset = isActive ? 0 : index < activeIndex ? 20 : -20;
            const playableIndex = firstUnwatched < 0 ? -1 : firstUnwatched;
            const locked = !slot.watched && index !== playableIndex;
            const interactive = !slot.watched;
            return (
              <div
                key={slot.id}
                data-ad-slide
                data-ad-index={index}
                onClick={!isActive && interactive ? () => scrollToIndex(index) : undefined}
                style={{
                  flex: `0 0 ${SLIDE_WIDTH}px`,
                  transform: `translateX(${sideOffset}px) scale(${isActive ? 1 : 0.88})`,
                }}
                className={twMerge(
                  'origin-center snap-center transition-all duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
                  isActive ? 'opacity-100' : 'opacity-65 saturate-75',
                  !isActive && interactive && 'cursor-pointer'
                )}
              >
                <AdSlideCard slot={slot} onWatch={onWatch} loading={loading} locked={locked} />
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
