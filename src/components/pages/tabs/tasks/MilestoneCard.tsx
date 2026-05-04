'use client';

import { useRouter } from 'next/navigation';
import Image, { type StaticImageData } from 'next/image';
import { Check, ChevronRight, Gift, Lock, type LucideIcon, Trophy, TrendingUp } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { Button } from '@/components/shared/buttons/Button';
import { Progress } from '@/components/shared/Progress';
import { Ticket as TicketImage } from '@/components/shared/icons/Ticket';
import { Medal, type MedalType } from '@/components/shared/icons/Medal';
import { TaskRarity, TaskStatus } from '@/types/enums/tasks.enums';
import type { TicketType } from '@/types/types/ticket.types';
import type { Task } from '@/types/interfaces/tasks.interfaces';
import { type Route, routes } from '@/constants/routes';
import { formatCompact } from '@/utils/global/number.utils';
import { TaskRewardRow } from './TaskRewardRow';

const RARITY_FRAME: Record<TaskRarity, string> = {
  [TaskRarity.COMMON]: 'task-card-default',
  [TaskRarity.RARE]: 'task-card-rarity-rare',
  [TaskRarity.EPIC]: 'task-card-rarity-epic',
  [TaskRarity.LEGENDARY]: 'task-card-rarity-legendary',
};

export interface MilestoneCardProps {
  task: Task;
  onClaim: (task: Task) => void;
  active: boolean;
  unitLabel: string;
  numberIcon?: LucideIcon;
  cardIconType?: TicketType;
  cardMedalType?: MedalType;
  cardImageSrc?: StaticImageData | string;
  cardLucideIcon?: LucideIcon;
  cardLucideGradient?: string;
}

/**
 * One card inside a milestone slider. Renders the target value, asset icon,
 * progress, rewards, and the claim/lock CTA appropriate for the task's status.
 */
export function MilestoneCard({
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
}: MilestoneCardProps) {
  const t = useAppTranslations();
  const router = useRouter();

  const isReady = task.status === TaskStatus.READY_TO_CLAIM;
  const isLocked = task.status === TaskStatus.LOCKED;
  const isCompleted = task.status === TaskStatus.COMPLETED;
  const showProgress = task.progress.target > 1 && !isCompleted && !isLocked;
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
    if (task.deeplink) {
      router.push(task.deeplink as Route);
      return;
    }
    if (task.externalLink) {
      window.open(task.externalLink, '_blank', 'noopener,noreferrer');
    }
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
              {formatCompact(task.progress.target)}
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
              {formatCompact(task.progress.target)}
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
              {formatCompact(task.progress.target)}
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
              {formatCompact(task.progress.target)}
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
        ) : !isReady && (task.deeplink || task.externalLink) ? (
          <div className="flex-center w-6 h-6 rounded-full bg-electric-pink/15 border border-electric-pink/30 shrink-0">
            <ChevronRight size={12} className="text-electric-pink" strokeWidth={2.5} />
          </div>
        ) : null}
      </div>

      {/* Number block — for asset variants only the unit label remains; otherwise show big number + label */}
      {cardIconType || cardMedalType || cardImageSrc || CardLucideIcon ? (
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">
          {unitLabel}
        </span>
      ) : NumberIcon ? (
        <div className="flex flex-col gap-0.5">
          <span className="text-2xl font-extrabold leading-none bg-gradient-to-r from-gold via-electric-pink to-electric-purple bg-clip-text text-transparent">
            {formatCompact(task.progress.target)}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">
            {unitLabel}
          </span>
        </div>
      ) : (
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-extrabold leading-none bg-gradient-to-r from-gold via-electric-pink to-electric-purple bg-clip-text text-transparent">
            {formatCompact(task.progress.target)}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">
            {unitLabel}
          </span>
        </div>
      )}

      {/* Subtitle */}
      {task.subtitle && (
        <p className="text-[10px] text-white/50 leading-tight line-clamp-2">{task.subtitle}</p>
      )}

      {/* Rewards */}
      <TaskRewardRow rewards={task.rewards} size="sm" className="flex-wrap gap-1 mt-auto" />

      {/* Progress */}
      {showProgress && (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center justify-between text-[10px] text-white/50 font-semibold tabular-nums">
            <span>
              {formatCompact(task.progress.current)}/{formatCompact(task.progress.target)}
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
