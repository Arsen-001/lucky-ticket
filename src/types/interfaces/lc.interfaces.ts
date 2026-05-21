import type { LcTransactionDirection, LcTransactionType } from '@/types/enums/lc.enums';

export interface LcState {
  balance: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
  /** Net change in the last 24h (positive = earned more than spent). */
  change24h: number;
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

export interface ConvertLcToTonRequest {
  /** LC to convert into TON. */
  lcAmount: number;
}

export interface ConvertLcToTonResponse {
  success: boolean;
  /** LC debited from the balance. */
  lcSpent: number;
  /** TON credited to the wallet balance. */
  tonCredited: number;
}
