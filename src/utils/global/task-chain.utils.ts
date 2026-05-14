import { TaskCategory, TaskFrequency } from '@/types/enums/tasks.enums';
import type { Task, TaskChainContribution } from '@/types/interfaces/tasks.interfaces';
import type { Achievement } from '@/types/interfaces/achievement.interfaces';
import { AchievementRarity } from '@/types/enums/achievement.enums';

const CATEGORY_TO_CHAIN: Partial<Record<TaskCategory, string>> = {
  [TaskCategory.TOURNAMENTS]: 'tournaments-played',
  [TaskCategory.LEADERBOARD]: 'leaderboard-top',
  [TaskCategory.FRIENDS]: 'invite-friends',
  [TaskCategory.SOCIAL]: 'likes-received',
  [TaskCategory.MARKET]: 'tickets-collected',
  [TaskCategory.ENGINES]: 'buy-engine',
  [TaskCategory.TICKETS]: 'tickets-collected',
  [TaskCategory.STAKES]: 'stakes-created',
  [TaskCategory.STARS]: 'ls-spent',
  [TaskCategory.ACHIEVEMENTS]: 'top-3-finishes',
  [TaskCategory.PROFILE]: 'ap-earned',
  [TaskCategory.PROFILE_STATUS]: 'ap-earned',
  [TaskCategory.PARTNERS]: 'ap-earned',
};

export const resolveTaskChain = (task: Task): TaskChainContribution | null => {
  if (task.chainContribution) return task.chainContribution;

  if (task.frequency === TaskFrequency.DAILY) {
    return { chainId: 'daily-tasks', amount: 1 };
  }
  if (task.frequency === TaskFrequency.WEEKLY) {
    return { chainId: 'weekly-tasks', amount: 1 };
  }

  const id = CATEGORY_TO_CHAIN[task.category];
  if (!id) return null;
  return { chainId: id, amount: 1 };
};

const RARITY_DOT_COLOR: Record<AchievementRarity, string> = {
  [AchievementRarity.BRONZE]: '#FFFFFF',
  [AchievementRarity.SILVER]: '#5FE3F5',
  [AchievementRarity.GOLD]: '#A78BFA',
  [AchievementRarity.PLATINUM]: '#F8BD3E',
  [AchievementRarity.DIAMOND]: '#FF5FC8',
  [AchievementRarity.DIAMOND_PLUS]: '#FFD700',
};

export interface ChainStatus {
  chainId: string;
  chainName: string;
  iconCode?: string;
  currentPosition: number;
  totalPositions: number;
  nextTierName: string;
  nextTierRarity: AchievementRarity;
  nextTierDotColor: string;
  current: number;
  target: number;
  percent: number;
  isMaxed: boolean;
}

const RARITY_NAME: Record<AchievementRarity, string> = {
  [AchievementRarity.BRONZE]: 'Bronze',
  [AchievementRarity.SILVER]: 'Silver',
  [AchievementRarity.GOLD]: 'Gold',
  [AchievementRarity.PLATINUM]: 'Platinum',
  [AchievementRarity.DIAMOND]: 'Diamond',
  [AchievementRarity.DIAMOND_PLUS]: 'Diamond+',
};

export const getChainStatus = (
  chainId: string,
  achievements: Achievement[]
): ChainStatus | null => {
  const chainItems = achievements
    .filter(a => a.series?.id === chainId)
    .sort((a, b) => (a.series?.position ?? 0) - (b.series?.position ?? 0));

  if (chainItems.length === 0) return null;

  const earnedThrough = chainItems.reduce(
    (acc, a) => (a.earned && a.series ? Math.max(acc, a.series.position) : acc),
    0
  );

  const nextItem =
    chainItems.find(a => (a.series?.position ?? 0) === earnedThrough + 1) ??
    chainItems[chainItems.length - 1];

  const isMaxed = earnedThrough === chainItems.length;

  return {
    chainId,
    chainName: nextItem.series?.name ?? chainId,
    iconCode: nextItem.iconCode,
    currentPosition: earnedThrough,
    totalPositions: chainItems.length,
    nextTierName: RARITY_NAME[nextItem.rarity] ?? '—',
    nextTierRarity: nextItem.rarity,
    nextTierDotColor: RARITY_DOT_COLOR[nextItem.rarity],
    current: nextItem.progress?.current ?? 0,
    target: nextItem.progress?.target ?? 0,
    percent:
      nextItem.progress && nextItem.progress.target > 0
        ? Math.min(100, (nextItem.progress.current / nextItem.progress.target) * 100)
        : 0,
    isMaxed,
  };
};

export const findClosestUnlocks = (achievements: Achievement[], limit = 3): ChainStatus[] => {
  const chainIds = new Set<string>();
  achievements.forEach(a => a.series && chainIds.add(a.series.id));

  const statuses: ChainStatus[] = [];
  chainIds.forEach(id => {
    const s = getChainStatus(id, achievements);
    if (s && !s.isMaxed) statuses.push(s);
  });

  statuses.sort((a, b) => b.percent - a.percent);
  return statuses.slice(0, limit);
};
