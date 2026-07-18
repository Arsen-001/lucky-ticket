'use client';

import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ChevronDown, ChevronRight, Clock3, Gift, Lock } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useCountDown } from '@/hooks/useCountDown';
import { Button } from '@/components/shared/buttons/Button';
import { TaskRarity, TaskStatus } from '@/types/enums/tasks.enums';
import type { Task } from '@/types/interfaces/tasks.interfaces';
import { type Route } from '@/constants/routes';
import { TaskCategoryIcon } from './TaskCategoryIcon';
import { TaskRewardRow } from './TaskRewardRow';
import { SectionShine } from './SectionShine';

const RARITY_FRAME: Record<TaskRarity, string> = {
  [TaskRarity.BRONZE]: 'task-card-default',
  [TaskRarity.SILVER]: 'task-card-rarity-rare',
  [TaskRarity.GOLD]: 'task-card-rarity-epic',
  [TaskRarity.PLATINUM]: 'task-card-rarity-legendary',
};

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
  const router = useRouter();
  const { leftTime, expired } = useCountDown(task.resetAt);

  const [expanded, setExpanded] = useState(false);

  const isReady = task.status === TaskStatus.READY_TO_CLAIM;
  const isLocked = task.status === TaskStatus.LOCKED;
  const isCompleted = task.status === TaskStatus.COMPLETED;
  const hasLink = !!(task.deeplink || task.externalLink);
  const canNavigate = hasLink && !isLocked && !isCompleted && !isReady;
  const showProgress = task.progress.target > 1 && !isCompleted && !isLocked;
  const pct =
    task.progress.target > 0
      ? Math.min(100, Math.round((task.progress.current / task.progress.target) * 100))
      : 0;

  // Full copy that the collapsed row can't show: the subtitle (or, when locked,
  // the reason it's locked).
  const detailText = isLocked && task.unlockHint ? task.unlockHint : task.subtitle;
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
  // claim on tap, so they never expand.
  const isExpandable = !isReady && (hasDetail || isTruncated || expanded);
  const isInteractive = isReady || isExpandable;

  const navigate = () => {
    if (task.deeplink) {
      router.push(task.deeplink as Route);
      return;
    }
    if (task.externalLink) {
      window.open(task.externalLink, '_blank', 'noopener,noreferrer');
    }
  };

  const handleClick = () => {
    if (isReady) {
      onClaim(task);
      return;
    }
    if (isExpandable) setExpanded(prev => !prev);
  };

  return (
    <div
      style={style}
      className={twMerge(
        'relative flex items-center gap-2.5 rounded-2xl bg-background-overlay px-3 py-3 overflow-hidden transition-all',
        RARITY_FRAME[task.rarity],
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

      <TaskCategoryIcon category={task.category} size={16} />

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <h4
          ref={titleRef}
          className={twMerge(
            'text-[13px] font-extrabold leading-tight',
            expanded ? 'whitespace-normal break-words' : 'truncate'
          )}
        >
          {task.title}
        </h4>
        {expanded && hasDetail && (
          <p className="text-[11px] leading-snug text-white/50 whitespace-normal break-words">
            {detailText}
          </p>
        )}
      </div>

      {task.resetAt && !isLocked && !expired && (
        <span className="pointer-events-none flex shrink-0 items-center gap-1 text-[10px] font-medium text-white/40 tabular-nums">
          <Clock3 size={10} />
          {leftTime}
        </span>
      )}

      <TaskRewardRow rewards={task.rewards} size="sm" className="shrink-0 gap-1" />

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
          className="flex-center border-electric-pink/30 bg-electric-pink/15 hover:bg-electric-pink/25 h-7 w-7 shrink-0 rounded-full border transition-colors active:scale-95"
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
          className="bg-pink-gradient pointer-events-none absolute bottom-0 left-0 h-[3px]"
          style={{ width: `${pct}%` }}
        />
      )}
    </div>
  );
}
