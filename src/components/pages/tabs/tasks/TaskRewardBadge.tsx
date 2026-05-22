import { twMerge } from 'tailwind-merge';
import { Coins, Sparkles, Star, Ticket, Trophy } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { BoltIcon } from '@/components/shared/icons/BoltIcon';
import { TaskRewardType } from '@/types/enums/tasks.enums';
import type { TaskReward } from '@/types/interfaces/tasks.interfaces';

export interface TaskRewardBadgeProps {
  reward: TaskReward;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ICON_MAP: Record<Exclude<TaskRewardType, TaskRewardType.ACTIVITY_POINTS>, LucideIcon> = {
  [TaskRewardType.LC]: Coins,
  [TaskRewardType.TICKETS]: Ticket,
  [TaskRewardType.STARS]: Star,
  [TaskRewardType.PREMIUM]: Sparkles,
  [TaskRewardType.ENGINE]: Trophy,
};

const COLOR_MAP: Record<TaskRewardType, string> = {
  [TaskRewardType.LC]: 'text-gold',
  [TaskRewardType.TICKETS]: 'text-electric-pink',
  [TaskRewardType.ACTIVITY_POINTS]: 'text-teal',
  [TaskRewardType.STARS]: 'text-warning',
  [TaskRewardType.PREMIUM]: 'text-pink',
  [TaskRewardType.ENGINE]: 'text-platinum',
};

const SIZE_MAP = {
  sm: { icon: 12, text: 'text-[11px]', padding: 'px-1.5 py-0.5 gap-1' },
  md: { icon: 14, text: 'text-xs', padding: 'px-2 py-0.5 gap-1' },
  lg: { icon: 16, text: 'text-sm', padding: 'px-2.5 py-1 gap-1.5' },
};

export function TaskRewardBadge({ reward, size = 'md', className }: TaskRewardBadgeProps) {
  const cfg = SIZE_MAP[size];
  const Icon = reward.type !== TaskRewardType.ACTIVITY_POINTS ? ICON_MAP[reward.type] : null;
  return (
    <div
      className={twMerge(
        'inline-flex items-center rounded-full bg-white/5 font-semibold tabular-nums',
        cfg.padding,
        cfg.text,
        COLOR_MAP[reward.type],
        className
      )}
    >
      {Icon ? <Icon size={cfg.icon} className="shrink-0" /> : <BoltIcon size={cfg.icon + 6} />}
      <span>+{reward.amount}</span>
    </div>
  );
}
