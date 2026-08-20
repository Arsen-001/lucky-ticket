import {
  dailyBalanceSeries,
  groupLedgerByDay,
  ledgerDayLabel,
  ledgerRowTime,
} from '@/utils/global/ledger.utils';
import {
  LcTransactionDirection,
  LcTransactionFilter,
  LcTransactionType,
} from '@/types/enums/lc.enums';
import type { LedgerEntry } from '@/utils/global/ledger.utils';
import type { Dictionary } from '@/types/types/i18n.types';
import type { LcTransaction } from '@/types/interfaces/lc.interfaces';

/** LC rows in the shape the shared ledger helpers read. */
const asLedger = (transactions: LcTransaction[]): LedgerEntry[] =>
  transactions.map(tx => ({
    createdAt: tx.createdAt,
    amount: tx.amount,
    balanceAfter: tx.balanceAfter,
    credit: tx.direction === LcTransactionDirection.CREDIT,
  }));

/**
 * The three ledger rows that move LC between currencies rather than earning or
 * spending it. They are their own filter tab, and they must be excluded from
 * both of the others — a `CONVERT_TO_TON` is a debit, but calling it "spend"
 * would double-count money that only changed shape.
 */
const CONVERT_TYPES = new Set<LcTransactionType>([
  LcTransactionType.CONVERT_FROM_STARS,
  LcTransactionType.CONVERT_TO_STARS,
  LcTransactionType.CONVERT_TO_TON,
]);

export const isLcConvert = (transaction: LcTransaction): boolean =>
  CONVERT_TYPES.has(transaction.type);

export const filterLcTransactions = (
  transactions: LcTransaction[],
  filter: LcTransactionFilter
): LcTransaction[] => {
  switch (filter) {
    case LcTransactionFilter.EARN:
      return transactions.filter(
        tx => tx.direction === LcTransactionDirection.CREDIT && !isLcConvert(tx)
      );
    case LcTransactionFilter.SPEND:
      return transactions.filter(
        tx => tx.direction === LcTransactionDirection.DEBIT && !isLcConvert(tx)
      );
    case LcTransactionFilter.CONVERT:
      return transactions.filter(isLcConvert);
    default:
      return transactions;
  }
};

export interface LcTransactionDay {
  /** `YYYY-MM-DD` — the group key, not display text. @see lcDayLabel */
  key: string;
  transactions: LcTransaction[];
}

/**
 * Splits the ledger into calendar days, newest first.
 *
 * The walk itself lives in `groupLedgerByDay` — the Lucky Stars screen groups
 * its own ledger exactly the same way, and two copies of "are these rows the
 * same day" is how the two screens start disagreeing about what "yesterday"
 * means.
 */
export const groupLcTransactionsByDay = (transactions: LcTransaction[]): LcTransactionDay[] =>
  groupLedgerByDay(transactions).map(day => ({ key: day.key, transactions: day.rows }));

/** @see ledgerRowTime */
export const lcRowTime = (iso: string, t: Dictionary): string => ledgerRowTime(iso, t);

/** @see ledgerDayLabel */
export const lcDayLabel = (key: string, t: Dictionary): string => ledgerDayLabel(key, t);

/**
 * Balance at the end of each of the last `days` days, oldest → newest, with the
 * live balance as the final point. @see dailyBalanceSeries
 */
export const lcDailyBalanceSeries = (
  transactions: LcTransaction[],
  currentBalance: number,
  days = 7
): number[] => dailyBalanceSeries(asLedger(transactions), currentBalance, days);
