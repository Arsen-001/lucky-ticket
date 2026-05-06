import {
  AchievementCategory,
  AchievementRarity,
  AchievementShape,
} from '@/types/enums/achievement.enums';
import type { Achievement } from '@/types/interfaces/achievement.interfaces';
import { type TierName, TIER_REWARD_MULTIPLIER, tierLabel } from '@/types/types/tier.types';

type Sextuple = [number, number, number, number, number, number];

export interface ChainRewardConfig {
  lc: Sextuple;
  tickets: Sextuple;
  activityPoints: Sextuple;
  ls: Sextuple;
}

export interface ChainConfig {
  id: string;
  name: string;
  category: AchievementCategory;
  iconCode: string;
  symbolMeaning: string;
  unitLabel: string;
  thresholds: Sextuple;
  current?: number;
  earnedThrough?: number;
  earnedAtIso?: string;
  holdersPercents?: Sextuple;
  descriptions?: [string, string, string, string, string, string];
  rewards?: ChainRewardConfig;
  mythicPlusLevel?: number;
  mythicPlusMax?: number;
  infinite?: boolean;
}

const RARITY_ORDER: AchievementRarity[] = [
  AchievementRarity.COMMON,
  AchievementRarity.RARE,
  AchievementRarity.EPIC,
  AchievementRarity.LEGENDARY,
  AchievementRarity.MYTHIC,
  AchievementRarity.MYTHIC_PLUS,
];

const SHAPE_FALLBACK = AchievementShape.CIRCLE;

/**
 * Reward progression mirrors task milestone math (`tasks.mock.ts`):
 *   COMMON      → AP only                       (entry tier)
 *   RARE        → AP + small LC                 (task RARE shape)
 *   EPIC        → AP + LC + tickets             (task EPIC shape)
 *   LEGENDARY   → bigger AP + LC + tickets      (task LEGENDARY shape — tasks cap here)
 *   MYTHIC      → adds Lucky Stars (LS)         (badge-only tier)
 *   MYTHIC_PLUS → endless tier, peak payout     (badge-only tier)
 *
 * Numbers grow ~3x per rarity, the same geometric shape used in tasks.
 */
const DEFAULT_REWARDS: ChainRewardConfig = {
  lc: [0, 10, 50, 200, 1000, 5000],
  tickets: [0, 0, 3, 10, 40, 150],
  activityPoints: [100, 250, 600, 1500, 4000, 10000],
  ls: [0, 0, 0, 0, 25, 100],
};

const DEFAULT_HOLDERS: Sextuple = [60, 22, 6, 1.2, 0.15, 0.01];

const buildDescription = (
  threshold: number,
  unit: string,
  rarity: AchievementRarity,
  isMythicPlus: boolean
): string => {
  if (isMythicPlus) {
    return `Endless tier — every level adds ${threshold.toLocaleString()} more ${unit}.`;
  }
  if (rarity === AchievementRarity.COMMON) {
    return threshold === 1
      ? `Reach ${unit} for the first time.`
      : `Reach ${threshold.toLocaleString()} ${unit}.`;
  }
  return `Reach ${threshold.toLocaleString()} ${unit}.`;
};

export const scaleChainRewards = (
  rewards: ChainRewardConfig,
  multiplier: number
): ChainRewardConfig => {
  const scale = (s: Sextuple): Sextuple =>
    s.map(v => (v === 0 ? 0 : Math.max(1, Math.round(v * multiplier)))) as Sextuple;
  return {
    lc: scale(rewards.lc),
    tickets: scale(rewards.tickets),
    activityPoints: scale(rewards.activityPoints),
    ls: scale(rewards.ls),
  };
};

export const buildChain = (config: ChainConfig): Achievement[] => {
  const rewards = config.rewards ?? DEFAULT_REWARDS;
  const holders = config.holdersPercents ?? DEFAULT_HOLDERS;
  const earnedThrough = config.earnedThrough ?? 0;
  const current = config.current ?? 0;

  return RARITY_ORDER.map((rarity, index) => {
    const isMythicPlus = rarity === AchievementRarity.MYTHIC_PLUS;
    const threshold = config.thresholds[index];
    const earned = index < earnedThrough;

    const description =
      config.descriptions?.[index] ??
      buildDescription(threshold, config.unitLabel, rarity, isMythicPlus);

    const a: Achievement = {
      id: `${config.id}-${rarity}`,
      name: config.name,
      description,
      symbolMeaning: config.symbolMeaning,
      category: config.category,
      rarity,
      shape: SHAPE_FALLBACK,
      iconCode: config.iconCode,
      earned,
      earnedAt: earned ? (config.earnedAtIso ?? '2025-10-01T10:00:00.000Z') : undefined,
      progress: { current, target: threshold },
      series: { id: config.id, name: config.name, position: index + 1, total: 6 },
      chainReward: {
        lc: rewards.lc[index],
        tickets: rewards.tickets[index],
        activityPoints: rewards.activityPoints[index],
        ls: rewards.ls[index],
      },
      holdersPercentage: holders[index],
      isPinned: false,
      hidden: false,
      shareable: true,
      ...(isMythicPlus && {
        tier: {
          current: config.mythicPlusLevel ?? 0,
          max: config.infinite ? 0 : (config.mythicPlusMax ?? 100),
          thresholds: [],
        },
      }),
    };

    return a;
  });
};

export interface TierChainConfig extends Omit<
  ChainConfig,
  'id' | 'name' | 'rewards' | 'thresholds'
> {
  baseId: string;
  baseName: string;
  tier: TierName;
  /**
   * Base thresholds for the bronze tier. Higher tiers reuse the same thresholds
   * (so milestones feel consistent) but reward more (via `TIER_REWARD_MULTIPLIER`).
   */
  thresholds: Sextuple;
  baseRewards?: ChainRewardConfig;
}

/**
 * Generates a 6-rarity chain whose rewards are scaled by `TIER_REWARD_MULTIPLIER[tier]`.
 *
 * Mirrors the task-side `buildTierPlaceMilestones` / `buildTierParticipationMilestones`
 * pattern: same milestone shape, rewards multiplied by tier difficulty.
 */
export const buildTierChain = (config: TierChainConfig): Achievement[] => {
  const multiplier = TIER_REWARD_MULTIPLIER[config.tier];
  const baseRewards = config.baseRewards ?? DEFAULT_REWARDS;
  return buildChain({
    ...config,
    id: `${config.baseId}-${config.tier}`,
    name: `${tierLabel(config.tier)} ${config.baseName}`,
    rewards: scaleChainRewards(baseRewards, multiplier),
  });
};
