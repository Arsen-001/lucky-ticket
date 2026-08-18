'use client';

import { type CSSProperties, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Check, ChevronDown, ChevronRight, Clock3, Gift, Lock } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useLocalized } from '@/hooks/useLocalized';
import { useCountDown } from '@/hooks/useCountDown';
import { Button } from '@/components/shared/buttons/Button';
import { TaskCategory, TaskStatus } from '@/types/enums/tasks.enums';
import { resolveTaskSocialBrand } from '@/utils/pages/task-social.utils';
import type { Task } from '@/types/interfaces/tasks.interfaces';
import { useTaskNavigate } from '@/hooks/useTaskNavigate';
import { taskHasDestination } from '@/utils/pages/task-destination.utils';
import { TaskCategoryIcon } from './TaskCategoryIcon';
import { TaskRewardRow } from './TaskRewardRow';
import { SectionShine } from './SectionShine';
import { ClaimableDot } from '@/components/shared/badges/ClaimableDot';
import { isTaskClaimable } from '@/utils/global/tasks-claimable.utils';

// useLayoutEffect warns during SSR; fall back to useEffect on the server. The
// row only ever animates in response to a client-side tap, so this is safe.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export interface TaskItemRowProps {
  task: Task;
  onClaim: (task: Task) => void;
  highlightToken?: number | null;
  className?: string;
  style?: CSSProperties;
}

/**
 * Single-line, full-width task row — icon · title · reward · CTA, with a
 * hairline progress fill along the bottom edge for multi-step tasks. Used by
 * lightweight categories (Social / Profile) where the full card and the
 * vertical compact tile are both too heavy.
 *
 * Tapping the row toggles an expanded state that un-truncates the title and
 * reveals the subtitle / unlock hint, so the full copy is always readable even
 * though the collapsed row stays compact. Navigation (deeplink / external link)
 * lives on the explicit chevron button, so a tap reads instead of leaving.
 */
export function TaskItemRow({ task, onClaim, highlightToken, className, style }: TaskItemRowProps) {
  const t = useAppTranslations();
  const localized = useLocalized();
  const navigateToTask = useTaskNavigate();
  const { leftTime, expired } = useCountDown(task.resetAt);

  const [expanded, setExpanded] = useState(false);

  const isReady = task.status === TaskStatus.READY_TO_CLAIM;
  const isLocked = task.status === TaskStatus.LOCKED;
  const isCompleted = task.status === TaskStatus.COMPLETED;
  // Resolved rather than read off the row: a catalog task can carry no
  // deeplink, or a bare `/tasks` — the screen it is already on.
  const hasLink = taskHasDestination(task);
  const socialBrand =
    task.category === TaskCategory.SOCIAL ? resolveTaskSocialBrand(task.externalLink) : null;
  const canNavigate = hasLink && !isLocked && !isCompleted && !isReady;
  const showProgress = task.progress.target > 1 && !isCompleted && !isLocked;
  const pct =
    task.progress.target > 0
      ? Math.min(100, Math.round((task.progress.current / task.progress.target) * 100))
      : 0;

  // Full copy that the collapsed row can't show: the subtitle (or, when locked,
  // the reason it's locked).
  const detailText = localized(isLocked && task.unlockHint ? task.unlockHint : task.subtitle);
  const hasDetail = !!detailText;

  // The collapsed row truncates the title to one line — detect when it's
  // actually clipped so the row only offers a tap-to-open affordance when there
  // is something hidden to reveal (a clipped title or a subtitle). Measured only
  // while collapsed; `|| expanded` keeps an open row interactive so it can
  // always be collapsed again even if a resize re-measures it as un-clipped.
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);
  useEffect(() => {
    const el = titleRef.current;
    if (!el || expanded) return;
    const measure = () => setIsTruncated(el.scrollWidth > el.clientWidth + 1);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [expanded, task.title]);

  // A tap only "opens" something when there's hidden copy to reveal. Ready rows
  // claim on tap, so they never expand — and a row that leads somewhere goes
  // there instead of expanding (see `handleClick`).
  const isExpandable = !isReady && !canNavigate && (hasDetail || isTruncated || expanded);
  const isInteractive = isReady || canNavigate || isExpandable;

  // Smoothly grow/shrink the row between its collapsed and expanded heights.
  // `height: auto` can't be transitioned in CSS, so FLIP it: measure the height
  // the body is leaving from (captures a mid-flight value on a fast re-tap) and
  // the new natural height, pin the old one, then transition to the new one and
  // release back to auto so later reflows stay natural. `overflow-hidden` on the
  // body clips the not-yet-revealed lines while the height animates.
  const bodyRef = useRef<HTMLDivElement>(null);
  const didMountRef = useRef(false);
  useIsomorphicLayoutEffect(() => {
    const el = bodyRef.current;
    if (!el) return;

    const from = el.getBoundingClientRect().height;
    el.style.transition = 'none';
    el.style.height = 'auto';
    const to = el.scrollHeight;

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!didMountRef.current || reduceMotion || Math.abs(from - to) < 1) {
      didMountRef.current = true;
      el.style.height = '';
      el.style.transition = '';
      return;
    }

    el.style.height = `${from}px`;
    void el.offsetHeight; // reflow so the browser registers the start height
    el.style.transition = 'height 200ms ease-out';
    el.style.height = `${to}px`;

    let settled = false;
    const settle = () => {
      if (settled) return;
      settled = true;
      el.style.transition = '';
      el.style.height = '';
      el.removeEventListener('transitionend', onEnd);
      window.clearTimeout(timer);
    };
    const onEnd = (e: TransitionEvent) => {
      if (e.target === el && e.propertyName === 'height') settle();
    };
    el.addEventListener('transitionend', onEnd);
    const timer = window.setTimeout(settle, 280); // fallback if transitionend is missed

    return () => {
      el.removeEventListener('transitionend', onEnd);
      window.clearTimeout(timer);
    };
  }, [expanded]);

  const navigate = () => {
    navigateToTask(task);
  };

  const handleClick = () => {
    if (isReady) {
      onClaim(task);
      return;
    }
    // A row that leads somewhere IS the link — the whole strip opens it, not
    // just the 28px chevron at its edge. The daily check-in is the case that
    // made this obvious: its one job is "go subscribe to the channel", and a
    // tap on the card did nothing but reveal a subtitle.
    if (canNavigate) {
      navigate();
      return;
    }
    if (isExpandable) setExpanded(prev => !prev);
  };

  return (
    <div
      style={style}
      className={twMerge(
        'relative flex items-center gap-2.5 rounded-2xl bg-background-overlay px-3 py-3 overflow-hidden transition-all',
        // A plain hairline, like the cards above: the gradient rarity frames
        // outlined every row of the list in a different colour.
        'border border-white/8',
        isLocked && 'opacity-60',
        isCompleted && 'opacity-80',
        isInteractive && 'cursor-pointer active:scale-[0.99]',
        className
      )}
      onClick={isInteractive ? handleClick : undefined}
      role={isInteractive ? 'button' : undefined}
      aria-disabled={!isInteractive}
      aria-expanded={isExpandable ? expanded : undefined}
    >
      <SectionShine token={highlightToken ?? null} />

      {/* The platform, not the category: every social row used to carry the
          same sparkle glyph, so Telegram, X, Discord and YouTube were
          indistinguishable until you read the title. The link was in the data
          all along — this row simply never looked at it. */}
      {/* The icon carries the «есть что забрать» dot, same as the cards above —
          this row's own claim button is at the far end of a wide strip. */}
      <div className="relative shrink-0">
        {socialBrand ? (
          <div
            className={twMerge(
              'flex-center size-9 rounded-xl bg-gradient-to-br shadow-md shadow-black/20',
              socialBrand.gradient
            )}
          >
            <socialBrand.icon size={18} className="text-white" strokeWidth={2.4} />
          </div>
        ) : (
          <TaskCategoryIcon category={task.category} size={18} />
        )}
        {isTaskClaimable(task) && (
          <ClaimableDot
            label={t('something to claim')}
            size="sm"
            className="absolute -top-0.5 -right-0.5"
          />
        )}
      </div>

      <div ref={bodyRef} className="flex min-w-0 flex-1 flex-col gap-0.5 overflow-hidden">
        <h4
          ref={titleRef}
          className={twMerge(
            'text-[13px] font-extrabold leading-snug',
            // Two lines collapsed instead of one: the reward chips used to sit
            // in the headline's way, so «Follow our Telegram channel» became
            // «Follow our Telegra…» — and the more a task paid, the more chips
            // it had, the shorter its name got.
            expanded ? 'whitespace-normal break-words' : 'line-clamp-2'
          )}
        >
          {localized(task.title)}
        </h4>
        {expanded && hasDetail && (
          <p className="text-[11px] leading-snug break-words whitespace-normal text-white/50">
            {detailText}
          </p>
        )}
      </div>

      {/* Rewards, the reset countdown and the progress figure stack to the
          right rather than competing with the title for the same line.

          Capped at half the strip, and the chips wrap inside it. Uncapped,
          `shrink-0` let the column take whatever its chips wanted: a task
          paying LC + ticket + star + AP swallowed the row and left the title
          ~40px — «Boost the channel» rendered as «Boos th…». Wrapping to two
          short lines costs a few pixels of height and keeps every chip
          visible, which truncating them would not. */}
      <div className="flex max-w-[50%] shrink-0 flex-col items-end gap-1">
        <TaskRewardRow
          rewards={task.rewards}
          tier={task.tier}
          size="sm"
          className="justify-end gap-1"
        />
        {((task.resetAt && !isLocked && !expired) || showProgress) && (
          <span className="flex items-center gap-2 text-[10px] leading-none font-medium text-white/40 tabular-nums">
            {task.resetAt && !isLocked && !expired && (
              <span className="pointer-events-none inline-flex items-center gap-1">
                <Clock3 size={10} />
                {leftTime}
              </span>
            )}
            {showProgress && (
              <span className="font-semibold text-white/50">
                {task.progress.current}/{task.progress.target}
              </span>
            )}
          </span>
        )}
      </div>

      {isReady ? (
        <Button
          className="flex-center shrink-0 gap-1 rounded-xl px-3 py-1.5 text-xs font-bold animate-task-pulse"
          onClick={e => {
            e.stopPropagation();
            onClaim(task);
          }}
        >
          <Gift size={12} />
          {t('claim')}
        </Button>
      ) : isCompleted ? (
        <div className="flex-center h-7 w-7 shrink-0 rounded-full bg-success/20">
          <Check size={13} className="text-success" />
        </div>
      ) : isLocked ? (
        <div className="flex-center h-7 w-7 shrink-0 rounded-full bg-white/5">
          <Lock size={13} className="text-white/40" />
        </div>
      ) : canNavigate ? (
        <button
          type="button"
          aria-label={t('open')}
          onClick={e => {
            e.stopPropagation();
            navigate();
          }}
          // The circle stays 28px, but the finger gets 44px (`tap-target`).
          // At 28px this was a miss more often than a hit, which reads exactly
          // like a dead button.
          className="tap-target flex-center border-electric-pink/30 bg-electric-pink/15 hover:bg-electric-pink/25 relative h-7 w-7 shrink-0 rounded-full border transition-colors active:scale-95"
        >
          <ChevronRight size={13} className="text-electric-pink" strokeWidth={2.5} />
        </button>
      ) : isExpandable ? (
        <div
          className={twMerge(
            'flex-center h-7 w-7 shrink-0 rounded-full bg-white/5 transition-transform',
            expanded && 'rotate-180'
          )}
        >
          <ChevronDown size={13} className="text-white/40" />
        </div>
      ) : null}

      {showProgress && (
        <span
          aria-hidden
          className="bg-pink-gradient pointer-events-none absolute bottom-0 start-0 h-[3px]"
          style={{ width: `${pct}%` }}
        />
      )}
    </div>
  );
}
