import { StarsTransactionDirection, StarsTransactionFilter } from '@/types/enums/stars.enums';
import type { LedgerEntry } from '@/utils/global/ledger.utils';
import type { StarsTransaction } from '@/types/interfaces/stars.interfaces';

/** Lucky Stars rows in the shape the shared ledger helpers read. */
export const starsAsLedger = (transactions: StarsTransaction[]): LedgerEntry[] =>
  transactions.map(tx => ({
    createdAt: tx.createdAt,
    amount: tx.amount,
    balanceAfter: tx.balanceAfter,
    credit: tx.direction === StarsTransactionDirection.CREDIT,
  }));

export const filterStarsTransactions = (
  transactions: StarsTransaction[],
  filter: StarsTransactionFilter
): StarsTransaction[] => {
  switch (filter) {
    case StarsTransactionFilter.EARN:
      return transactions.filter(tx => tx.direction === StarsTransactionDirection.CREDIT);
    case StarsTransactionFilter.SPEND:
      return transactions.filter(tx => tx.direction === StarsTransactionDirection.DEBIT);
    default:
      return transactions;
  }
};

/**
 * What the loaded ledger adds up to, both ways.
 *
 * Read off the rows on screen rather than from `lifetimeEarned` / `lifetimeSpent`:
 * those cover all time, and printing them over a list of the last few days
 * would put two different periods side by side without saying so.
 */
export const starsLedgerTotals = (
  transactions: StarsTransaction[]
): { earned: number; spent: number } =>
  transactions.reduce(
    (totals, tx) =>
      tx.direction === StarsTransactionDirection.CREDIT
        ? { ...totals, earned: totals.earned + tx.amount }
        : { ...totals, spent: totals.spent + tx.amount },
    { earned: 0, spent: 0 }
  );
