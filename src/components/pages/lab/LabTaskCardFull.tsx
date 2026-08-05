'use client';

import { type CSSProperties, useState } from 'react';
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
  TrendingUp,
  Twitter,
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Progress } from '@/components/shared/Progress';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { Medal, type MedalType } from '@/components/shared/icons/Medal';
import { GoldenText } from '@/components/shared/typography/GoldenText';
import { SectionShine } from '@/components/pages/tabs/tasks/SectionShine';
import { TaskCategoryIcon } from '@/components/pages/tabs/tasks/TaskCategoryIcon';
import { TaskRewardRow } from '@/components/pages/tabs/tasks/TaskRewardRow';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useCountDown } from '@/hooks/useCountDown';
import { useLocalized } from '@/hooks/useLocalized';
import { formatNumber } from '@/utils/global/number.utils';
import { TaskCategory, TaskRewardType, TaskStatus } from '@/types/enums/tasks.enums';
import type { Task, TaskSubStep } from '@/types/interfaces/tasks.interfaces';
import { routes, type Route } from '@/constants/routes';
import { LabSubStepRow } from './LabSubStepRow';

export interface LabTaskCardFullProps {
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

/**
 * Tier colour as an `R G B` triplet — the same palette the tournament card's
 * light uses, so a Gold task and a Gold tournament are the same gold.
 */
const TIER_RGB: Record<string, string> = {
  bronze: '172 97 34',
  silver: '168 170 164',
  gold: '248 189 62',
  platinum: '192 190 177',
  diamond: '23 141 136',
  all: '222 0 155',
};

const SOCIAL_ICON_BY_HOST: { match: RegExp; icon: LucideIcon; gradient: string }[] = [
  { match: /(?:^|\.)t\.me$/i, icon: Send, gradient: 'from-teal to-electric-purple' },
  { match: /(?:^|\.)x\.com$/i, icon: Twitter, gradient: 'from-white/30 to-white/10' },
  {
    match: /(?:^|\.)discord\.(?:gg|com)$/i,
    icon: Hash,
    gradient: 'from-electric-purple to-diamond',
  },
];

const resolveSocialIcon = (externalLink?: string) => {
  if (!externalLink) return null;
  let host: string;
  try {
    host = new URL(externalLink).hostname.toLowerCase();
  } catch {
    return null;
  }
  return SOCIAL_ICON_BY_HOST.find(entry => entry.match.test(host)) ?? null;
};

/**
 * Task card in the tournament card's shape — the candidate under review.
 *
 * Structure is a one-to-one port of the tournament card that shipped: a bare
 * medal on the tier light, the payout as the hero number where the prize pool
 * sits there, a captioned two-cell container, and one full-width action.
 *
 * Behaviour is `TaskItemCard`'s, carried over unchanged — this is meant to be a
 * drop-in replacement, not a picture of one. Everything the live card does is
 * here: sub-step expansion with the staggered batch-claim simulation, per-step
 * claiming, pinning with its disabled state, the daily reset countdown, deep
 * links vs external links, the locked-tournament tap that routes to the status
 * market, the section-highlight shine, and reward rows that render every reward
 * type rather than LC and AP alone.
 *
 * One difference is deliberate rather than lost: the gradient tier border is
 * gone, replaced by the light behind the card. Running both put a coloured
 * outline around every row of the list — the same reason the tournament card
 * dropped it.
 */
export function LabTaskCardFull({
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
}: LabTaskCardFullProps) {
  const t = useAppTranslations();
  const localized = useLocalized();
  const router = useRouter();
  const { leftTime, expired } = useCountDown(task.resetAt);

  const isReady = task.status === TaskStatus.READY_TO_CLAIM;
  const isLocked = task.status === TaskStatus.LOCKED;
  const isCompleted = task.status === TaskStatus.COMPLETED;
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
  const claimableCount = (task.subSteps ?? []).filter(s => s.completed && !isStepClaimed(s)).length;

  const handleClaimSubStep = (step: TaskSubStep) => {
    setLocallyClaimed(prev => ({ ...prev, [step.id]: true }));
    onClaimSubStep?.(task, step);
  };

  const handleClaimMain = async () => {
    if (isSimulating) return;
    const unclaimed = (task.subSteps ?? []).filter(s => s.completed && !isStepClaimed(s));

    if (unclaimed.length > 1) {
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
    setIsSimulating(true);
    for (const step of unclaimed) {
      await new Promise(res => setTimeout(res, 220));
      setLocallyClaimed(prev => ({ ...prev, [step.id]: true }));
      onClaimSubStep?.(task, step);
    }
    await new Promise(res => setTimeout(res, 200));
    setIsSimulating(false);
  };

  const isLockedTournament = isLocked && task.category === TaskCategory.TOURNAMENTS;

  const handleCardClick = () => {
    if (isLockedTournament) {
      router.push(routes.market('status'));
      return;
    }
    if (isLocked) return;
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

  const social =
    task.category === TaskCategory.SOCIAL ? resolveSocialIcon(task.externalLink) : null;
  const isTierTask = task.category === TaskCategory.TOURNAMENTS && !!task.tier;
  const tierRgb = TIER_RGB[task.tier ?? 'gold'] ?? TIER_RGB.gold;

  const showCountdown = !!task.resetAt && !isLocked && !expired;
  const showPin = !!onTogglePin && !isCompleted && !isLocked && !isReady;

  // One headline figure and «the rest». LC is the headline when a task pays it:
  // it is the number tasks get compared by, the role the prize pool plays on a
  // tournament card.
  const heroReward = task.rewards.find(r => r.type === TaskRewardType.LC) ?? null;
  const restRewards = heroReward ? task.rewards.filter(r => r !== heroReward) : task.rewards;

  const isClaimAction = (isReady || allStepsDone) && !isCompleted;

  return (
    <div
      style={style}
      className={twMerge(
        'bg-background-overlay relative overflow-hidden rounded-2xl border border-white/8 transition-all',
        isLocked && !isLockedTournament && 'opacity-60',
        isCompleted && 'opacity-80',
        className
      )}
    >
      <SectionShine token={highlightToken ?? null} />

      {!isCompleted && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            background: `radial-gradient(90% 70% at 12% -10%, rgb(${tierRgb} / 0.30) 0%, transparent 68%)`,
          }}
        />
      )}

      <div
        className="relative z-[2] flex cursor-pointer flex-col p-3 active:scale-[0.99]"
        onClick={handleCardClick}
        role="button"
        aria-disabled={isLocked && !isLockedTournament}
        aria-expanded={hasSubSteps ? expanded : undefined}
      >
        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            {isTierTask ? (
              <Medal
                className="drop-shadow-lg drop-shadow-black/40"
                width={56}
                height={56}
                type={(task.tier === 'all' ? 'gold' : task.tier) as MedalType}
              />
            ) : social ? (
              <div
                className={twMerge(
                  'flex-center size-14 rounded-xl bg-gradient-to-br shadow-md shadow-black/20',
                  social.gradient
                )}
              >
                <social.icon size={26} className="text-white" strokeWidth={2.4} />
              </div>
            ) : (
              <TaskCategoryIcon category={task.category} size={30} />
            )}
            {isLocked && (
              <span className="flex-center absolute inset-0 rounded-lg bg-black/45 backdrop-blur-[1px]">
                <Lock className="text-white/90" size={22} strokeWidth={2.4} />
              </span>
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h5 className="line-clamp-2 text-sm leading-tight font-bold text-white">
              {localized(task.title)}
            </h5>

            {heroReward && (
              <GoldenText
                className="inline-flex items-center gap-1.5 text-2xl leading-none font-extrabold tabular-nums"
                style={{ textShadow: '0 1px 6px rgba(248, 189, 62, 0.45)' }}
              >
                +{formatNumber(heroReward.amount)}
                <LcLabel size={18} />
              </GoldenText>
            )}

            {(task.subtitle || task.unlockHint) && (
              <span className="line-clamp-1 text-[11px] leading-none text-white/45">
                {localized(isLocked && task.unlockHint ? task.unlockHint : task.subtitle)}
              </span>
            )}
          </div>

          {showCountdown && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-white/6 px-1.5 py-1 leading-none text-white">
              <Clock3 className="text-pink-secondary h-3 w-3 shrink-0" strokeWidth={2.4} />
              <span className="truncate text-[11px] leading-none font-bold tabular-nums">
                {leftTime}
              </span>
            </span>
          )}
        </div>

        <div className="mt-2.5 flex items-stretch divide-x divide-white/10 rounded-xl bg-black/25">
          <div className="flex min-w-0 flex-1 flex-col items-center gap-1 px-1 py-2">
            <span className="max-w-full truncate text-[8px] leading-none font-bold tracking-[0.16em] text-white/35 uppercase">
              {t('reward')}
            </span>
            <span className="flex max-w-full items-center gap-1 leading-none">
              <TaskRewardRow rewards={restRewards} size="sm" />
            </span>
          </div>
          <div className="flex min-w-0 flex-1 flex-col items-center gap-1 px-1 py-2">
            <span className="max-w-full truncate text-[8px] leading-none font-bold tracking-[0.16em] text-white/35 uppercase">
              {t('progress')}
            </span>
            <span className="text-[15px] leading-none font-extrabold text-white tabular-nums">
              {task.progress.current}
              <span className="text-white/40">/{task.progress.target}</span>
            </span>
          </div>
        </div>

        <div className="mt-2.5 flex items-center gap-2">
          {showPin && onTogglePin && (
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
                'flex-center size-9 shrink-0 rounded-xl transition-all active:scale-90',
                pinned
                  ? 'bg-electric-pink/20 text-electric-pink'
                  : pinDisabled
                    ? 'cursor-not-allowed bg-white/[0.04] text-white/20'
                    : 'bg-white/5 text-white/40'
              )}
            >
              {pinned ? (
                <PinOff size={14} strokeWidth={2.5} />
              ) : (
                <Pin size={14} strokeWidth={2.5} />
              )}
            </button>
          )}

          <button
            type="button"
            disabled={(isLocked && !isLockedTournament) || isSimulating}
            onClick={e => {
              e.stopPropagation();
              // Claim goes straight to the claim handler, like the live card's
              // CTA. Routing it through `handleCardClick` would be wrong: for a
              // task WITH sub-steps that handler toggles the accordion, so an
              // all-steps-done task could never be claimed from here.
              if (isClaimAction) {
                handleClaimMain();
                return;
              }
              handleCardClick();
            }}
            className={twMerge(
              'flex-center relative flex-1 gap-1.5 rounded-xl py-2.5 text-[12px] leading-none font-extrabold tracking-[0.14em] uppercase',
              isSimulating && 'cursor-wait opacity-70',
              isClaimAction && 'bg-pink-gradient animate-task-pulse text-white',
              isCompleted && 'bg-success/15 text-success',
              isLockedTournament && 'bg-pink-gradient text-white',
              isLocked && !isLockedTournament && 'border border-white/10 bg-white/5 text-white/45',
              !isLocked &&
                !isCompleted &&
                !isClaimAction &&
                'border border-white/10 bg-white/5 text-white/70'
            )}
          >
            {isClaimAction ? (
              <>
                <Gift size={13} strokeWidth={2.6} />
                {isSimulating ? t('claiming') : t('claim')}
              </>
            ) : isCompleted ? (
              <>
                <Check size={13} strokeWidth={2.6} />
                {t('claimed')}
              </>
            ) : isLockedTournament ? (
              <>
                <TrendingUp size={13} strokeWidth={2.6} />
                {t('open')}
              </>
            ) : isLocked ? (
              <>
                <Lock size={12} strokeWidth={2.6} />
                {t('locked')}
              </>
            ) : hasSubSteps ? (
              <>
                <ChevronDown
                  size={13}
                  strokeWidth={2.6}
                  className={twMerge(expanded && 'rotate-180')}
                />
                {t('substeps progress', { completed: completedSteps, total: totalSteps })}
              </>
            ) : task.externalLink ? (
              <>
                <ArrowUpRight size={13} strokeWidth={2.6} />
                {t('open')}
              </>
            ) : (
              <>
                <ChevronRight size={13} strokeWidth={2.6} />
                {t('open')}
              </>
            )}

            {/* «Есть что забрать внутри» — the pulsing dot the live card puts on
                its chevron. Without it a task whose sub-step is ready looks
                identical to one that is not, and the reward goes uncollected. */}
            {hasClaimableSubStep && !isClaimAction && (
              <span className="pointer-events-none absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                <span className="bg-electric-pink absolute inset-0 animate-ping rounded-full opacity-75" />
                <span className="bg-electric-pink border-background-overlay relative h-2.5 w-2.5 rounded-full border" />
              </span>
            )}
          </button>
        </div>

        {showProgress && !isCompleted && !isLocked && (
          <Progress
            percentage={pct}
            className="mt-2 h-1"
            classNames={{ bar: 'bg-pink-gradient' }}
          />
        )}
      </div>

      {hasSubSteps && expanded && !isLocked && (
        <div className="flex flex-col gap-1.5 border-t border-white/5 bg-black/15 px-3 py-3">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider text-white/40 uppercase">
              {t('substeps progress', { completed: completedSteps, total: totalSteps })}
            </span>
            {!isCompleted && (
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  handleStepNavigate();
                }}
                className="text-electric-pink flex items-center gap-1 text-[11px] font-semibold hover:underline"
              >
                {t('open')}
                <ChevronRight size={12} />
              </button>
            )}
          </div>

          {task.subSteps?.map(step => (
            <LabSubStepRow
              key={step.id}
              step={step}
              claimed={isStepClaimed(step)}
              onClaim={() => handleClaimSubStep(step)}
              onNavigate={task.deeplink || task.externalLink ? handleStepNavigate : undefined}
            />
          ))}

          {!isCompleted && !allStepsDone && claimableCount >= 2 && (
            <button
              type="button"
              disabled={isSimulating}
              onClick={e => {
                e.stopPropagation();
                handleClaimAllSubSteps();
              }}
              className={twMerge(
                'flex-center bg-pink-gradient shadow-electric-pink/25 mt-1 w-full gap-1.5 rounded-xl py-2 text-xs font-bold text-white shadow-md transition-all active:scale-95',
                isSimulating && 'cursor-wait opacity-70'
              )}
            >
              <Gift size={12} />
              {isSimulating ? t('claiming') : `${t('claim all')} (${claimableCount})`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
