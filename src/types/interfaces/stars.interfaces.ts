import type { StarsTransactionDirection, StarsTransactionType } from '@/types/enums/stars.enums';

export interface StarsState {
  balance: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
  /** Net change in the last 24h (positive = earned more than spent). */
  change24h: number;
}

export interface StarsTransaction {
  id: string;
  type: StarsTransactionType;
  direction: StarsTransactionDirection;
  amount: number;
  description: string;
  createdAt: string;
  balanceAfter: number;
  /** Optional pointer back to the source entity (stake id, market listing, etc.). */
  sourceId?: string;
}
