import { twMerge } from 'tailwind-merge';
import type { TaskReward } from '@/types/interfaces/tasks.interfaces';
import { TaskRewardBadge } from './TaskRewardBadge';

export interface TaskRewardRowProps {
  rewards: TaskReward[];
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function TaskRewardRow({ rewards, size = 'md', className }: TaskRewardRowProps) {
  if (!rewards.length) return null;
  return (
    <div className={twMerge('flex flex-wrap items-center gap-1', className)}>
      {rewards.map((reward, i) => (
        <TaskRewardBadge key={`${reward.type}-${i}`} reward={reward} size={size} />
      ))}
    </div>
  );
}
