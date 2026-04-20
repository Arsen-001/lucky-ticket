import {
  MarketItemRequirementType,
  MarketPriceType,
  MarketStatusType,
  TicketBoostType,
} from '@/types/enums/market.enums';
import type { TicketType } from '@/types/types/ticket.types';

export interface MarketPrice {
  type: MarketPriceType;
  amount: number;
}

export interface MarketRequirement {
  type: MarketItemRequirementType;
  count: number;
}

export interface MarketItemBase {
  id: string;
  name: string;
  prices: MarketPrice[];
  isNew?: boolean;
}

export interface MarketBoost extends MarketItemBase {
  boostPercentage: number;
  type: TicketBoostType;
  ticketType: TicketType;
  isAvailable?: boolean;
}

export interface MarketTicket extends MarketItemBase {
  ticketType: TicketType;
  isAvailable: boolean;
}

export interface MarketStatus extends MarketItemBase {
  statusType: MarketStatusType;
  privileges: string[];
  requirements?: MarketRequirement[];
  durationDays?: number;
  upgradePrices?: MarketPrice[];
}

export interface MarketData {
  boosts: MarketBoost[];
  tickets: MarketTicket[];
  statuses: MarketStatus[];
}
