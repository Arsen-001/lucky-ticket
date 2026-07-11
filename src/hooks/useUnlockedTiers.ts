import { useGetMeQuery } from '@/api/me.api';
import { activityTierOrder, computeActivityTier } from '@/constants/global.constants';
import { TicketsEnum } from '@/types/enums/ticket.enums';
import type { TicketType } from '@/types/types/ticket.types';

const TIER_RANK: Record<TicketType, number> = {
  bronze: 0,
  silver: 1,
  gold: 2,
  platinum: 3,
  diamond: 4,
};

export interface UseUnlockedTiersResult {
  unlockedTiers: TicketType[];
  maxUnlockedTier: TicketType;
  isTierUnlocked: (tier: TicketType) => boolean;
}

/**
 * Tier gate, keyed to the player's AP tier (Section 5.2 of the economy spec).
 * A tier-`T` item is unlocked when the player's AP tier is `T` or higher.
 */
export function useUnlockedTiers(): UseUnlockedTiersResult {
  const { data: me } = useGetMeQuery();
  const apTier = computeActivityTier(
    me?.activityPoints ?? 0,
    me?.referralsCount ?? 0
  ) as TicketType;
  const maxRank = TIER_RANK[apTier];

  const unlockedTiers = activityTierOrder.filter(
    tier => TIER_RANK[tier as TicketType] <= maxRank
  ) as TicketType[];

  const isTierUnlocked = (tier: TicketType) => TIER_RANK[tier] <= maxRank;

  return {
    unlockedTiers: unlockedTiers.length ? unlockedTiers : [TicketsEnum.BRONZE],
    maxUnlockedTier: apTier,
    isTierUnlocked,
  };
}
