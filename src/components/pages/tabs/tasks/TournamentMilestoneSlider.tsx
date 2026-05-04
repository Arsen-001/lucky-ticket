'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { type LucideIcon, Trophy } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import type { StaticImageData } from 'next/image';
import { type MedalType } from '@/components/shared/icons/Medal';
import { TaskStatus } from '@/types/enums/tasks.enums';
import type { TicketType } from '@/types/types/ticket.types';
import type { Task } from '@/types/interfaces/tasks.interfaces';
import { TASK_PAGE } from '@/constants/tasks.constants';
import { ComingSoonCard } from './ComingSoonCard';
import { MilestoneCard } from './MilestoneCard';

const SLIDE_WIDTH = TASK_PAGE.sliderSlideWidthPx;

export interface TournamentMilestoneSliderProps {
  tasks: Task[];
  onClaim: (task: Task) => void;
  /** Section title shown above the carousel (e.g. "Take a prize place"). */
  title: string;
  /** Section subtitle shown beneath the title. */
  blurb: string;
  /** Word displayed under the big number on each card (e.g. "prize place" / "tournaments"). */
  unitLabel: string;
  /** Header icon (defaults to Trophy). */
  headerIcon?: LucideIcon;
  /** Header icon background gradient (Tailwind classes, e.g. "from-gold to-orange"). */
  headerGradient?: string;
  /**
   * If provided, renders this icon next to the big target number and moves the
   * unit label onto its own line beneath the number. Used by the Tickets slider.
   */
  numberIcon?: LucideIcon;
  /**
   * If provided, replaces the default Trophy badge on each card with the matching
   * Lucky Ticket asset (bronze/silver/gold/platinum/diamond).
   */
  cardIconType?: TicketType;
  /**
   * If provided, replaces the default Trophy badge on each card with the matching
   * Medal asset. Used by the Engines slider.
   */
  cardMedalType?: MedalType;
  /**
   * If provided, replaces the default Trophy badge on each card with this static
   * image. Used by the Stars slider for the telegram-star asset.
   */
  cardImageSrc?: StaticImageData | string;
  /**
   * If provided, replaces the default Trophy badge on each card with this lucide
   * icon rendered in a gradient frame.
   */
  cardLucideIcon?: LucideIcon;
  /** Gradient classes for the cardLucideIcon frame. */
  cardLucideGradient?: string;
  className?: string;
}

/**
 * Snap-center carousel for tournament milestone chains (podium, participation, etc).
 * Same UX as the daily ads slider: one centered active card,
 * side cards scaled down, auto-scroll to the next incomplete milestone.
 */
export function TournamentMilestoneSlider({
  tasks,
  onClaim,
  title,
  blurb,
  unitLabel,
  headerIcon: HeaderIcon = Trophy,
  headerGradient = 'from-gold to-orange',
  numberIcon,
  cardIconType,
  cardMedalType,
  cardImageSrc,
  cardLucideIcon,
  cardLucideGradient,
  className,
}: TournamentMilestoneSliderProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Anchor to LEFT edge — leftmost-visible card is the active one (mirrored layout)
  const recomputeActive = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const probe = scroller.scrollLeft + 16; // small offset from left edge
    const slides = scroller.querySelectorAll<HTMLDivElement>('[data-milestone-slide]');
    let bestIdx = 0;
    let bestDist = Infinity;
    slides.forEach(el => {
      const idx = Number(el.dataset.milestoneIndex);
      const slideStart = el.offsetLeft;
      const dist = Math.abs(slideStart - probe);
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
    const el = scroller.querySelector<HTMLDivElement>(`[data-milestone-index="${index}"]`);
    if (!el) return;
    // Align card to the LEFT edge (with small breathing room)
    const target = el.offsetLeft - 16;
    scroller.scrollTo({ left: Math.max(0, target), behavior });
  }, []);

  useEffect(() => {
    if (!tasks.length) return;
    recomputeActive();
    const scroller = scrollerRef.current;
    if (!scroller) return;
    scroller.addEventListener('scroll', recomputeActive, { passive: true });
    window.addEventListener('resize', recomputeActive);
    return () => {
      scroller.removeEventListener('scroll', recomputeActive);
      window.removeEventListener('resize', recomputeActive);
    };
  }, [recomputeActive, tasks.length]);

  // Auto-scroll to first incomplete milestone on mount
  const firstIncomplete = tasks.findIndex(t => t.status !== TaskStatus.COMPLETED);
  useEffect(() => {
    if (firstIncomplete < 0) return;
    const id = window.setTimeout(() => scrollToIndex(firstIncomplete, 'smooth'), 50);
    return () => window.clearTimeout(id);
  }, [firstIncomplete, scrollToIndex]);

  if (!tasks.length) return null;

  return (
    <div className={twMerge('flex flex-col gap-2', className)}>
      <div className="flex items-center gap-2">
        <div
          className={twMerge(
            'flex-center w-7 h-7 rounded-lg bg-gradient-to-br shadow-md shadow-black/30',
            headerGradient
          )}
        >
          <HeaderIcon size={14} className="text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-extrabold leading-tight">{title}</h3>
          <p className="text-[11px] text-pink-secondary line-clamp-1">{blurb}</p>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="scrollbar-hidden -mx-4 flex snap-x snap-mandatory items-center gap-[27px] overflow-x-auto overflow-y-visible px-4"
        style={{
          scrollPaddingInline: '16px',
        }}
      >
        {tasks.map((task, index) => {
          const isActive = index === activeIndex;
          // Left-anchored: active card stays put, side cards pull toward it from the right
          const sideOffset = isActive ? 0 : index < activeIndex ? 20 : -20;
          return (
            <div
              key={task.id}
              data-milestone-slide
              data-milestone-index={index}
              onClick={!isActive ? () => scrollToIndex(index) : undefined}
              style={{
                flex: `0 0 ${SLIDE_WIDTH}px`,
                transform: `translateX(${sideOffset}px) scale(${isActive ? 1 : 0.88})`,
                transformOrigin: 'left center',
              }}
              className={twMerge(
                'snap-start transition-all duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
                isActive ? 'opacity-100' : 'cursor-pointer opacity-65 saturate-75'
              )}
            >
              <MilestoneCard
                task={task}
                onClaim={onClaim}
                active={isActive}
                unitLabel={unitLabel}
                numberIcon={numberIcon}
                cardIconType={cardIconType}
                cardMedalType={cardMedalType}
                cardImageSrc={cardImageSrc}
                cardLucideIcon={cardLucideIcon}
                cardLucideGradient={cardLucideGradient}
              />
            </div>
          );
        })}

        {/* Coming-soon teaser — placeholder for future milestones */}
        <div
          data-milestone-slide
          data-milestone-index={tasks.length}
          onClick={activeIndex !== tasks.length ? () => scrollToIndex(tasks.length) : undefined}
          style={{
            flex: `0 0 ${SLIDE_WIDTH}px`,
            transform: `translateX(${activeIndex === tasks.length ? 0 : -20}px) scale(${
              activeIndex === tasks.length ? 1 : 0.88
            })`,
            transformOrigin: 'left center',
          }}
          className={twMerge(
            'snap-start transition-all duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
            activeIndex === tasks.length ? 'opacity-100' : 'cursor-pointer opacity-65 saturate-75'
          )}
        >
          <ComingSoonCard
            cardIconType={cardIconType}
            cardMedalType={cardMedalType}
            cardImageSrc={cardImageSrc}
          />
        </div>
      </div>
    </div>
  );
}
