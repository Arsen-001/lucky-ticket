'use client';
import { ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { AchievementGrid } from '@/components/shared/achievements/AchievementGrid';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { routes } from '@/constants/routes';
import { AchievementRarity } from '@/types/enums/achievement.enums';
import type { Achievement as AchievementType } from '@/types/interfaces/achievement.interfaces';
import '@/styles/components/profile.css';

const PREVIEW_LIMIT = 3;

const rarityWeight: Record<AchievementRarity, number> = {
  [AchievementRarity.MYTHIC_PLUS]: 6,
  [AchievementRarity.MYTHIC]: 5,
  [AchievementRarity.LEGENDARY]: 4,
  [AchievementRarity.EPIC]: 3,
  [AchievementRarity.RARE]: 2,
  [AchievementRarity.COMMON]: 1,
};

export interface ProfileBadgesCollectionProps {
  achievements: AchievementType[];
  totalEarned: number;
  totalAchievements: number;
  isOwn?: boolean;
  onTapAchievement?: (achievement: AchievementType) => void;
}

export function ProfileBadgesCollection({
  achievements,
  totalEarned,
  totalAchievements,
  isOwn = true,
  onTapAchievement,
}: ProfileBadgesCollectionProps) {
  const t = useAppTranslations();

  const earned = achievements
    .filter(a => a.earned)
    .sort((a, b) => {
      const rarityDelta = rarityWeight[b.rarity] - rarityWeight[a.rarity];
      if (rarityDelta !== 0) return rarityDelta;
      return (b.earnedAt ?? '').localeCompare(a.earnedAt ?? '');
    })
    .slice(0, PREVIEW_LIMIT);

  return (
    <section className="flex flex-col gap-3">
      <header className="flex items-center justify-between">
        <div className="flex flex-col">
          <h3 className="text-base font-extrabold text-white">{t('badge collection')}</h3>
          <span className="text-[11px] text-white/50 tabular-nums">
            {totalEarned} / {totalAchievements}
          </span>
        </div>
        {isOwn && (
          <Link
            href={routes.profile.achievements}
            className="text-electric-pink flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider"
          >
            {t('view all')}
            <ChevronRight size={12} />
          </Link>
        )}
      </header>

      {earned.length === 0 ? (
        <div className="glass-card flex flex-col items-center gap-2 p-5 text-center">
          <Sparkles size={28} className="text-gold" />
          <p className="text-xs text-white/65">{t('badge collection empty')}</p>
        </div>
      ) : (
        <AchievementGrid achievements={earned} onClick={onTapAchievement} />
      )}
    </section>
  );
}
