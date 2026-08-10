'use client';

import { type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ChevronRight, Gift, Lock, Pin, PinOff } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useLocalized } from '@/hooks/useLocalized';
import { Button } from '@/components/shared/buttons/Button';
import { Progress } from '@/components/shared/Progress';
import { TaskRarity, TaskStatus } from '@/types/enums/tasks.enums';
import type { Task } from '@/types/interfaces/tasks.interfaces';
import { type Route } from '@/constants/routes';
import { openExternalUrl } from '@/lib/telegram/telegram';
import { TaskCategoryIcon } from './TaskCategoryIcon';
import { TaskRewardRow } from './TaskRewardRow';
import { SectionShine } from './SectionShine';
import { ClaimableDot } from '@/components/shared/badges/ClaimableDot';
import { isTaskClaimable } from '@/utils/global/tasks-claimable.utils';

const RARITY_FRAME: Record<TaskRarity, string> = {
  [TaskRarity.BRONZE]: 'task-card-default',
  [TaskRarity.SILVER]: 'task-card-rarity-rare',
  [TaskRarity.GOLD]: 'task-card-rarity-epic',
  [TaskRarity.PLATINUM]: 'task-card-rarity-legendary',
};

export interface TaskItemCardCompactProps {
  task: Task;
  onClaim: (task: Task) => void;
  highlightToken?: number | null;
  className?: string;
  style?: CSSProperties;
  pinned?: boolean;
  pinDisabled?: boolean;
  onTogglePin?: (taskId: string) => void;
}

/**
 * Vertical, two-per-row compact card for once-tab listings.
 * Stripped to essentials so it reads cleanly at half width:
 *   header (icon + status badge) → title → subtitle → reward chips → progress → CTA.
 */
export function TaskItemCardCompact({
  task,
  onClaim,
  highlightToken,
  className,
  style,
  pinned = false,
  pinDisabled = false,
  onTogglePin,
}: TaskItemCardCompactProps) {
  const t = useAppTranslations();
  const localized = useLocalized();
  const router = useRouter();

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

  const handleClick = () => {
    if (isLocked || isCompleted) return;
    if (isReady) {
      onClaim(task);
      return;
    }
    if (task.deeplink) {
      router.push(task.deeplink as Route);
      return;
    }
    if (task.externalLink) {
      openExternalUrl(task.externalLink);
    }
  };

  return (
    <div
      style={style}
      className={twMerge(
        'relative flex flex-col gap-2 rounded-2xl bg-background-overlay p-3 overflow-hidden min-h-[180px] transition-all',
        RARITY_FRAME[task.rarity],
        isLocked && 'opacity-60',
        isCompleted && 'opacity-80',
        !isLocked && !isCompleted && 'cursor-pointer active:scale-[0.98]',
        className
      )}
      onClick={handleClick}
      role="button"
      aria-disabled={isLocked || isCompleted}
    >
      <SectionShine token={highlightToken ?? null} />

      {/* Header: category icon + (pin button) + status / navigate badge */}
      <div className="relative flex items-start justify-between">
        <div className="relative shrink-0">
          <TaskCategoryIcon category={task.category} size={16} />
          {isTaskClaimable(task) && (
            <ClaimableDot
              label={t('something to claim')}
              size="sm"
              className="absolute -top-0.5 -right-0.5"
            />
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {onTogglePin && !isCompleted && !isLocked && !isReady && (
            <button
              type="button"
              aria-label={pinned ? t('unpin') : t('pin')}
              aria-pressed={pinned}
              disabled={pinDisabled}
              onClick={e => {
                e.stopPropagation();
                if (pinDisabled) return;
                onTogglePin(task.id);
              }}
              className={twMerge(
                'flex-center w-6 h-6 rounded-full transition-all active:scale-90',
                pinned
                  ? 'bg-electric-pink/20 text-electric-pink hover:bg-electric-pink/30'
                  : pinDisabled
                    ? 'bg-white/[0.04] text-white/20 cursor-not-allowed'
                    : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70'
              )}
            >
              {pinned ? (
                <PinOff size={12} strokeWidth={2.5} />
              ) : (
                <Pin size={12} strokeWidth={2.5} />
              )}
            </button>
          )}
          {isCompleted && (
            <div className="flex-center w-6 h-6 rounded-full bg-success/20">
              <Check size={12} className="text-success" />
            </div>
          )}
          {isLocked && (
            <div className="flex-center w-6 h-6 rounded-full bg-white/5">
              <Lock size={12} className="text-white/40" />
            </div>
          )}
          {canNavigate && (
            <div className="flex-center w-6 h-6 rounded-full bg-electric-pink/15 border border-electric-pink/30">
              <ChevronRight size={12} className="text-electric-pink" strokeWidth={2.5} />
            </div>
          )}
        </div>
      </div>

      {/* Title + subtitle */}
      <div className="flex flex-col gap-1">
        <h4 className="text-[13px] font-extrabold leading-snug line-clamp-2 break-words">
          {localized(task.title)}
        </h4>
        {task.subtitle && (
          <p className="text-[10px] text-white/50 leading-tight line-clamp-2">
            {localized(task.subtitle)}
          </p>
        )}
      </div>

      {/* Rewards (centered, wrapped) */}
      <TaskRewardRow
        rewards={task.rewards}
        tier={task.tier}
        size="sm"
        className="flex-wrap justify-start gap-1 mt-auto"
      />

      {/* Progress (if multi-step) */}
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

      {/* CTA — only shown when ready-to-claim; otherwise the whole card is clickable */}
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
    </div>
  );
}
