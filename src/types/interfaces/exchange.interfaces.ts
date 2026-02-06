import type { ExchangeStatus, ExchangeType } from '@/types/enums/exchnage.enums';

export interface ExchangeOffer {
  id: string;
  type: ExchangeType;
  payAmount: number;
  receivedAmount: number;
}

export interface ExchangeOffers {
  [ExchangeType.LTC_TO_USDT]: ExchangeOffer[];
  [ExchangeType.USDT_TO_LTC]: ExchangeOffer[];
}

export interface ExchangeHistoryItem {
  id: string;
  type: ExchangeType;
  payAmount: number;
  receivedAmount: number;
  date: string;
  status: ExchangeStatus;
}

export interface ExchangeResponse {
  offers: ExchangeOffer[];
  history: ExchangeHistoryItem[];
}
