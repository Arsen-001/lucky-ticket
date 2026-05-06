'use client';
import { twMerge } from 'tailwind-merge';
import { AchievementCard } from '@/components/shared/achievements/AchievementCard';
import { getChainVisibility } from '@/components/shared/achievements/achievement.utils';
import type { Achievement } from '@/types/interfaces/achievement.interfaces';

export interface AchievementGridProps {
  achievements: Achievement[];
  allAchievements?: Achievement[];
  onClick?: (achievement: Achievement) => void;
  onLongPress?: (achievement: Achievement) => void;
  className?: string;
}

export function AchievementGrid({
  achievements,
  allAchievements,
  onClick,
  onLongPress,
  className,
}: AchievementGridProps) {
  const pool = allAchievements ?? achievements;

  return (
    <div className={twMerge('grid grid-cols-3 gap-3', className)}>
      {achievements.map((a, index) => {
        const visibility = getChainVisibility(a, pool);
        return (
          <div
            key={a.id}
            className="animate-slide-in-bottom"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <AchievementCard
              achievement={a}
              onClick={onClick ? () => onClick(a) : undefined}
              onLongPress={onLongPress ? () => onLongPress(a) : undefined}
              comingSoon={visibility === 'coming-soon'}
              className="w-full"
            />
          </div>
        );
      })}
    </div>
  );
}
