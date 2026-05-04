'use client';

import { type CSSProperties, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  Gift,
  Hash,
  type LucideIcon,
  Lock,
  Pin,
  PinOff,
  Send,
  Share2,
  TrendingUp,
  Twitter,
  Youtube,
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useCountDown } from '@/hooks/useCountDown';
import { Progress } from '@/components/shared/Progress';
import { Button } from '@/components/shared/buttons/Button';
import { Medal, type MedalType } from '@/components/shared/icons/Medal';
import { formatCompact } from '@/utils/global/number.utils';
import { TaskCategory, TaskFrequency, TaskRarity, TaskStatus } from '@/types/enums/tasks.enums';
import type { Task, TaskSubStep } from '@/types/interfaces/tasks.interfaces';
import { routes, type Route } from '@/constants/routes';
import { TaskCategoryIcon } from './TaskCategoryIcon';
import { TaskRewardRow } from './TaskRewardRow';
import { SectionShine } from './SectionShine';
import { SubStepRow } from './SubStepRow';

export interface TaskItemCardProps {
  task: Task;
  onClaim: (task: Task, bundleSubStepIds?: string[]) => void;
  onClaimSubStep?: (task: Task, step: TaskSubStep) => void;
  expanded?: boolean;
  onToggleExpanded?: () => void;
  highlightToken?: number | null;
  className?: string;
  style?: CSSProperties;
  pinned?: boolean;
  pinDisabled?: boolean;
  onTogglePin?: (taskId: string) => void;
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

/** Detect social platform from a task's external link to pick the right icon + brand-colored frame. */
const SOCIAL_ICON_BY_HOST: { match: RegExp; icon: LucideIcon; gradient: string }[] = [
  { match: /(?:^|\.)t\.me$/i, icon: Send, gradient: 'from-teal to-electric-purple' },
  { match: /(?:^|\.)telegram\.(?:org|me)$/i, icon: Send, gradient: 'from-teal to-electric-purple' },
  { match: /(?:^|\.)x\.com$/i, icon: Twitter, gradient: 'from-white/30 to-white/10' },
  { match: /(?:^|\.)twitter\.com$/i, icon: Twitter, gradient: 'from-electric-purple to-pink' },
  {
    match: /(?:^|\.)discord\.(?:gg|com)$/i,
    icon: Hash,
    gradient: 'from-electric-purple to-diamond',
  },
  { match: /(?:^|\.)youtube\.com$/i, icon: Youtube, gradient: 'from-error to-pink' },
  { match: /(?:^|\.)youtu\.be$/i, icon: Youtube, gradient: 'from-error to-pink' },
];

const resolveSocialIcon = (externalLink?: string) => {
  if (!externalLink) return null;
  let host = '';
  try {
    host = new URL(externalLink).hostname.toLowerCase();
  } catch {
    return null;
  }
  for (const entry of SOCIAL_ICON_BY_HOST) {
    if (entry.match.test(host)) return entry;
  }
  // Fallback: anything else looks like a generic share action.
  return { icon: Share2, gradient: 'from-pink to-electric-pink' };
};

export function TaskItemCard({
  task,
  onClaim,
  onClaimSubStep,
  expanded: expandedProp,
  onToggleExpanded,
  highlightToken,
  className,
  style,
  pinned = false,
  pinDisabled = false,
  onTogglePin,
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
  // Reset locally-claimed substep flags when the task identity changes —
  // otherwise after a refetch the stale flags would persist and look claimed.
  useEffect(() => {
    setLocallyClaimed({});
  }, [task.id]);
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

  const handleClaimAllSubSteps = async () => {
    if (isSimulating) return;
    const unclaimed = (task.subSteps ?? []).filter(s => s.completed && !isStepClaimed(s));
    if (unclaimed.length < 2) return;
    // Local-only batch claim — fires per-substep callback; no main task claim.
    setIsSimulating(true);
    for (const step of unclaimed) {
      await new Promise(res => setTimeout(res, 220));
      setLocallyClaimed(prev => ({ ...prev, [step.id]: true }));
      onClaimSubStep?.(task, step);
    }
    await new Promise(res => setTimeout(res, 200));
    setIsSimulating(false);
  };

  const claimableCount = (task.subSteps ?? []).filter(s => s.completed && !isStepClaimed(s)).length;

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

  // Compact layout flag — applies only to ONCE-frequency tasks in selected
  // categories (Social, Achievements, Profile Status, Profile). Daily/weekly
  // tasks always render in the standard full-size row, even for these
  // categories, so they look consistent with other categories' weekly tasks.
  const isCompactRow =
    task.frequency === TaskFrequency.ONCE &&
    (task.category === TaskCategory.SOCIAL ||
      task.category === TaskCategory.ACHIEVEMENTS ||
      task.category === TaskCategory.PROFILE_STATUS ||
      task.category === TaskCategory.PROFILE);
  const showSubtitleInCompact =
    task.category === TaskCategory.ACHIEVEMENTS ||
    task.category === TaskCategory.PROFILE_STATUS ||
    task.category === TaskCategory.PROFILE;

  return (
    <div
      style={style}
      className={twMerge(
        'relative rounded-2xl transition-all bg-background-overlay overflow-hidden',
        isCompactRow ? (showSubtitleInCompact ? 'min-h-[68px]' : 'min-h-[60px]') : 'min-h-[88px]',
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
      <SectionShine token={highlightToken ?? null} />

      {/* Top-right cluster: countdown + pin button (pin hidden for ready-to-claim — they're already on top) */}
      {(task.resetAt && !isCompleted && !isLocked && !expired) ||
      (onTogglePin && !isCompleted && !isLocked && !isReady) ? (
        <div className="absolute top-1.5 right-1.5 z-[3] flex items-center gap-1.5">
          {task.resetAt && !isCompleted && !isLocked && !expired && (
            <span className="pointer-events-none flex items-center gap-1 text-[10px] text-white/40 font-medium tabular-nums">
              <Clock3 size={10} />
              {leftTime}
            </span>
          )}
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
        </div>
      ) : null}

      {/* main row */}
      <div
        className={twMerge(
          'relative z-[2] flex items-center gap-3',
          isCompactRow
            ? showSubtitleInCompact
              ? 'px-3 py-2 min-h-[68px] gap-2.5'
              : 'px-3 py-2 min-h-[60px] gap-2.5'
            : 'px-3 py-3 min-h-[88px]',
          (!isLocked || isLockedTournament) && 'cursor-pointer active:scale-[0.99]'
        )}
        onClick={handleCardClick}
        role="button"
        aria-disabled={isLocked && !isLockedTournament}
        aria-expanded={hasSubSteps ? expanded : undefined}
      >
        {/* Icon */}
        <div
          className={twMerge('relative shrink-0 flex-center', isCompactRow ? 'w-8 h-8' : 'w-9 h-9')}
        >
          {task.category === TaskCategory.TOURNAMENTS && task.tier ? (
            <Medal
              type={(task.tier === 'all' ? 'gold' : task.tier) as MedalType}
              width={36}
              height={36}
            />
          ) : task.category === TaskCategory.SOCIAL && resolveSocialIcon(task.externalLink) ? (
            (() => {
              const social = resolveSocialIcon(task.externalLink)!;
              const SocialIcon = social.icon;
              return (
                <div
                  className={twMerge(
                    'flex-center rounded-xl bg-gradient-to-br shadow-md shadow-black/20',
                    isCompactRow ? 'w-8 h-8' : 'w-9 h-9',
                    social.gradient
                  )}
                >
                  <SocialIcon
                    size={isCompactRow ? 16 : 18}
                    className="text-white"
                    strokeWidth={2.4}
                  />
                </div>
              );
            })()
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
        <div
          className={twMerge('flex-1 min-w-0 flex flex-col', isCompactRow ? 'gap-0.5' : 'gap-1')}
        >
          <h4
            className={twMerge(
              'font-extrabold leading-snug',
              isCompactRow ? 'text-sm' : 'text-[15px]',
              expanded ? 'whitespace-normal break-words' : 'truncate w-max max-w-full'
            )}
          >
            {task.title}
          </h4>

          {((isCompactRow && showSubtitleInCompact) || !isCompactRow) &&
            (task.subtitle || task.unlockHint) && (
              <p
                className={twMerge(
                  'text-white/50 line-clamp-1',
                  isCompactRow ? 'text-[10px]' : 'text-[11px]'
                )}
              >
                {isLocked && task.unlockHint ? task.unlockHint : task.subtitle}
              </p>
            )}

          <div
            className={twMerge(
              'flex items-center gap-2 flex-wrap',
              isCompactRow ? 'mt-0' : 'mt-0.5'
            )}
          >
            <TaskRewardRow rewards={task.rewards} size="sm" />
            {showProgress && !isCompleted && !isLocked && (
              <span className="text-[11px] text-white/50 font-semibold tabular-nums ml-auto">
                {formatCompact(task.progress.current)}/{formatCompact(task.progress.target)}
              </span>
            )}
          </div>

          {showProgress && !isCompleted && !isLocked && !isCompactRow && (
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
            <div
              className={twMerge(
                'flex-center rounded-full bg-success/20',
                isCompactRow ? 'w-8 h-8' : 'w-9 h-9'
              )}
            >
              <Check size={isCompactRow ? 14 : 16} className="text-success" />
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
          ) : task.externalLink ? (
            <button
              type="button"
              aria-label={t('open')}
              onClick={e => {
                e.stopPropagation();
                window.open(task.externalLink, '_blank', 'noopener,noreferrer');
              }}
              className={twMerge(
                'flex-center rounded-full bg-electric-pink/15 border border-electric-pink/30 hover:bg-electric-pink/25 active:scale-95 transition-all',
                isCompactRow ? 'w-8 h-8' : 'w-9 h-9'
              )}
            >
              <ArrowUpRight
                size={isCompactRow ? 14 : 16}
                className="text-electric-pink"
                strokeWidth={2.5}
              />
            </button>
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
          {task.subSteps?.map(step => (
            <SubStepRow
              key={step.id}
              step={step}
              claimed={isStepClaimed(step)}
              onClaim={() => handleClaimSubStep(step)}
              onNavigate={task.deeplink || task.externalLink ? handleStepNavigate : undefined}
            />
          ))}

          {/* Batch claim collected substeps — visible only when 2+ are claimable AND not all done */}
          {!isCompleted && !allStepsDone && claimableCount >= 2 && (
            <button
              type="button"
              disabled={isSimulating}
              onClick={e => {
                e.stopPropagation();
                handleClaimAllSubSteps();
              }}
              className={twMerge(
                'mt-1 w-full rounded-xl py-2 text-xs font-bold flex-center gap-1.5 transition-all bg-pink-gradient text-white active:scale-95 shadow-md shadow-electric-pink/25',
                isSimulating && 'opacity-70 cursor-wait'
              )}
            >
              <Gift size={12} />
              {isSimulating ? t('claiming') : `${t('claim all')} (${claimableCount})`}
            </button>
          )}

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
