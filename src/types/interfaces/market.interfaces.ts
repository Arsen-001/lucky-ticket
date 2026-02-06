import type { TicketType } from '@/components/shared/icons/Ticket';
import type { BoostType } from '@/types/enums/market.enums';

export interface MarketBoost {
  id: string;
  type: BoostType;
  ticketType: TicketType;
  multiplier: number;
  durationInHours: number;
  price: number;
}

export interface MarketTicket {
  id: string;
  ticketType: TicketType;
  price: number;
}

export interface MarketStatus {
  id: string;
  statusType: 'prime' | 'vip';
  price: number;
  priceCurrency: 'LTC' | 'USD'; // Prime can be purchased with LTC or crypto
  durationInDays: number;
  benefits: string[];
  requirements?: {
    minActivityPoints: number;
  };
}

export interface MarketData {
  boosts: MarketBoost[];
  tickets: MarketTicket[];
  statuses: MarketStatus[];
}
