import { twMerge } from 'tailwind-merge';
import type { TaskReward } from '@/types/interfaces/tasks.interfaces';
import { TaskRewardBadge } from './TaskRewardBadge';

export interface TaskRewardRowProps {
  rewards: TaskReward[];
  /** Tier of the owning task — decides which ticket a ticket reward draws. */
  tier?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function TaskRewardRow({ rewards, tier, size = 'md', className }: TaskRewardRowProps) {
  if (!rewards.length) return null;
  return (
    <div className={twMerge('flex flex-wrap items-center gap-1', className)}>
      {rewards.map((reward, i) => (
        <TaskRewardBadge key={`${reward.type}-${i}`} reward={reward} tier={tier} size={size} />
      ))}
    </div>
  );
}
