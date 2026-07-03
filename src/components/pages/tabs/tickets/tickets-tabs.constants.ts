import { TicketsEnum } from '@/types/enums/ticket.enums';
import type { TicketType } from '@/types/types/ticket.types';

export const PARTNERS_TAB_KEY = 'partners' as const;

export type TicketsTabKey = TicketType | typeof PARTNERS_TAB_KEY;

export const TICKETS_TIER_ORDER: TicketType[] = [
  TicketsEnum.BRONZE,
  TicketsEnum.SILVER,
  TicketsEnum.GOLD,
  TicketsEnum.PLATINUM,
  TicketsEnum.DIAMOND,
];

export interface TicketsTierTab {
  key: TicketsTabKey;
  /** Engines with a claimable (pending) cycle in this tier. */
  count: number;
  locked?: boolean;
}
