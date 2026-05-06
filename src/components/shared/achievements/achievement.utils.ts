import { AchievementCategory, AchievementRarity } from '@/types/enums/achievement.enums';
import type { Achievement } from '@/types/interfaces/achievement.interfaces';
import type { MessageIds } from '@/types/types/i18n.types';

export const rarityLabelKey = (rarity: AchievementRarity): MessageIds => {
  return `rarity ${rarity}` as MessageIds;
};

export const categoryLabelKey = (category: AchievementCategory): MessageIds => {
  return `category ${category}` as MessageIds;
};

export type ChainVisibility = 'visible' | 'coming-soon' | 'hidden';

const CHAIN_VISIBLE_AHEAD = 3;

export const computeChainEarnedPosition = (
  chainId: string,
  achievements: Achievement[]
): number => {
  let max = 0;
  for (const a of achievements) {
    if (!a.series || a.series.id !== chainId) continue;
    if (!a.earned) continue;
    if (a.series.position > max) max = a.series.position;
  }
  return max;
};

export const getChainVisibility = (
  achievement: Achievement,
  allAchievements: Achievement[]
): ChainVisibility => {
  if (!achievement.series) return 'visible';
  const earnedPos = computeChainEarnedPosition(achievement.series.id, allAchievements);
  const baseVisible = Math.max(earnedPos, 1);
  const lastVisiblePosition = baseVisible + CHAIN_VISIBLE_AHEAD;
  const comingSoonPosition = lastVisiblePosition + 1;

  if (achievement.series.position <= lastVisiblePosition) return 'visible';
  if (achievement.series.position === comingSoonPosition) return 'coming-soon';
  return 'hidden';
};
