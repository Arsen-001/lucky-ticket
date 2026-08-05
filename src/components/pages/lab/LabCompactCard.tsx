'use client';

import { type CSSProperties, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowUpRight,
  Check,
  ChevronRight,
  Clock3,
  Gift,
  Hash,
  type LucideIcon,
  Lock,
  Send,
  Share2,
  Twitter,
  Youtube,
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Button } from '@/components/shared/buttons/Button';
import { TaskCategoryIcon } from '@/components/pages/tabs/tasks/TaskCategoryIcon';
import { TaskRewardRow } from '@/components/pages/tabs/tasks/TaskRewardRow';
import { useCountDown } from '@/hooks/useCountDown';
import { useLocalized } from '@/hooks/useLocalized';
import { TaskCategory, TaskStatus } from '@/types/enums/tasks.enums';
import type { Task } from '@/types/interfaces/tasks.interfaces';
import { type Route } from '@/constants/routes';

/**
 * `current` is today's compact row. The rest are the candidates.
 */
export type LabCompactVariant = 'current' | 'headline' | 'stacked' | 'lit';

export interface LabCompactCardProps {
  task: Task;
  onClaim: (task: Task) => void;
  className?: string;
  style?: CSSProperties;
  variant?: LabCompactVariant;
}

/** Category tint for the light behind a lit row — `R G B`. */
const CATEGORY_RGB: Partial<Record<TaskCategory, string>> = {
  [TaskCategory.SOCIAL]: '116 61 245',
  [TaskCategory.ACHIEVEMENTS]: '23 141 136',
  [TaskCategory.PROFILE]: '79 138 130',
  [TaskCategory.PROFILE_STATUS]: '248 189 62',
  [TaskCategory.FRIENDS]: '222 0 155',
};

const SOCIAL_ICON_BY_HOST: { match: RegExp; icon: LucideIcon; gradient: string }[] = [
  { match: /(?:^|\.)t\.me$/i, icon: Send, gradient: 'from-teal to-electric-purple' },
  { match: /(?:^|\.)x\.com$/i, icon: Twitter, gradient: 'from-white/30 to-white/10' },
  { match: /(?:^|\.)twitter\.com$/i, icon: Twitter, gradient: 'from-electric-purple to-pink' },
  {
    match: /(?:^|\.)discord\.(?:gg|com)$/i,
    icon: Hash,
    gradient: 'from-electric-purple to-diamond',
  },
  { match: /(?:^|\.)youtube\.com$/i, icon: Youtube, gradient: 'from-error to-pink' },
];

const resolveSocialIcon = (externalLink?: string) => {
  if (!externalLink) return null;
  let host = '';
  try {
    host = new URL(externalLink).hostname.toLowerCase();
  } catch {
    return null;
  }
  for (const entry of SOCIAL_ICON_BY_HOST) if (entry.match.test(host)) return entry;
  return { icon: Share2, gradient: 'from-pink to-electric-pink' };
};

/**
 * Compact task row — the shape used by one-time tasks in Social, Achievements,
 * Profile and Profile-status. Those lists run to hundreds of rows, which is why
 * the full-size card was not applied to them; the question here is what a row
 * that stays short can still fix.
 *
 * Behaviour matches the live compact row: claim, external link, locked, done,
 * the reset countdown, and a tap on the row that follows the deep link.
 */
export function LabCompactCard({
  task,
  onClaim,
  className,
  style,
  variant = 'current',
}: LabCompactCardProps) {
  const localized = useLocalized();
  const router = useRouter();
  const { leftTime, expired } = useCountDown(task.resetAt);
  const [claimed, setClaimed] = useState(false);

  const isReady = task.status === TaskStatus.READY_TO_CLAIM && !claimed;
  const isLocked = task.status === TaskStatus.LOCKED;
  const isCompleted = task.status === TaskStatus.COMPLETED || claimed;
  const showCountdown = !!task.resetAt && !isLocked && !expired;

  const social =
    task.category === TaskCategory.SOCIAL ? resolveSocialIcon(task.externalLink) : null;
  const rgb = CATEGORY_RGB[task.category] ?? '116 61 245';

  const handleClick = () => {
    if (isLocked) return;
    if (isReady) {
      setClaimed(true);
      onClaim(task);
      return;
    }
    if (isCompleted) return;
    if (task.deeplink) {
      router.push(task.deeplink as Route);
      return;
    }
    if (task.externalLink) window.open(task.externalLink, '_blank', 'noopener,noreferrer');
  };

  const icon = (size: number) =>
    social ? (
      <div
        className={twMerge(
          'flex-center rounded-xl bg-gradient-to-br shadow-md shadow-black/20',
          social.gradient
        )}
        style={{ width: size, height: size }}
      >
        <social.icon size={Math.round(size / 2)} className="text-white" strokeWidth={2.4} />
      </div>
    ) : (
      <TaskCategoryIcon category={task.category} size={Math.round(size / 2)} />
    );

  const control = isReady ? (
    <Button
      className="animate-task-pulse shrink-0 rounded-full px-3 py-1.5 text-[11px] font-extrabold"
      onClick={e => {
        e.stopPropagation();
        handleClick();
      }}
    >
      <Gift size={12} />
    </Button>
  ) : isCompleted ? (
    <span className="flex-center bg-success/20 size-8 shrink-0 rounded-full">
      <Check size={14} className="text-success" />
    </span>
  ) : isLocked ? (
    <span className="flex-center size-8 shrink-0 rounded-full bg-white/5">
      <Lock size={13} className="text-white/40" />
    </span>
  ) : task.externalLink ? (
    <span className="flex-center bg-electric-pink/15 border-electric-pink/30 size-8 shrink-0 rounded-full border">
      <ArrowUpRight size={14} className="text-electric-pink" strokeWidth={2.5} />
    </span>
  ) : (
    <span className="flex-center size-8 shrink-0 rounded-full bg-white/5">
      <ChevronRight size={14} className="text-white/60" />
    </span>
  );

  const frame = twMerge(
    'bg-background-overlay relative overflow-hidden rounded-2xl transition-all',
    variant === 'current' ? 'task-card-default' : 'border border-white/8',
    isLocked && 'opacity-60',
    isCompleted && 'opacity-80',
    className
  );

  const litBackdrop = variant === 'lit' && !isCompleted && (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        background: `radial-gradient(70% 140% at 0% 50%, rgb(${rgb} / 0.26) 0%, transparent 70%)`,
      }}
    />
  );

  const countdown = showCountdown && (
    <span className="pointer-events-none flex shrink-0 items-center gap-1 text-[10px] font-medium text-white/40 tabular-nums">
      <Clock3 size={10} />
      {leftTime}
    </span>
  );

  // ── current: title squeezed between the icon and the reward chips ──────────
  if (variant === 'current') {
    return (
      <div style={style} className={frame} onClick={handleClick} role="button">
        <div className="relative z-[2] flex min-h-[60px] cursor-pointer items-center gap-2.5 py-2 pr-3 pl-1.5 active:scale-[0.99]">
          {icon(32)}
          <h4 className="w-max max-w-full flex-1 truncate text-sm leading-snug font-extrabold">
            {localized(task.title)}
          </h4>
          <TaskRewardRow rewards={task.rewards} size="sm" />
          {control}
        </div>
      </div>
    );
  }

  // ── headline: rewards move under the title, which gets the whole width ─────
  if (variant === 'headline') {
    return (
      <div style={style} className={frame} onClick={handleClick} role="button">
        <div className="relative z-[2] flex min-h-[60px] cursor-pointer items-center gap-2.5 p-2.5 active:scale-[0.99]">
          {icon(36)}
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h4 className="line-clamp-1 text-[13px] leading-tight font-extrabold text-white">
              {localized(task.title)}
            </h4>
            <div className="flex items-center gap-2">
              <TaskRewardRow rewards={task.rewards} size="sm" />
              {countdown}
            </div>
          </div>
          {control}
        </div>
      </div>
    );
  }

  // ── stacked: two lines of title allowed, rewards to the right ─────────────
  if (variant === 'stacked') {
    return (
      <div style={style} className={frame} onClick={handleClick} role="button">
        <div className="relative z-[2] flex min-h-[60px] cursor-pointer items-center gap-2.5 p-2.5 active:scale-[0.99]">
          {icon(36)}
          <h4 className="line-clamp-2 min-w-0 flex-1 text-[13px] leading-snug font-extrabold text-white">
            {localized(task.title)}
          </h4>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <TaskRewardRow rewards={task.rewards} size="sm" />
            {countdown}
          </div>
          {control}
        </div>
      </div>
    );
  }

  // ── lit: headline layout plus the category light and no rarity frame ──────
  return (
    <div style={style} className={frame} onClick={handleClick} role="button">
      {litBackdrop}
      <div className="relative z-[2] flex min-h-[60px] cursor-pointer items-center gap-2.5 p-2.5 active:scale-[0.99]">
        {icon(36)}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h4 className="line-clamp-1 text-[13px] leading-tight font-extrabold text-white">
            {localized(task.title)}
          </h4>
          <div className="flex items-center gap-2">
            <TaskRewardRow rewards={task.rewards} size="sm" />
            {countdown}
          </div>
        </div>
        {control}
      </div>
    </div>
  );
}
