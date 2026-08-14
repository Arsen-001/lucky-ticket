'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Check,
  ChevronRight,
  Clock3,
  Gift,
  Lock,
  type LucideIcon,
  Sparkles,
  Trophy,
  TrendingUp,
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useLocalized } from '@/hooks/useLocalized';
import { Button } from '@/components/shared/buttons/Button';
import { Progress } from '@/components/shared/Progress';
import Image, { type StaticImageData } from 'next/image';
import { Ticket as TicketImage } from '@/components/shared/icons/Ticket';
import { Medal, type MedalType } from '@/components/shared/icons/Medal';
import { TaskRarity, TaskStatus } from '@/types/enums/tasks.enums';
import type { TicketType } from '@/types/types/ticket.types';
import type { Task } from '@/types/interfaces/tasks.interfaces';
import { routes } from '@/constants/routes';
import { useTaskNavigate } from '@/hooks/useTaskNavigate';
import { taskHasDestination } from '@/utils/pages/task-destination.utils';
import { TaskRewardRow } from './TaskRewardRow';
import { ClaimableDot } from '@/components/shared/badges/ClaimableDot';
import { isTaskClaimable } from '@/utils/global/tasks-claimable.utils';

const RARITY_FRAME: Record<TaskRarity, string> = {
  [TaskRarity.BRONZE]: 'task-card-default',
  [TaskRarity.SILVER]: 'task-card-rarity-rare',
  [TaskRarity.GOLD]: 'task-card-rarity-epic',
  [TaskRarity.PLATINUM]: 'task-card-rarity-legendary',
};

const SLIDE_WIDTH = 176;

export interface TournamentMilestoneSliderProps {
  tasks: Task[];
  onClaim: (task: Task) => void;
  /** Section title shown above the carousel (e.g. "Take a prize place"). */
  title: string;
  /** Section subtitle shown beneath the title. */
  blurb: string;
  /**
   * Word displayed under the big number on each card (e.g. "prize place" /
   * "tournaments"). Takes the card's target, because one chain draws several
   * targets (1, 2, 5, 25…) and a language with count agreement needs a
   * different form for each — a fixed string printed «2 двигателей» in Russian.
   */
  unitLabel: (count: number) => string;
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
   * LuckyTicket365 asset (bronze/silver/gold/platinum/diamond).
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
  const t = useAppTranslations();
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
          <h3 className="flex items-center gap-1.5 text-sm font-extrabold leading-tight">
            <span className="min-w-0 truncate">{title}</span>
            {/* The claimable card is often scrolled off the strip — one card is
                centred and the rest sit past the edge, so without this the
                chain looks finished from the outside. */}
            {tasks.some(isTaskClaimable) && <ClaimableDot label={t('something to claim')} />}
          </h3>
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

function ComingSoonCard({
  cardIconType,
  cardMedalType,
  cardImageSrc,
}: {
  cardIconType?: TicketType;
  cardMedalType?: MedalType;
  cardImageSrc?: StaticImageData | string;
}) {
  const t = useAppTranslations();
  return (
    <div
      className={twMerge(
        'relative flex flex-col gap-2 rounded-2xl bg-background-overlay p-3 overflow-hidden min-h-[200px] task-card-default'
      )}
      aria-disabled
    >
      {/* Header — muted trophy/ticket/medal/image + clock badge */}
      <div className="relative flex items-start justify-between">
        {cardIconType ? (
          <div className="relative w-7 h-7 opacity-40">
            <TicketImage type={cardIconType} width={28} height={28} />
          </div>
        ) : cardMedalType ? (
          <div className="relative w-8 h-8 opacity-40">
            <Medal type={cardMedalType} width={32} />
          </div>
        ) : cardImageSrc ? (
          <div className="relative w-8 h-8 opacity-40">
            <Image src={cardImageSrc} alt="" width={32} height={32} />
          </div>
        ) : (
          <div className="flex-center w-7 h-7 rounded-lg bg-white/5 border border-white/10">
            <Trophy size={14} className="text-white/40" />
          </div>
        )}
        <div className="flex-center w-6 h-6 rounded-full bg-white/5 border border-white/10 shrink-0">
          <Clock3 size={12} className="text-white/40" />
        </div>
      </div>

      {/* Middle block — centered in the spare height, mirroring MilestoneCard */}
      <div className="my-auto flex flex-col gap-2">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-extrabold leading-none bg-gradient-to-r from-white/30 to-white/10 bg-clip-text text-transparent">
            ?
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">
            {t('coming soon')}
          </span>
        </div>

        <h4 className="text-[12px] font-extrabold leading-snug text-white/70 line-clamp-2">
          {t('more milestones soon')}
        </h4>
        <p className="text-[10px] text-white/40 leading-tight line-clamp-2">
          {t('more milestones soon blurb')}
        </p>
      </div>

      {/* Footer — soon pill instead of CTA */}
      <div className="w-full rounded-xl py-1.5 text-[10px] font-bold uppercase tracking-wider flex-center gap-1 bg-white/5 text-white/50">
        <Sparkles size={11} />
        {t('coming soon')}
      </div>
    </div>
  );
}

function MilestoneCard({
  task,
  onClaim,
  active,
  unitLabel,
  numberIcon: NumberIcon,
  cardIconType,
  cardMedalType,
  cardImageSrc,
  cardLucideIcon: CardLucideIcon,
  cardLucideGradient,
}: {
  task: Task;
  onClaim: (task: Task) => void;
  active: boolean;
  unitLabel: (count: number) => string;
  numberIcon?: LucideIcon;
  cardIconType?: TicketType;
  cardMedalType?: MedalType;
  cardImageSrc?: StaticImageData | string;
  cardLucideIcon?: LucideIcon;
  cardLucideGradient?: string;
}) {
  const t = useAppTranslations();
  const localized = useLocalized();
  const router = useRouter();
  const navigateToTask = useTaskNavigate();

  const isReady = task.status === TaskStatus.READY_TO_CLAIM;
  const isLocked = task.status === TaskStatus.LOCKED;
  const isCompleted = task.status === TaskStatus.COMPLETED;
  const hasDestination = taskHasDestination(task);
  const showProgress = task.progress.target > 1 && !isCompleted && !isLocked;
  const unit = unitLabel(task.progress.target);
  const pct =
    task.progress.target > 0
      ? Math.min(100, Math.round((task.progress.current / task.progress.target) * 100))
      : 0;

  const handleClick = () => {
    if (isCompleted) return;
    if (isLocked) {
      router.push(routes.market('status'));
      return;
    }
    if (isReady) {
      onClaim(task);
      return;
    }
    // Not `task.deeplink` verbatim: every «Watch N ads» milestone ships a bare
    // `/tasks`, which is the screen this slide is already on — the push was a
    // no-op and the tap did nothing. See `resolveTaskDestination`.
    navigateToTask(task);
  };

  return (
    <div
      onClick={active ? handleClick : undefined}
      role={active && !isCompleted ? 'button' : undefined}
      aria-disabled={isCompleted}
      className={twMerge(
        'relative flex flex-col gap-2 rounded-2xl bg-background-overlay p-3 overflow-hidden min-h-[200px] transition-all',
        RARITY_FRAME[task.rarity],
        isCompleted && 'opacity-80',
        isLocked && 'opacity-50 saturate-50',
        active && !isCompleted && 'cursor-pointer active:scale-[0.98]'
      )}
    >
      {/* Header — trophy/ticket/medal/image (+ inline number for asset variants) + status badge */}
      <div className="relative flex items-start justify-between">
        {cardIconType ? (
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={twMerge(
                'relative w-8 h-8 shrink-0 drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)]',
                isLocked && 'opacity-60'
              )}
            >
              <TicketImage type={cardIconType} width={32} height={32} />
            </div>
            <span className="text-2xl font-extrabold leading-none bg-gradient-to-r from-gold via-electric-pink to-electric-purple bg-clip-text text-transparent">
              {task.progress.target}
            </span>
          </div>
        ) : cardMedalType ? (
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={twMerge(
                'relative w-9 h-9 shrink-0 drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)]',
                isLocked && 'opacity-60'
              )}
            >
              <Medal type={cardMedalType} width={36} />
            </div>
            <span className="text-2xl font-extrabold leading-none bg-gradient-to-r from-gold via-electric-pink to-electric-purple bg-clip-text text-transparent">
              {task.progress.target}
            </span>
          </div>
        ) : cardImageSrc ? (
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={twMerge(
                'relative w-8 h-8 shrink-0 drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)]',
                isLocked && 'opacity-60'
              )}
            >
              <Image src={cardImageSrc} alt="" width={32} height={32} />
            </div>
            <span className="text-2xl font-extrabold leading-none bg-gradient-to-r from-gold via-electric-pink to-electric-purple bg-clip-text text-transparent">
              {task.progress.target}
            </span>
          </div>
        ) : CardLucideIcon ? (
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={twMerge(
                'flex-center w-8 h-8 rounded-lg bg-gradient-to-br shadow-md shadow-black/30 shrink-0',
                cardLucideGradient ?? 'from-gold to-orange',
                isLocked && 'opacity-60'
              )}
            >
              <CardLucideIcon size={16} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-extrabold leading-none bg-gradient-to-r from-gold via-electric-pink to-electric-purple bg-clip-text text-transparent">
              {task.progress.target}
            </span>
          </div>
        ) : (
          <div className="flex-center w-7 h-7 rounded-lg bg-gradient-to-br from-gold to-orange shadow-md shadow-black/30">
            <Trophy size={14} className="text-white" />
          </div>
        )}
        {isCompleted ? (
          <div className="flex-center w-6 h-6 rounded-full bg-success/20 shrink-0">
            <Check size={12} className="text-success" />
          </div>
        ) : isLocked ? (
          <div className="flex-center w-6 h-6 rounded-full bg-white/5 shrink-0">
            <Lock size={12} className="text-white/40" />
          </div>
        ) : isReady ? (
          <ClaimableDot label={t('something to claim')} className="mt-1 me-1" />
        ) : hasDestination ? (
          <div className="flex-center w-6 h-6 rounded-full bg-electric-pink/15 border border-electric-pink/30 shrink-0">
            <ChevronRight size={12} className="text-electric-pink" strokeWidth={2.5} />
          </div>
        ) : null}
      </div>

      {/* Middle block — number/unit + subtitle. `my-auto` splits the card's
          spare height evenly above and below it, so sparse cards (no progress
          bar, no CTA) read as centered instead of leaving one big hole between
          the subtitle and the bottom-pinned rewards. */}
      <div className="my-auto flex flex-col gap-2">
        {cardIconType || cardMedalType || cardImageSrc || CardLucideIcon ? (
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">
            {unit}
          </span>
        ) : NumberIcon ? (
          <div className="flex flex-col gap-0.5">
            <span className="text-2xl font-extrabold leading-none bg-gradient-to-r from-gold via-electric-pink to-electric-purple bg-clip-text text-transparent">
              {task.progress.target}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">
              {unit}
            </span>
          </div>
        ) : (
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold leading-none bg-gradient-to-r from-gold via-electric-pink to-electric-purple bg-clip-text text-transparent">
              {task.progress.target}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">
              {unit}
            </span>
          </div>
        )}

        {task.subtitle && (
          <p className="text-[10px] text-white/50 leading-tight line-clamp-2">
            {localized(task.subtitle)}
          </p>
        )}
      </div>

      {/* Rewards */}
      <TaskRewardRow
        rewards={task.rewards}
        tier={task.tier}
        size="sm"
        className="flex-wrap gap-1"
      />

      {/* Progress */}
      {showProgress && (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center justify-between text-[10px] text-white/50 font-semibold tabular-nums">
            <span>
              {task.progress.current}/{task.progress.target}
            </span>
            <span className="text-white/40">{pct}%</span>
          </div>
          <Progress percentage={pct} className="h-1" classNames={{ bar: 'bg-pink-gradient' }} />
        </div>
      )}

      {/* CTA */}
      {isReady && (
        <Button
          className="w-full rounded-xl py-2 text-xs font-bold flex-center gap-1 animate-task-pulse"
          onClick={e => {
            e.stopPropagation();
            onClaim(task);
          }}
        >
          <Gift size={12} />
          {t('claim')}
        </Button>
      )}
      {isCompleted && (
        <div className="w-full rounded-xl py-1.5 text-[10px] font-bold uppercase tracking-wider flex-center gap-1 bg-success/15 text-success">
          <Check size={11} />
          {t('claimed')}
        </div>
      )}
      {isLocked && (
        <div className="w-full rounded-xl py-1.5 text-[10px] font-bold uppercase tracking-wider flex-center gap-1 bg-electric-pink/15 border border-electric-pink/30 text-electric-pink">
          <TrendingUp size={11} strokeWidth={2.5} />
          {t('locked')}
        </div>
      )}
    </div>
  );
}
