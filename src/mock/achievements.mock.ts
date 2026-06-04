import {
  AchievementCategory,
  AchievementRarity,
  AchievementShape,
} from '@/types/enums/achievement.enums';
import type {
  Achievement,
  AchievementCatalogResponse,
} from '@/types/interfaces/achievement.interfaces';
import { buildChain, type ChainConfig } from '@/mock/achievement-chains';
import { appConfig } from '@/config/app.config';

const make = (a: Partial<Achievement> & Pick<Achievement, 'id' | 'name'>): Achievement => ({
  description: a.name,
  category: AchievementCategory.STATUS,
  rarity: AchievementRarity.BRONZE,
  shape: AchievementShape.CIRCLE,
  earned: false,
  holdersPercentage: 50,
  isPinned: false,
  hidden: false,
  shareable: true,
  ...a,
});

const chainConfigs: ChainConfig[] = [
  // ─── Tournaments ───
  {
    id: 'first-place',
    name: 'First Place',
    category: AchievementCategory.TOURNAMENTS,
    iconCode: 'trophy',
    symbolMeaning: 'Golden cup — victory and reward.',
    unitLabel: 'wins',
    thresholds: [1, 5, 25, 100, 500, 1000],
    current: 2,
    earnedThrough: 1,
    earnedAtIso: '2025-11-20T10:00:00.000Z',
  },
  {
    id: 'second-place',
    name: 'Second Place',
    category: AchievementCategory.TOURNAMENTS,
    iconCode: 'medal',
    symbolMeaning: 'Silver medal — one step from the top.',
    unitLabel: '2nd place finishes',
    thresholds: [1, 5, 25, 100, 500, 1000],
    current: 4,
    earnedThrough: 1,
  },
  {
    id: 'third-place',
    name: 'Third Place',
    category: AchievementCategory.TOURNAMENTS,
    iconCode: 'award',
    symbolMeaning: 'Bronze podium — every step counts.',
    unitLabel: '3rd place finishes',
    thresholds: [1, 5, 25, 100, 500, 1000],
    current: 7,
    earnedThrough: 1,
  },
  {
    id: 'tournaments-played',
    name: 'Tournaments Played',
    category: AchievementCategory.TOURNAMENTS,
    iconCode: 'target',
    symbolMeaning: 'Arena — every match writes your story.',
    unitLabel: 'tournaments',
    thresholds: [3, 15, 50, 200, 1000, 3000],
    current: 12,
    earnedThrough: 1,
  },

  // ─── Tickets ───
  {
    id: 'ticket-score',
    name: 'Ticket Score',
    category: AchievementCategory.TICKETS,
    iconCode: 'ticket',
    symbolMeaning: 'Bronze=1pt · Silver=3pt · Gold=5pt · Platinum=10pt · Diamond=25pt',
    unitLabel: 'ticket score',
    thresholds: [100, 1000, 5000, 20000, 100000, 500000],
    current: 42000,
    earnedThrough: 4,
    infinite: true,
  },

  // ─── Stakes ───
  {
    id: 'stake-hodler',
    name: 'Vault Keeper',
    category: AchievementCategory.STAKES,
    iconCode: 'vault',
    symbolMeaning: 'Vault sealed — time and coins held in trust.',
    unitLabel: 'LC staked',
    thresholds: [1000, 10000, 100000, 500000, 2000000, 10000000],
    current: 42000,
    earnedThrough: 2,
    infinite: true,
  },

  // ─── Activity Points ───
  {
    id: 'ap-earned',
    name: 'Energy Burst',
    category: AchievementCategory.ACTIVITY_POINTS,
    iconCode: 'zap',
    symbolMeaning: 'Sparks of activity — fuel of progress.',
    unitLabel: 'AP earned',
    thresholds: [50, 250, 1000, 5000, 25000, 100000],
    current: 750,
    earnedThrough: 2,
  },

  // ─── Tasks ───
  {
    id: 'daily-tasks',
    name: 'Daily Hero',
    category: AchievementCategory.TASKS,
    iconCode: 'sun',
    symbolMeaning: 'Tick — every task done is luck earned. Daily grind never ends.',
    unitLabel: 'daily tasks completed',
    thresholds: [10, 50, 250, 1000, 5000, 20000],
    current: 42,
    earnedThrough: 1,
    infinite: true,
  },
];

const chainAchievements: Achievement[] = chainConfigs.flatMap(buildChain);

const demoAchievements: Achievement[] = [
  // ─── Status — VIP levels 1–6 (Bronze → Diamond+) ───
  make({
    id: 'vip-1',
    name: 'VIP I',
    description: 'Unlock VIP status — Level 1.',
    category: AchievementCategory.STATUS,
    rarity: AchievementRarity.BRONZE,
    shape: AchievementShape.SHIELD,
    iconCode: 'gem',
    earned: true,
    earnedAt: '2025-10-25T18:00:00.000Z',
    holdersPercentage: 14,
    isPinned: true,
    pinnedSlot: 2,
    isCollagePinned: true,
    collageSlot: 1,
    series: { id: 'vip', name: 'VIP Levels', position: 1, total: 6 },
  }),
  make({
    id: 'vip-2',
    name: 'VIP II',
    description: 'Reach VIP Level 2.',
    category: AchievementCategory.STATUS,
    rarity: AchievementRarity.SILVER,
    shape: AchievementShape.SHIELD,
    iconCode: 'gem',
    earned: true,
    earnedAt: '2025-11-08T10:00:00.000Z',
    holdersPercentage: 10,
    series: { id: 'vip', name: 'VIP Levels', position: 2, total: 6 },
  }),
  make({
    id: 'vip-3',
    name: 'VIP III',
    description: 'Reach VIP Level 3.',
    category: AchievementCategory.STATUS,
    rarity: AchievementRarity.GOLD,
    shape: AchievementShape.SHIELD,
    iconCode: 'sparkles',
    earned: true,
    earnedAt: '2025-11-28T14:30:00.000Z',
    holdersPercentage: 7,
    series: { id: 'vip', name: 'VIP Levels', position: 3, total: 6 },
  }),
  make({
    id: 'vip-4',
    name: 'VIP IV',
    description: 'Reach VIP Level 4.',
    category: AchievementCategory.STATUS,
    rarity: AchievementRarity.PLATINUM,
    shape: AchievementShape.SHIELD,
    iconCode: 'crown',
    earned: false,
    progress: { current: 0, target: 1 },
    holdersPercentage: 4,
    series: { id: 'vip', name: 'VIP Levels', position: 4, total: 6 },
  }),
  make({
    id: 'vip-5',
    name: 'VIP V',
    description: 'Reach VIP Level 5.',
    category: AchievementCategory.STATUS,
    rarity: AchievementRarity.DIAMOND,
    shape: AchievementShape.SHIELD,
    iconCode: 'crown',
    earned: false,
    progress: { current: 0, target: 1 },
    holdersPercentage: 1.5,
    series: { id: 'vip', name: 'VIP Levels', position: 5, total: 6 },
  }),
  make({
    id: 'vip-6',
    name: 'VIP VI',
    description: 'Reach VIP Level 6 — the apex of status.',
    category: AchievementCategory.STATUS,
    rarity: AchievementRarity.DIAMOND_PLUS,
    shape: AchievementShape.SHIELD,
    iconCode: 'crown',
    earned: false,
    progress: { current: 0, target: 1 },
    holdersPercentage: 0.2,
    series: { id: 'vip', name: 'VIP Levels', position: 6, total: 6 },
  }),

  ...chainAchievements,
];

const fresh = appConfig.account.fresh;

// Level-zero: nothing earned or showcased yet — definitions kept intact (the
// rich, earned demo lives in `demoAchievements`).
export const achievements: Achievement[] = fresh
  ? demoAchievements.map(achievement => ({
      ...achievement,
      earned: false,
      earnedAt: undefined,
      isPinned: false,
      pinnedSlot: undefined,
      isCollagePinned: false,
      collageSlot: undefined,
      progress: achievement.progress
        ? { ...achievement.progress, current: 0 }
        : achievement.progress,
    }))
  : demoAchievements;

const earnedCount = achievements.filter(a => a.earned).length;

export const achievementsCatalog: AchievementCatalogResponse = {
  total: achievements.length,
  earned: earnedCount,
  achievements,
};

export const achievementsMock = {
  achievements: achievementsCatalog,
};
