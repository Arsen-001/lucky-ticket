'use client';

import { type CSSProperties, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronRight,
  Circle,
  Clock3,
  Gift,
  Lock,
  Pin,
  PinOff,
  TrendingUp,
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useLocalized } from '@/hooks/useLocalized';
import { useCountDown } from '@/hooks/useCountDown';
import { Progress } from '@/components/shared/Progress';
import { Button } from '@/components/shared/buttons/Button';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { Medal, type MedalType } from '@/components/shared/icons/Medal';
import { GoldenText } from '@/components/shared/typography/GoldenText';
import { formatNumber } from '@/utils/global/number.utils';
import { resolveTaskSocialBrand } from '@/utils/pages/task-social.utils';
import { TaskCategory, TaskRewardType, TaskStatus } from '@/types/enums/tasks.enums';
import type { Task, TaskSubStep } from '@/types/interfaces/tasks.interfaces';
import { routes } from '@/constants/routes';
import { useTaskNavigate } from '@/hooks/useTaskNavigate';
import { taskHasDestination } from '@/utils/pages/task-destination.utils';
import { TaskCategoryIcon } from './TaskCategoryIcon';
import { TaskRewardRow } from './TaskRewardRow';
import { openExternalUrl } from '@/lib/telegram/telegram';
import { SectionShine } from './SectionShine';
import { ClaimableDot } from '@/components/shared/badges/ClaimableDot';

export interface TaskItemCardProps {
  task: Task;
  onClaim: (task: Task) => void;
  expanded?: boolean;
  onToggleExpanded?: () => void;
  highlightToken?: number | null;
  className?: string;
  style?: CSSProperties;
  pinned?: boolean;
  pinDisabled?: boolean;
  onTogglePin?: (taskId: string) => void;
  /**
   * Draw the single-line form instead of the full card. Passed in by the
   * section, which owns the shape decision — the card used to work it out from
   * its own category, so a section asking for a full card silently got a row.
   * @see TaskLayout
   */
  compact?: boolean;
}

/**
 * Tier colour as an `R G B` triplet for the light behind a full-size card —
 * the same palette the tournament card uses, so a Gold task and a Gold
 * tournament are the same gold. @see .task-card-glow
 */
const TIER_RGB: Record<string, string> = {
  bronze: '172 97 34',
  silver: '168 170 164',
  gold: '248 189 62',
  platinum: '192 190 177',
  diamond: '23 141 136',
  all: '222 0 155',
};

/**
 * One row of a task's checklist: done, or not done yet.
 *
 * Sub-steps pay nothing and are not claimed — the task pays what its card says,
 * once, when it is finished. The server states that itself: every step arrives
 * `claimable: false`, from both branches of the mapper, with no reward and no
 * admin setting that could change it. This row used to carry the other half —
 * a pink «Забрать» pill, a claimed state, a reward badge — and none of it could
 * ever render.
 */
function SubStepRow({ step, onNavigate }: { step: TaskSubStep; onNavigate?: () => void }) {
  const t = useAppTranslations();
  const localized = useLocalized();
  const isDone = step.completed;
  const isPending = !step.completed;
  const label = localized(step.label);
  const canNavigate = isPending && !!onNavigate;
  const rowAction = canNavigate ? onNavigate : undefined;
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
        isDone && 'bg-success/10',
        isPending && 'bg-white/5',
        canNavigate && 'cursor-pointer active:scale-[0.99] hover:bg-white/10'
      )}
    >
      {isDone ? (
        <div className="flex-center w-5 h-5 rounded-full bg-success/30 shrink-0">
          <Check size={11} className="text-success" />
        </div>
      ) : (
        <Circle size={18} className="text-white/30 shrink-0" />
      )}
      {label ? (
        <span
          className={twMerge(
            'text-xs font-semibold flex-1 truncate',
            isDone ? 'text-white' : 'text-white/60'
          )}
        >
          {label}
        </span>
      ) : (
        <div className="flex-1" />
      )}
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
    </div>
  );
}

export function TaskItemCard({
  task,
  onClaim,
  expanded: expandedProp,
  onToggleExpanded,
  highlightToken,
  className,
  style,
  pinned = false,
  pinDisabled = false,
  onTogglePin,
  compact = false,
}: TaskItemCardProps) {
  const t = useAppTranslations();
  const localized = useLocalized();
  const router = useRouter();
  const navigateToTask = useTaskNavigate();
  const { leftTime, expired } = useCountDown(task.resetAt);

  const isReady = task.status === TaskStatus.READY_TO_CLAIM;
  const isLocked = task.status === TaskStatus.LOCKED;
  const isCompleted = task.status === TaskStatus.COMPLETED;
  const isInProgress = task.status === TaskStatus.IN_PROGRESS;
  const hasDestination = taskHasDestination(task);
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
  /**
   * Собирается ЗАДАНИЕ, а не его шаги.
   *
   * Здесь была вторая половина: подшаги забирались поштучно и пачкой, карточка
   * держала локальный список забранных и проигрывала анимацию «собираю по
   * одному». Ничего из этого не могло случиться — сервер помечает каждый
   * подшаг `claimable: false` (обе ветки маппера, награды у шага нет), фронт
   * читал это поле, и все три кнопки были невидимы. А запросы, которые они бы
   * послали, бэкенд отбивает: `subStepIds` он принимает и игнорирует, и на
   * незавершённом задании отвечает «Milestone not reached yet».
   */
  const handleClaimMain = () => {
    setExpanded(false);
    onClaim(task);
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
    // Resolved, not pushed verbatim: a catalog task can arrive with no deeplink
    // at all or with a bare `/tasks` — the screen this card is already on, where
    // `router.push` does nothing. See `resolveTaskDestination`.
    navigateToTask(task);
  };

  const handleStepNavigate = () => {
    navigateToTask(task);
  };

  // Which shape to draw is the section's call (`compact`), never this card's
  // own reading of its category. It used to be the latter — a hard-coded list
  // of ONCE categories — and that quietly outranked the section: a task
  // promoted to `cards` because it carries sub-steps came back as a compact
  // row, which has no accordion, so the steps vanished. Daily/weekly tasks are
  // full cards everywhere, and that still holds: nothing asks for compact.
  const isCompactRow = compact;
  const showSubtitleInCompact =
    task.category === TaskCategory.ACHIEVEMENTS ||
    task.category === TaskCategory.PROFILE_STATUS ||
    task.category === TaskCategory.PROFILE;

  const tierRgb = TIER_RGB[task.tier ?? 'gold'] ?? TIER_RGB.gold;
  const showCountdown = !!task.resetAt && !isLocked && !expired;
  const showPin = !!onTogglePin && !isCompleted && !isLocked && !isReady;
  const isClaimAction = (isReady || allStepsDone) && !isCompleted;

  /**
   * The full-width control at the foot of the card, only when it does something:
   * claim, open the sub-steps, state «locked»/«claimed» — or actually go
   * somewhere. A task whose catalog row names no destination (and whose category
   * has no single obvious one) used to end in an «Open ›» that led nowhere.
   */
  const showAction = isClaimAction || isCompleted || isLocked || hasSubSteps || hasDestination;

  /**
   * «Здесь есть что забрать» — the numberless mark that rides the card's icon.
   * A ready sub-step counts: its reward is as collectable as the task's own,
   * and the card is collapsed by default, so nothing else on the row says so.
   */
  const hasSomethingToClaim = !isLocked && !isCompleted && isClaimAction;

  /**
   * One headline figure and «the rest». LC is the headline when a task pays it:
   * it is the number tasks get compared by, the role the prize pool plays on a
   * tournament card.
   */
  const heroReward = task.rewards.find(r => r.type === TaskRewardType.LC) ?? null;
  const restRewards = heroReward ? task.rewards.filter(r => r !== heroReward) : task.rewards;

  return (
    <div
      style={style}
      className={twMerge(
        'relative rounded-2xl transition-all bg-background-overlay overflow-hidden',
        isCompactRow ? (showSubtitleInCompact ? 'min-h-[68px]' : 'min-h-[60px]') : 'min-h-[108px]',
        // A plain hairline everywhere. The gradient rarity / tier frames put a
        // coloured outline around every row of a long list, and on the
        // full-size card the tier is already said by the light behind it.
        'border border-white/8',
        isLocked && !isLockedTournament && 'opacity-60',
        isCompleted && 'opacity-80',
        className
      )}
    >
      <SectionShine token={highlightToken ?? null} />

      {!isCompactRow && !isCompleted && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            background: `radial-gradient(90% 70% at 12% -10%, rgb(${tierRgb} / 0.30) 0%, transparent 68%)`,
          }}
        />
      )}

      {/* Top-right cluster: countdown + pin button (pin hidden for ready-to-claim — they're already on top).
          The countdown stays visible on completed periodic tasks — it tells when the task re-opens.
          Full-size cards place both in flow instead, so they cannot sit over the headline. */}
      {isCompactRow &&
      ((task.resetAt && !isLocked && !expired) ||
        (onTogglePin && !isCompleted && !isLocked && !isReady)) ? (
        <div className="absolute top-1.5 end-1.5 z-[3] flex items-center gap-1.5">
          {task.resetAt && !isLocked && !expired && (
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

      {/* Full-size card — the tournament card's shape: a bare medal on the tier
          light, the payout as the hero number where the prize pool sits there,
          a captioned two-cell container, and one full-width action instead of
          the three different controls this row used to end in. */}
      {!isCompactRow && (
        <div
          className={twMerge(
            'relative z-[2] flex flex-col p-3',
            (!isLocked || isLockedTournament) && 'cursor-pointer active:scale-[0.99]'
          )}
          onClick={handleCardClick}
          role="button"
          aria-disabled={isLocked && !isLockedTournament}
          aria-expanded={hasSubSteps ? expanded : undefined}
        >
          <div className="flex items-start gap-3">
            <div className="relative shrink-0">
              {/* A medal only for a task that really belongs to a tier. `all`
                  used to fall back to the Gold medal, so the "complete all
                  tournament tasks" card wore a Gold badge while asking for
                  Bronze entries — a rank the task never had. */}
              {task.category === TaskCategory.TOURNAMENTS && task.tier && task.tier !== 'all' ? (
                <Medal
                  className="drop-shadow-lg drop-shadow-black/40"
                  width={56}
                  height={56}
                  type={task.tier as MedalType}
                />
              ) : task.category === TaskCategory.SOCIAL &&
                resolveTaskSocialBrand(task.externalLink) ? (
                (() => {
                  const social = resolveTaskSocialBrand(task.externalLink)!;
                  const SocialIcon = social.icon;
                  return (
                    <div
                      className={twMerge(
                        'flex-center size-14 rounded-xl bg-gradient-to-br shadow-md shadow-black/20',
                        social.gradient
                      )}
                    >
                      <SocialIcon size={26} className="text-white" strokeWidth={2.4} />
                    </div>
                  );
                })()
              ) : (
                <TaskCategoryIcon category={task.category} size={30} />
              )}
              {isLocked && (
                <span className="flex-center absolute inset-0 rounded-lg bg-black/45 backdrop-blur-[1px]">
                  <Lock className="text-white/90" size={22} strokeWidth={2.4} />
                </span>
              )}
              {isCompleted && (
                <div className="flex-center bg-background border-success absolute -right-1 -bottom-1 size-5 rounded-full border">
                  <Check size={10} className="text-success" />
                </div>
              )}
              {hasSomethingToClaim && (
                <ClaimableDot
                  label={t('something to claim')}
                  className="absolute -top-1 -right-1"
                />
              )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-1">
              {/* Two lines and wrapping, not one line and a truncation: almost
                  every headline on this screen was being cut mid-word, and it is
                  the only thing that says what to do. */}
              <h4 className="line-clamp-2 text-sm leading-tight font-bold text-white">
                {localized(task.title)}
              </h4>

              {heroReward && (
                <GoldenText
                  className="inline-flex items-center gap-1.5 text-2xl leading-none font-extrabold tabular-nums"
                  style={{ textShadow: '0 1px 6px rgba(248, 189, 62, 0.45)' }}
                >
                  +{formatNumber(heroReward.amount)}
                  <LcLabel size={18} />
                </GoldenText>
              )}

              {/* Two lines, same reason as the headline above: at one line the
                  subtitle is cut where the condition is, and the condition is
                  the whole point of it. «Boost the channel» ends «…from
                  Telegram Premium …» — the sentence that says why most players
                  cannot do it. `leading-snug`, not `leading-none`: two clamped
                  lines at zero leading overlap. */}
              {(task.subtitle || task.unlockHint) && (
                <span className="line-clamp-2 text-[11px] leading-snug text-white/45">
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
                <TaskRewardRow
                  rewards={restRewards.length ? restRewards : task.rewards}
                  tier={task.tier}
                  size="sm"
                />
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

          <div
            className={twMerge(
              'mt-2.5 flex items-center gap-2',
              !showPin && !showAction && 'mt-0 hidden'
            )}
          >
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

            {showAction && (
              <button
                type="button"
                disabled={isLocked && !isLockedTournament}
                onClick={e => {
                  e.stopPropagation();
                  // Claim goes straight to the claim handler. Routing it through
                  // `handleCardClick` would be wrong: for a task WITH sub-steps
                  // that handler toggles the accordion, so an all-steps-done task
                  // could never be claimed from here.
                  if (isClaimAction) {
                    handleClaimMain();
                    return;
                  }
                  handleCardClick();
                }}
                className={twMerge(
                  'tap-target flex-center relative flex-1 gap-1.5 rounded-xl py-2.5 text-[12px] leading-none font-extrabold tracking-[0.14em] uppercase',
                  isClaimAction && 'bg-pink-gradient animate-task-pulse text-white',
                  isCompleted && 'bg-success/15 text-success',
                  isLockedTournament && 'bg-pink-gradient text-white',
                  isLocked &&
                    !isLockedTournament &&
                    'border border-white/10 bg-white/5 text-white/45',
                  !isLocked &&
                    !isCompleted &&
                    !isClaimAction &&
                    'border border-white/10 bg-white/5 text-white/70'
                )}
              >
                {isClaimAction ? (
                  <>
                    <Gift size={13} strokeWidth={2.6} />
                    {t('claim')}
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
              </button>
            )}
          </div>

          {showProgress && !isCompleted && !isLocked && (
            <Progress
              percentage={pct}
              className="mt-2 h-1"
              classNames={{ bar: 'bg-pink-gradient' }}
            />
          )}
        </div>
      )}

      {/* Compact row — one-time tasks in Social / Achievements / Profile.
          These lists run to hundreds of rows, so the full-size card is not used
          here. What changed is only where the width goes: the headline may take
          two lines and the reward chips moved into a column on the right, which
          is what was cutting «Follow our Telegra…» and «Win a priz…» — the more
          a task paid, the more chips it had, the shorter its name got. */}
      {isCompactRow && (
        <div
          className={twMerge(
            'relative z-[2] flex min-h-[60px] items-center gap-2.5 p-2.5',
            (!isLocked || isLockedTournament) && 'cursor-pointer active:scale-[0.99]'
          )}
          onClick={handleCardClick}
          role="button"
          aria-disabled={isLocked && !isLockedTournament}
          aria-expanded={hasSubSteps ? expanded : undefined}
        >
          <div className="flex-center relative size-9 shrink-0">
            {task.category === TaskCategory.SOCIAL && resolveTaskSocialBrand(task.externalLink) ? (
              (() => {
                const social = resolveTaskSocialBrand(task.externalLink)!;
                const SocialIcon = social.icon;
                return (
                  <div
                    className={twMerge(
                      'flex-center size-9 rounded-xl bg-gradient-to-br shadow-md shadow-black/20',
                      social.gradient
                    )}
                  >
                    <SocialIcon size={18} className="text-white" strokeWidth={2.4} />
                  </div>
                );
              })()
            ) : (
              <TaskCategoryIcon category={task.category} size={18} />
            )}
            {isLocked && (
              <div className="flex-center bg-background absolute -right-1 -bottom-1 size-5 rounded-full border border-white/10">
                <Lock size={10} className="text-white/60" />
              </div>
            )}
            {isCompleted && (
              <div className="flex-center bg-background border-success absolute -right-1 -bottom-1 size-5 rounded-full border">
                <Check size={10} className="text-success" />
              </div>
            )}
            {hasSomethingToClaim && (
              <ClaimableDot
                label={t('something to claim')}
                size="sm"
                className="absolute -top-0.5 -right-0.5"
              />
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <h4 className="line-clamp-2 text-[13px] leading-snug font-extrabold">
              {localized(task.title)}
            </h4>
            {showSubtitleInCompact && (task.subtitle || task.unlockHint) && (
              <p className="line-clamp-1 text-[10px] text-white/50">
                {localized(isLocked && task.unlockHint ? task.unlockHint : task.subtitle)}
              </p>
            )}
          </div>

          {/* Rewards stack to the right instead of sitting in the headline's
              way. The reset countdown and the progress figure join them, so
              nothing that used to be on this row has been dropped. */}
          <div className="flex shrink-0 flex-col items-end gap-1">
            <TaskRewardRow rewards={task.rewards} tier={task.tier} size="sm" />
            {(showProgress || (task.resetAt && !isLocked && !expired)) && (
              <span className="flex items-center gap-2 text-[10px] leading-none font-medium text-white/40 tabular-nums">
                {task.resetAt && !isLocked && !expired && (
                  <span className="inline-flex items-center gap-1">
                    <Clock3 size={10} />
                    {leftTime}
                  </span>
                )}
                {showProgress && !isCompleted && !isLocked && (
                  <span className="font-semibold text-white/50">
                    {task.progress.current}/{task.progress.target}
                  </span>
                )}
              </span>
            )}
          </div>

          <div className="flex shrink-0 items-center">
            {(isReady || allStepsDone) && !isCompleted ? (
              <Button
                className="animate-task-pulse flex-center flex-col gap-0.5 rounded-full px-3 py-1.5 text-xs font-bold disabled:opacity-70"
                onClick={e => {
                  e.stopPropagation();
                  handleClaimMain();
                }}
              >
                <Gift size={14} />
                {t('claim')}
              </Button>
            ) : isLocked ? (
              <div className="flex-center size-8 rounded-full bg-white/5">
                <Lock size={13} className="text-white/40" />
              </div>
            ) : isCompleted ? (
              <div className="flex-center bg-success/20 size-8 rounded-full">
                <Check size={14} className="text-success" />
              </div>
            ) : task.externalLink ? (
              <button
                type="button"
                aria-label={t('open')}
                onClick={e => {
                  e.stopPropagation();
                  openExternalUrl(task.externalLink);
                }}
                // 32px circle, 44px hit area — see TaskItemRow.
                className="tap-target flex-center bg-electric-pink/15 border-electric-pink/30 hover:bg-electric-pink/25 relative size-8 rounded-full border transition-all active:scale-95"
              >
                <ArrowUpRight size={14} className="text-electric-pink" strokeWidth={2.5} />
              </button>
            ) : (
              // A chevron only when the tap actually leads somewhere — see
              // `taskHasDestination`.
              isInProgress &&
              hasDestination && (
                <div className="flex-center size-8 rounded-full bg-white/5 transition-colors hover:bg-white/10">
                  <ChevronRight size={14} className="text-white/60" />
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* substeps accordion */}
      {hasSubSteps && expanded && !isLocked && (
        <div className="border-t border-white/5 px-3 py-3 flex flex-col gap-1.5 bg-black/15">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase tracking-wider font-bold text-white/40">
              {t('substeps progress', { completed: completedSteps, total: totalSteps })}
            </span>
            {/* Only when there is somewhere to go: `handleStepNavigate` is a
                no-op without a link, and the all-set bonus — a checklist of
                other tasks — has none. A link that does nothing is worse than
                no link. */}
            {!isCompleted && hasDestination && (
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
              onNavigate={hasDestination ? handleStepNavigate : undefined}
            />
          ))}

          {/* Main bonus claim button — always present, gated by allStepsDone */}
          <div className="mt-2 pt-2 border-t border-white/5 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] uppercase tracking-wider font-bold text-white/40">
                {t('main bonus')}
              </span>
              <TaskRewardRow rewards={task.rewards} tier={task.tier} size="sm" />
            </div>
            {isCompleted ? (
              <div className="w-full rounded-xl py-2.5 text-sm font-bold flex-center gap-1.5 bg-success/15 text-success">
                <Check size={14} />
                {t('claimed')}
              </div>
            ) : (
              <button
                type="button"
                disabled={!allStepsDone}
                onClick={e => {
                  e.stopPropagation();
                  if (allStepsDone) handleClaimMain();
                }}
                className={twMerge(
                  'w-full rounded-xl py-2.5 text-sm font-bold flex-center gap-1.5 transition-all',
                  allStepsDone
                    ? 'bg-pink-gradient text-white animate-task-pulse active:scale-95 shadow-lg shadow-electric-pink/30'
                    : 'bg-white/5 text-white/40 cursor-not-allowed'
                )}
              >
                <Gift size={14} />
                {allStepsDone
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
