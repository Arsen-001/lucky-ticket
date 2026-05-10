import { useGetTicketsQuery } from '@/api/tickets.api';
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

export function useUnlockedTiers(): UseUnlockedTiersResult {
  const { data: tickets } = useGetTicketsQuery();

  const unlockedTiers = tickets
    ?.filter(ticket => !ticket.blocked)
    .map(ticket => ticket.ticketType) ?? [TicketsEnum.BRONZE];

  const maxUnlockedTier = unlockedTiers.reduce<TicketType>(
    (acc, tier) => (TIER_RANK[tier] > TIER_RANK[acc] ? tier : acc),
    TicketsEnum.BRONZE
  );

  const isTierUnlocked = (tier: TicketType) => TIER_RANK[tier] <= TIER_RANK[maxUnlockedTier];

  return { unlockedTiers, maxUnlockedTier, isTierUnlocked };
}
