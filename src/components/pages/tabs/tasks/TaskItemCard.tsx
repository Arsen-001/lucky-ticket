'use client';

import { type CSSProperties, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Check,
  ChevronDown,
  ChevronRight,
  Circle,
  Clock3,
  Gift,
  Lock,
  TrendingUp,
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useCountDown } from '@/hooks/useCountDown';
import { Progress } from '@/components/shared/Progress';
import { Button } from '@/components/shared/buttons/Button';
import { Medal, type MedalType } from '@/components/shared/icons/Medal';
import { TaskCategory, TaskRarity, TaskStatus } from '@/types/enums/tasks.enums';
import type { Task, TaskSubStep } from '@/types/interfaces/tasks.interfaces';
import { routes, type Route } from '@/constants/routes';
import { TaskCategoryIcon } from './TaskCategoryIcon';
import { TaskRewardRow } from './TaskRewardRow';
import { TaskRewardBadge } from './TaskRewardBadge';

export interface TaskItemCardProps {
  task: Task;
  onClaim: (task: Task, bundleSubStepIds?: string[]) => void;
  onClaimSubStep?: (task: Task, step: TaskSubStep) => void;
  expanded?: boolean;
  onToggleExpanded?: () => void;
  className?: string;
  style?: CSSProperties;
}

const RARITY_FRAME: Record<TaskRarity, string> = {
  [TaskRarity.COMMON]: 'task-card-default',
  [TaskRarity.RARE]: 'task-card-rarity-rare',
  [TaskRarity.EPIC]: 'task-card-rarity-epic',
  [TaskRarity.LEGENDARY]: 'task-card-rarity-legendary',
};

const TIER_FRAME: Record<string, string> = {
  bronze: 'task-card-tier-bronze',
  silver: 'task-card-tier-silver',
  gold: 'task-card-tier-gold',
  platinum: 'task-card-tier-platinum',
  diamond: 'task-card-tier-diamond',
  all: 'task-card-tier-all',
};

function SubStepRow({
  step,
  claimed,
  onClaim,
  onNavigate,
}: {
  step: TaskSubStep;
  claimed: boolean;
  onClaim: () => void;
  onNavigate?: () => void;
}) {
  const t = useAppTranslations();
  const isClaimable = step.completed && !claimed;
  const isFullyClaimed = step.completed && claimed;
  const isPending = !step.completed;
  const canNavigate = isPending && !!onNavigate;
  const rowAction = isClaimable ? onClaim : canNavigate ? onNavigate : undefined;
  const isInteractive = !!rowAction;

  return (
    <div
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={
        rowAction
          ? e => {
              e.stopPropagation();
              rowAction();
            }
          : undefined
      }
      onKeyDown={
        rowAction
          ? e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                rowAction();
              }
            }
          : undefined
      }
      className={twMerge(
        'flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 transition-all',
        isClaimable &&
          'bg-pink/10 border border-pink/20 cursor-pointer active:scale-[0.99] hover:bg-pink/15',
        isFullyClaimed && 'bg-success/10',
        isPending && 'bg-white/5',
        canNavigate && 'cursor-pointer active:scale-[0.99] hover:bg-white/10'
      )}
    >
      {isFullyClaimed ? (
        <div className="flex-center w-5 h-5 rounded-full bg-success/30 shrink-0">
          <Check size={11} className="text-success" />
        </div>
      ) : isClaimable ? (
        <div className="flex-center w-5 h-5 rounded-full bg-pink/30 shrink-0 animate-task-pulse">
          <Gift size={11} className="text-electric-pink" />
        </div>
      ) : (
        <Circle size={18} className="text-white/30 shrink-0" />
      )}
      {step.label ? (
        <span
          className={twMerge(
            'text-xs font-semibold flex-1 truncate',
            isFullyClaimed && 'text-white/50',
            isClaimable && 'text-white',
            !step.completed && 'text-white/60'
          )}
        >
          {step.label}
        </span>
      ) : (
        <div className="flex-1" />
      )}
      {step.reward && !isFullyClaimed && <TaskRewardBadge reward={step.reward} size="sm" />}
      {isPending && onNavigate && (
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            onNavigate();
          }}
          aria-label={t('open')}
          className="flex-center w-6 h-6 rounded-full bg-electric-pink/15 border border-electric-pink/30 hover:bg-electric-pink/25 transition-colors shrink-0"
        >
          <ChevronRight size={12} className="text-electric-pink" strokeWidth={2.5} />
        </button>
      )}
      {isClaimable && (
        <span className="rounded-full bg-pink-gradient px-2.5 py-1 text-[10px] font-bold text-white shrink-0 pointer-events-none">
          {t('claim')}
        </span>
      )}
      {isFullyClaimed && (
        <span className="text-[10px] font-semibold text-success uppercase tracking-wider shrink-0">
          {t('claimed')}
        </span>
      )}
    </div>
  );
}

export function TaskItemCard({
  task,
  onClaim,
  onClaimSubStep,
  expanded: expandedProp,
  onToggleExpanded,
  className,
  style,
}: TaskItemCardProps) {
  const t = useAppTranslations();
  const router = useRouter();
  const { leftTime, expired } = useCountDown(task.resetAt);

  const isReady = task.status === TaskStatus.READY_TO_CLAIM;
  const isLocked = task.status === TaskStatus.LOCKED;
  const isCompleted = task.status === TaskStatus.COMPLETED;
  const isInProgress = task.status === TaskStatus.IN_PROGRESS;
  const showProgress = task.progress.target > 1;
  const pct =
    task.progress.target > 0
      ? Math.min(100, Math.round((task.progress.current / task.progress.target) * 100))
      : 0;

  const hasSubSteps = !!task.subSteps && task.subSteps.length > 0;
  const completedSteps = task.subSteps?.filter(s => s.completed).length ?? 0;
  const totalSteps = task.subSteps?.length ?? 0;
  const allStepsDone = hasSubSteps && completedSteps === totalSteps;

  const [internalExpanded, setInternalExpanded] = useState(false);
  const isControlled = expandedProp !== undefined;
  const expanded = isControlled ? expandedProp : internalExpanded;
  const setExpanded = (next: boolean | ((prev: boolean) => boolean)) => {
    if (isControlled) {
      const nextValue = typeof next === 'function' ? next(expanded) : next;
      if (nextValue !== expanded) onToggleExpanded?.();
    } else {
      setInternalExpanded(next);
    }
  };
  const [locallyClaimed, setLocallyClaimed] = useState<Record<string, boolean>>({});
  const [isSimulating, setIsSimulating] = useState(false);

  const isStepClaimed = (step: TaskSubStep) => locallyClaimed[step.id] ?? !!step.claimed;
  const hasClaimableSubStep = task.subSteps?.some(s => s.completed && !isStepClaimed(s)) ?? false;

  const handleClaimSubStep = (step: TaskSubStep) => {
    setLocallyClaimed(prev => ({ ...prev, [step.id]: true }));
    onClaimSubStep?.(task, step);
  };

  const handleClaimMain = async () => {
    if (isSimulating) return;
    const unclaimed = (task.subSteps ?? []).filter(s => s.completed && !isStepClaimed(s));

    if (unclaimed.length > 1) {
      // Run a brief simulation: keep dropdown open, mark each substep claimed
      // in sequence so the user sees rewards being collected one by one.
      setIsSimulating(true);
      setExpanded(true);
      for (const step of unclaimed) {
        await new Promise(res => setTimeout(res, 280));
        setLocallyClaimed(prev => ({ ...prev, [step.id]: true }));
      }
      await new Promise(res => setTimeout(res, 360));
      setIsSimulating(false);
      setExpanded(false);
      onClaim(
        task,
        unclaimed.map(s => s.id)
      );
      return;
    }

    if (unclaimed.length === 1) {
      setLocallyClaimed(prev => ({ ...prev, [unclaimed[0].id]: true }));
    }
    setExpanded(false);
    onClaim(task, unclaimed.length ? unclaimed.map(s => s.id) : undefined);
  };

  const isLockedTournament = isLocked && task.category === TaskCategory.TOURNAMENTS;

  const handleCardClick = () => {
    if (isLockedTournament) {
      router.push(routes.market('status'));
      return;
    }
    if (isLocked) return;
    // For tasks with subSteps: tap toggles dropdown — even when claim-ready or completed,
    // so the user can re-open and review what was earned.
    if (hasSubSteps) {
      setExpanded(prev => !prev);
      return;
    }
    if (isReady) {
      handleClaimMain();
      return;
    }
    if (isCompleted) return;
    if (task.deeplink) {
      router.push(task.deeplink as Route);
      return;
    }
    if (task.externalLink) {
      window.open(task.externalLink, '_blank', 'noopener,noreferrer');
    }
  };

  const handleStepNavigate = () => {
    if (task.deeplink) router.push(task.deeplink as Route);
    else if (task.externalLink) window.open(task.externalLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      style={style}
      className={twMerge(
        'relative rounded-2xl transition-all bg-background-overlay overflow-hidden min-h-[88px]',
        isCompleted
          ? 'task-card-completed'
          : isLockedTournament
            ? 'task-card-inactive'
            : task.tier
              ? TIER_FRAME[task.tier]
              : RARITY_FRAME[task.rarity],
        isLocked && !isLockedTournament && 'opacity-60',
        isCompleted && 'opacity-80',
        className
      )}
    >
      {/* countdown — absolute top-right so the title gets the full row width */}
      {task.resetAt && !isCompleted && !isLocked && !expired && (
        <span className="pointer-events-none absolute top-2 right-2.5 z-[3] flex items-center gap-1 text-[10px] text-white/40 font-medium tabular-nums">
          <Clock3 size={10} />
          {leftTime}
        </span>
      )}

      {/* main row */}
      <div
        className={twMerge(
          'relative z-[2] flex items-center gap-3 px-3 py-3 min-h-[88px]',
          (!isLocked || isLockedTournament) && 'cursor-pointer active:scale-[0.99]'
        )}
        onClick={handleCardClick}
        role="button"
        aria-disabled={isLocked && !isLockedTournament}
        aria-expanded={hasSubSteps ? expanded : undefined}
      >
        {/* Icon */}
        <div className="relative shrink-0 w-9 h-9 flex-center">
          {task.category === TaskCategory.TOURNAMENTS && task.tier ? (
            <Medal
              type={(task.tier === 'all' ? 'gold' : task.tier) as MedalType}
              width={36}
              height={36}
            />
          ) : (
            <TaskCategoryIcon category={task.category} size={18} />
          )}
          {isLocked && (
            <div className="absolute -bottom-1 -right-1 flex-center w-5 h-5 rounded-full bg-background border border-white/10">
              <Lock size={10} className="text-white/60" />
            </div>
          )}
          {isCompleted && (
            <div className="absolute -bottom-1 -right-1 flex-center w-5 h-5 rounded-full bg-background border border-success">
              <Check size={10} className="text-success" />
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <h4
            className={twMerge(
              'text-[15px] font-extrabold leading-snug',
              expanded ? 'whitespace-normal break-words' : 'truncate w-max max-w-full'
            )}
          >
            {task.title}
          </h4>

          {(task.subtitle || task.unlockHint) && (
            <p className="text-[11px] text-white/50 line-clamp-1">
              {isLocked && task.unlockHint ? task.unlockHint : task.subtitle}
            </p>
          )}

          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <TaskRewardRow rewards={task.rewards} size="sm" />
            {showProgress && !isCompleted && !isLocked && (
              <span className="text-[11px] text-white/50 font-semibold tabular-nums ml-auto">
                {task.progress.current}/{task.progress.target}
              </span>
            )}
          </div>

          {showProgress && !isCompleted && !isLocked && (
            <Progress
              percentage={pct}
              className="h-1 mt-1"
              classNames={{ bar: 'bg-pink-gradient' }}
            />
          )}
        </div>

        {/* CTA */}
        <div className="shrink-0 flex items-center">
          {(isReady || allStepsDone) && !isCompleted ? (
            <Button
              className="rounded-full px-3 py-2 text-xs font-bold animate-task-pulse flex-center gap-1 disabled:opacity-70"
              disabled={isSimulating}
              onClick={e => {
                e.stopPropagation();
                handleClaimMain();
              }}
            >
              <Gift size={12} />
              {isSimulating ? t('claiming') : t('claim')}
            </Button>
          ) : isLocked ? (
            isLockedTournament ? (
              <div className="flex-center gap-1 rounded-full bg-pink-gradient px-3 py-2.5 shadow-lg shadow-electric-pink/50 animate-task-pulse">
                <TrendingUp size={16} className="text-white" strokeWidth={2.5} />
                <ChevronRight size={14} className="text-white" strokeWidth={2.5} />
              </div>
            ) : (
              <div className="flex-center w-9 h-9 rounded-full bg-white/5">
                <Lock size={14} className="text-white/40" />
              </div>
            )
          ) : isCompleted ? (
            <div className="flex-center w-9 h-9 rounded-full bg-success/20">
              <Check size={16} className="text-success" />
            </div>
          ) : hasSubSteps ? (
            <div className="relative">
              <div
                className={twMerge(
                  'flex-center w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 transition-all',
                  expanded && 'rotate-180'
                )}
              >
                <ChevronDown size={16} className="text-white/60" />
              </div>
              {hasClaimableSubStep && (
                <span className="pointer-events-none absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                  <span className="absolute inset-0 rounded-full bg-electric-pink animate-ping opacity-75" />
                  <span className="relative w-2.5 h-2.5 rounded-full bg-electric-pink border border-background-overlay" />
                </span>
              )}
            </div>
          ) : (
            isInProgress && (
              <div className="flex-center w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                <ChevronRight size={16} className="text-white/60" />
              </div>
            )
          )}
        </div>
      </div>

      {/* substeps accordion */}
      {hasSubSteps && expanded && !isLocked && (
        <div className="border-t border-white/5 px-3 py-3 flex flex-col gap-1.5 bg-black/15">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase tracking-wider font-bold text-white/40">
              {t('substeps progress', { completed: completedSteps, total: totalSteps })}
            </span>
            {!isCompleted && (
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  handleStepNavigate();
                }}
                className="text-[11px] font-semibold text-electric-pink hover:underline flex items-center gap-1"
              >
                {t('open')}
                <ChevronRight size={12} />
              </button>
            )}
          </div>
          {task.subSteps
            ?.slice()
            .sort((a, b) => {
              // Sort order: claimable (completed && !claimed) first, then in-progress, then claimed
              const stepRank = (s: TaskSubStep) => {
                const claimed = isStepClaimed(s);
                if (s.completed && !claimed) return 0;
                if (!s.completed) return 1;
                return 2;
              };
              return stepRank(a) - stepRank(b);
            })
            .map(step => (
              <SubStepRow
                key={step.id}
                step={step}
                claimed={isStepClaimed(step)}
                onClaim={() => handleClaimSubStep(step)}
                onNavigate={task.deeplink || task.externalLink ? handleStepNavigate : undefined}
              />
            ))}

          {/* Main bonus claim button — always present, gated by allStepsDone */}
          <div className="mt-2 pt-2 border-t border-white/5 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] uppercase tracking-wider font-bold text-white/40">
                {t('main bonus')}
              </span>
              <TaskRewardRow rewards={task.rewards} size="sm" />
            </div>
            {isCompleted ? (
              <div className="w-full rounded-xl py-2.5 text-sm font-bold flex-center gap-1.5 bg-success/15 text-success">
                <Check size={14} />
                {t('claimed')}
              </div>
            ) : (
              <button
                type="button"
                disabled={!allStepsDone || isSimulating}
                onClick={e => {
                  e.stopPropagation();
                  if (allStepsDone && !isSimulating) handleClaimMain();
                }}
                className={twMerge(
                  'w-full rounded-xl py-2.5 text-sm font-bold flex-center gap-1.5 transition-all',
                  allStepsDone
                    ? 'bg-pink-gradient text-white animate-task-pulse active:scale-95 shadow-lg shadow-electric-pink/30'
                    : 'bg-white/5 text-white/40 cursor-not-allowed',
                  isSimulating && 'opacity-70 cursor-wait'
                )}
              >
                <Gift size={14} />
                {isSimulating
                  ? t('claiming')
                  : allStepsDone
                    ? t('claim main bonus')
                    : t('claim locked steps remaining', {
                        remaining: totalSteps - completedSteps,
                      })}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
