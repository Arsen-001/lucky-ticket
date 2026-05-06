/**
 * Tier domain — shared between mock, frontend, and (eventually) backend.
 * Used for tournament gating, master task aggregation, and VIP progression.
 */
export type TierName = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export const TIER_RANK: Record<TierName, number> = {
  bronze: 1,
  silver: 2,
  gold: 3,
  platinum: 4,
  diamond: 5,
};

/**
 * Reward multiplier applied to milestone rewards (tasks) and chain rewards (badges)
 * to express tier difficulty. Used by tournament tasks (`tasks.mock.ts`) and tier-aware
 * achievement chains (`achievement-chains.ts`).
 */
export const TIER_REWARD_MULTIPLIER: Record<TierName, number> = {
  bronze: 1.0,
  silver: 1.5,
  gold: 2.0,
  platinum: 3.0,
  diamond: 4.0,
};

export const isTierAtOrAbove = (userTier: TierName, requiredTier: TierName): boolean =>
  TIER_RANK[userTier] >= TIER_RANK[requiredTier];

export const tierLabel = (tier: TierName): string => tier.charAt(0).toUpperCase() + tier.slice(1);
