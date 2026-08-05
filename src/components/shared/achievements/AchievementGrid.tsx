'use client';
import { twMerge } from 'tailwind-merge';
import { AchievementCard } from '@/components/shared/achievements/AchievementCard';
import type { Achievement } from '@/types/interfaces/achievement.interfaces';
import { staggerMs } from '@/utils/global/animation.utils';

export interface AchievementGridProps {
  achievements: Achievement[];
  allAchievements?: Achievement[];
  onClick?: (achievement: Achievement) => void;
  onLongPress?: (achievement: Achievement) => void;
  onPin?: (achievement: Achievement) => void;
  className?: string;
}

export function AchievementGrid({
  achievements,
  onClick,
  onLongPress,
  onPin,
  className,
}: AchievementGridProps) {
  return (
    <div className={twMerge('grid grid-cols-3 items-stretch gap-3', className)}>
      {achievements.map((a, index) => (
        <div
          key={a.id}
          className="animate-slide-in-bottom"
          style={{ animationDelay: `${staggerMs(index, 50)}ms` }}
        >
          <AchievementCard
            achievement={a}
            onClick={onClick ? () => onClick(a) : undefined}
            onLongPress={onLongPress ? () => onLongPress(a) : undefined}
            onPin={onPin ? () => onPin(a) : undefined}
            className="h-full"
          />
        </div>
      ))}
    </div>
  );
}
