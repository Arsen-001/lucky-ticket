'use client';
import { ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { AchievementGrid } from '@/components/shared/achievements/AchievementGrid';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { routes } from '@/constants/routes';
import { AchievementRarity } from '@/types/enums/achievement.enums';
import type { Achievement as AchievementType } from '@/types/interfaces/achievement.interfaces';

const PREVIEW_LIMIT = 3;

const rarityWeight: Record<AchievementRarity, number> = {
  [AchievementRarity.DIAMOND_PLUS]: 6,
  [AchievementRarity.DIAMOND]: 5,
  [AchievementRarity.PLATINUM]: 4,
  [AchievementRarity.GOLD]: 3,
  [AchievementRarity.SILVER]: 2,
  [AchievementRarity.BRONZE]: 1,
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
    <section className="flex flex-col gap-2.5">
      <header className="flex items-center justify-between px-1">
        <div className="flex items-baseline gap-2">
          <h3 className="text-base font-extrabold text-white">{t('badge collection')}</h3>
          <span className="text-[11px] font-bold tabular-nums text-white/45">
            {totalEarned}/{totalAchievements}
          </span>
        </div>
        {isOwn && (
          <Link
            href={routes.profile.achievements}
            className="text-electric-pink flex items-center gap-0.5 text-[11px] font-extrabold uppercase tracking-wider"
          >
            {t('view all')}
            <ChevronRight size={14} />
          </Link>
        )}
      </header>

      {earned.length === 0 ? (
        <div className="bg-background-overlay flex flex-col items-center gap-2 rounded-2xl p-5 text-center">
          <Sparkles size={28} className="text-gold" />
          <p className="text-xs text-white/65">{t('badge collection empty')}</p>
        </div>
      ) : (
        <div className="bg-background-overlay rounded-2xl p-3">
          <AchievementGrid achievements={earned} onClick={onTapAchievement} />
        </div>
      )}
    </section>
  );
}
