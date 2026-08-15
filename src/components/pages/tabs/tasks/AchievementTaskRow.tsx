'use client';

import type { CSSProperties } from 'react';
import Image from 'next/image';
import { Check, ChevronRight, Gift, Lock } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useLocalized } from '@/hooks/useLocalized';
import { Progress } from '@/components/shared/Progress';
import { TaskStatus } from '@/types/enums/tasks.enums';
import type { Task } from '@/types/interfaces/tasks.interfaces';
import { useTaskNavigate } from '@/hooks/useTaskNavigate';
import { taskHasDestination } from '@/utils/pages/task-destination.utils';
import { taskRarityAccentColors, taskRarityBadgeSrc } from '@/constants/task-badges';
import { TaskRewardRow } from './TaskRewardRow';
import { SectionShine } from './SectionShine';
import { ClaimableDot } from '@/components/shared/badges/ClaimableDot';

export interface AchievementTaskRowProps {
  task: Task;
  onClaim: (task: Task) => void;
  highlightToken?: number | null;
  className?: string;
  style?: CSSProperties;
}

/**
 * A one-time achievement, drawn full width.
 *
 * The row it replaces gave its headline whatever the reward chips left over —
 * measured at **36px of 398** on «First Speed Boost», i.e. «First Spe…» with
 * the subtitle cut to «Upgrad…». Here the text owns the row's width and the
 * rewards sit underneath it, so nothing about a badge is a guess.
 */
export function AchievementTaskRow({
  task,
  onClaim,
  highlightToken,
  className,
  style,
}: AchievementTaskRowProps) {
  const t = useAppTranslations();
  const localized = useLocalized();
  const navigateToTask = useTaskNavigate();

  const isReady = task.status === TaskStatus.READY_TO_CLAIM;
  const isLocked = task.status === TaskStatus.LOCKED;
  const isCompleted = task.status === TaskStatus.COMPLETED;
  const hasDestination = taskHasDestination(task);
  const showProgress = task.progress.target > 1 && !isCompleted && !isLocked;
  const pct =
    task.progress.target > 0
      ? Math.min(100, Math.round((task.progress.current / task.progress.target) * 100))
      : 0;

  const accent = taskRarityAccentColors[task.rarity];

  const handleClick = () => {
    if (isLocked || isCompleted) return;
    if (isReady) {
      onClaim(task);
      return;
    }
    navigateToTask(task);
  };

  return (
    <div
      style={style}
      onClick={handleClick}
      role="button"
      aria-disabled={isLocked || isCompleted}
      className={twMerge(
        'bg-background-overlay relative overflow-hidden rounded-2xl border border-white/8 p-3 transition-all',
        isLocked && 'opacity-60',
        isCompleted && 'opacity-80',
        !isLocked && !isCompleted && 'cursor-pointer active:scale-[0.99]',
        className
      )}
    >
      <SectionShine token={highlightToken ?? null} />

      {/* The rarity light, same trick the full-size task card uses: it says
          «gold» before any label does, without adding a coloured outline to
          every row of a thirty-row list. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          background: `radial-gradient(75% 90% at 8% 0%, ${accent}${isCompleted ? '14' : '26'} 0%, transparent 70%)`,
        }}
      />

      <div className="relative z-2 flex items-start gap-3">
        <div className="relative shrink-0">
          <span
            className="flex-center size-12 rounded-xl border"
            style={{ borderColor: `${accent}44`, background: `${accent}12` }}
          >
            <Image
              src={taskRarityBadgeSrc[task.rarity]}
              alt=""
              width={72}
              height={72}
              className="size-9 object-contain"
              style={{ opacity: isLocked ? 0.45 : 1 }}
            />
          </span>
          {isCompleted && (
            <span className="flex-center bg-background border-success absolute -right-1 -bottom-1 size-5 rounded-full border">
              <Check size={10} className="text-success" />
            </span>
          )}
          {isLocked && (
            <span className="flex-center bg-background absolute -right-1 -bottom-1 size-5 rounded-full border border-white/10">
              <Lock size={10} className="text-white/60" />
            </span>
          )}
          {isReady && <ClaimableDot className="absolute -top-1 -right-1" size="sm" />}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-start gap-2">
            <h4 className="line-clamp-2 min-w-0 flex-1 text-[13.5px] leading-snug font-extrabold">
              {localized(task.title)}
            </h4>
            <span
              className="shrink-0 rounded-full px-1.5 py-0.5 text-[8px] leading-none font-extrabold tracking-widest uppercase"
              style={{ color: accent, background: `${accent}18`, border: `1px solid ${accent}40` }}
            >
              {t(`rarity ${task.rarity}`)}
            </span>
          </div>

          {(task.subtitle || task.unlockHint) && (
            <p className="line-clamp-1 text-[11px] leading-tight text-white/50">
              {localized(isLocked && task.unlockHint ? task.unlockHint : task.subtitle)}
            </p>
          )}

          <div className="mt-0.5 flex items-end gap-2">
            <TaskRewardRow
              rewards={task.rewards}
              tier={task.tier}
              size="sm"
              className="min-w-0 flex-1 gap-1"
            />

            {isReady ? (
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  onClaim(task);
                }}
                // `relative` is load-bearing: `tap-target` hangs its 44×44 zone
                // on an absolute `::after`, which anchors to the nearest
                // positioned ancestor — without this the zone lands on the card.
                className="bg-pink-gradient animate-task-pulse flex-center tap-target relative shrink-0 gap-1 rounded-full px-3 py-1.5 text-[11px] leading-none font-bold text-white active:scale-95"
              >
                <Gift size={12} />
                {t('claim')}
              </button>
            ) : isCompleted ? (
              <span className="text-success shrink-0 text-[10px] font-bold tracking-wider uppercase">
                {t('claimed')}
              </span>
            ) : hasDestination && !isLocked ? (
              <span className="flex-center border-electric-pink/30 bg-electric-pink/15 size-7 shrink-0 rounded-full border">
                <ChevronRight size={13} className="text-electric-pink" strokeWidth={2.5} />
              </span>
            ) : null}
          </div>

          {showProgress && (
            <div className="mt-1 flex items-center gap-2">
              <Progress
                percentage={pct}
                className="h-1 flex-1"
                classNames={{ bar: 'bg-pink-gradient' }}
              />
              <span className="shrink-0 text-[10px] font-semibold text-white/45 tabular-nums">
                {task.progress.current}/{task.progress.target}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
