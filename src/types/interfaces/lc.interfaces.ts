import type { LcTransactionDirection, LcTransactionType } from '@/types/enums/lc.enums';

export interface LcState {
  balance: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
  /** Net change in the last 24h (positive = earned more than spent). */
  change24h: number;
  /** Stars-to-LC exchange rate (1 Star = X LC). */
  starsToLcRate: number;
}

export interface LcTransaction {
  id: string;
  type: LcTransactionType;
  direction: LcTransactionDirection;
  amount: number;
  description: string;
  createdAt: string;
  balanceAfter: number;
  /** Optional pointer back to the source entity (tournament id, market listing, etc.). */
  sourceId?: string;
}

export interface ConvertStarsToLcRequest {
  stars: number;
}

export interface ConvertStarsToLcResponse {
  success: boolean;
  starsSpent: number;
  lcCredited: number;
}
