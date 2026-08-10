'use client';

import { type CSSProperties, useState } from 'react';
import { Check, ChevronDown, Circle, Clock3, Sparkles } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Button } from '@/components/shared/buttons/Button';
import { Progress } from '@/components/shared/Progress';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useCountDown } from '@/hooks/useCountDown';
import { useLocalized } from '@/hooks/useLocalized';
import { TaskRewardType, TaskStatus } from '@/types/enums/tasks.enums';
import type { Task } from '@/types/interfaces/tasks.interfaces';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { GoldenText } from '@/components/shared/typography/GoldenText';
import { formatNumber } from '@/utils/global/number.utils';
import { TaskRewardRow } from './TaskRewardRow';

export interface AllSetBonusCardProps {
  task: Task;
  onClaim: (task: Task) => void;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * The all-set completion bonus of a period (DOCS §12.4) — "complete every daily
 * task" and its weekly twin.
 *
 * It gets its own card instead of a row inside a category, because it is the
 * only task whose condition is *the other tasks*. As a Tournaments row it read
 * as one more tier task, and with Bronze the only auto-spawned tier its
 * condition was literally `task-daily-bronze`'s — the same four entries, paid a
 * second time and six times over, under a Gold medal it had no claim to.
 *
 * It closes the list rather than opening it: the checklist is a summary of
 * everything above, and read before the tasks themselves it is a wall of names
 * for work not yet described. The card is also the one thing on the tab that
 * cannot be acted on directly — every row in it is claimed on its own card —
 * so the top of the screen belongs to what a tap can actually pay.
 *
 * The checklist behaves like every other multi-step task: collapsed to its
 * count, opened by tapping the card. The rows are read-only, though — each one
 * is another task with its own card and its own reward, so there is nothing to
 * collect here until the whole set is done. The backend sends them with
 * `claimable: false` and never accepts a sub-step claim for this task.
 */
export function AllSetBonusCard({
  task,
  onClaim,
  loading = false,
  className,
  style,
}: AllSetBonusCardProps) {
  const t = useAppTranslations();
  const localized = useLocalized();
  const { leftTime, expired } = useCountDown(task.resetAt);

  const isReady = task.status === TaskStatus.READY_TO_CLAIM;
  const isCompleted = task.status === TaskStatus.COMPLETED;
  const { current, target } = task.progress;
  const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  const steps = task.subSteps ?? [];
  const hasSteps = steps.length > 0;

  /**
   * The payout as the hero number, the same split every full-size task card
   * makes (`TaskItemCard`): the LC leads in gold under the title, the rest
   * stays a chip row. This is the biggest single reward on the daily tab and
   * it was reading as two small chips in a corner — smaller than the payout of
   * the tasks it is a bonus over.
   */
  const heroReward = task.rewards.find(reward => reward.type === TaskRewardType.LC) ?? null;
  const restRewards = heroReward
    ? task.rewards.filter(reward => reward !== heroReward)
    : task.rewards;

  const [expanded, setExpanded] = useState(false);

  return (
    <section className={twMerge('animate-slide-in-bottom px-4 pt-5 pb-3', className)} style={style}>
      <div
        className={twMerge(
          'card-outlined flex flex-col gap-3 rounded-3xl p-3.5',
          'bg-gradient-to-br from-electric-purple/18 via-pink/8 to-transparent',
          isCompleted && 'opacity-80',
          hasSteps && 'cursor-pointer active:scale-[0.99]'
        )}
        // Tap anywhere to open the checklist, as on every other multi-step
        // card. Same idiom as `TaskItemCard`: the claim button below stops the
        // event so collecting the bonus never also folds the card shut.
        onClick={hasSteps ? () => setExpanded(prev => !prev) : undefined}
        role={hasSteps ? 'button' : undefined}
        aria-expanded={hasSteps ? expanded : undefined}
      >
        <div className="flex items-start gap-3">
          <span
            className={twMerge(
              'flex-center size-11 shrink-0 rounded-xl shadow-md shadow-black/30',
              'bg-gradient-to-br from-electric-purple to-pink',
              isReady && 'animate-task-pulse'
            )}
          >
            <Sparkles size={21} className="text-white" strokeWidth={2.2} />
          </span>

          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-[13px] leading-tight font-extrabold">
              {localized(task.title)}
            </span>

            {heroReward && (
              <GoldenText
                className="inline-flex items-center gap-1.5 text-2xl leading-none font-extrabold tabular-nums"
                style={{ textShadow: '0 1px 6px rgba(248, 189, 62, 0.45)' }}
              >
                +{formatNumber(heroReward.amount)}
                <LcLabel size={18} />
              </GoldenText>
            )}

            {task.subtitle && (
              <span className="text-[10px] leading-tight text-white/50">
                {localized(task.subtitle)}
              </span>
            )}
          </div>

          {task.resetAt && !expired && (
            <span className="flex shrink-0 items-center gap-1 text-[10px] font-medium tabular-nums text-white/40">
              <Clock3 size={10} />
              {leftTime}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            {/* The count is on the action below, where every other card keeps
                it. Printed here as well it was the same fact twice on one
                card. */}
            <span className="text-[10px] font-bold tracking-[0.14em] text-white/40 uppercase">
              {t('reward')}
            </span>
            <TaskRewardRow
              rewards={restRewards.length ? restRewards : task.rewards}
              tier={task.tier}
              size="sm"
            />
          </div>
          <Progress percentage={pct} className="h-2" />
        </div>

        {hasSteps && expanded && (
          <ul className="flex flex-col gap-1">
            {steps.map(step => (
              <li
                key={step.id}
                className={twMerge(
                  'flex items-center gap-2 rounded-lg px-2 py-1.5',
                  step.completed ? 'bg-success/10' : 'bg-white/5'
                )}
              >
                {step.completed ? (
                  <span className="flex-center size-4 shrink-0 rounded-full bg-success/30">
                    <Check size={10} className="text-success" strokeWidth={3} />
                  </span>
                ) : (
                  <Circle size={16} className="shrink-0 text-white/30" />
                )}
                <span
                  className={twMerge(
                    'flex-1 truncate text-[11px] font-semibold',
                    step.completed ? 'text-white/60 line-through' : 'text-white/80'
                  )}
                >
                  {localized(step.label)}
                </span>
              </li>
            ))}
          </ul>
        )}

        {/* Same three states, in the same order, as every other task card:
            «Забрать» only when there is something to take, «Получено» after,
            and otherwise the count of what is still missing. A greyed-out
            claim button read as a broken control — the card looked collectable
            all day and refused every tap. */}
        {isCompleted ? (
          <span className="text-success flex items-center justify-center gap-1.5 text-[11px] font-bold tracking-wider uppercase">
            <Check size={12} strokeWidth={3} />
            {t('claimed')}
          </span>
        ) : isReady ? (
          <Button
            onClick={event => {
              event.stopPropagation();
              onClaim(task);
            }}
            loading={loading}
            className="w-full py-2 text-[13px]"
          >
            {t('claim')}
          </Button>
        ) : (
          <button
            type="button"
            onClick={event => {
              event.stopPropagation();
              setExpanded(prev => !prev);
            }}
            className="flex-center w-full gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2.5 text-[12px] leading-none font-extrabold tracking-[0.14em] text-white/70 uppercase"
          >
            {hasSteps && (
              <ChevronDown
                size={13}
                strokeWidth={2.6}
                className={twMerge('transition-transform', expanded && 'rotate-180')}
              />
            )}
            {t('substeps progress', { completed: current, total: target })}
          </button>
        )}
      </div>
    </section>
  );
}
