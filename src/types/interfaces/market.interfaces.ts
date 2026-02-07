import type { TicketType } from '@/components/shared/icons/Ticket';
import {
  MarketItemRequirementType,
  MarketPriceType,
  type TicketBoostType,
} from '@/types/enums/market.enums';

export interface MarketPrice {
  priceType: MarketPriceType;
  count: number;
}

export interface MarketRequirement {
  requirementType: MarketItemRequirementType;
  count: number;
}

export interface MarketItemBase {
  title: string;
  price: MarketPrice | MarketPriceType[];
  subscriptionHours?: number;
  requirements?: MarketRequirement[];
  availableCount?: number;
  unavailable?: boolean;
  finishDate?: string;
  isNew?: boolean;
  isPopular?: boolean;
}

export interface MarketBoost {
  id: string;
  type: TicketBoostType;
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
