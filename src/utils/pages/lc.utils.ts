import dayjs from 'dayjs';
import {
  LcTransactionDirection,
  LcTransactionFilter,
  LcTransactionType,
} from '@/types/enums/lc.enums';
import { formatLocalDate } from '@/utils/global/date.utils';
import { formatRelativeTime } from '@/utils/pages/wallet.utils';
import type { Dictionary } from '@/types/types/i18n.types';
import type { LcTransaction } from '@/types/interfaces/lc.interfaces';

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
 * Splits the ledger into calendar days, preserving its newest-first order.
 * Relies on that order: rows for one day are contiguous, so a single pass with
 * a running key is enough and no sorting is needed.
 */
export const groupLcTransactionsByDay = (transactions: LcTransaction[]): LcTransactionDay[] => {
  const days: LcTransactionDay[] = [];

  transactions.forEach(transaction => {
    const key = dayjs(transaction.createdAt).format('YYYY-MM-DD');
    const current = days.at(-1);

    if (current?.key === key) current.transactions.push(transaction);
    else days.push({ key, transactions: [transaction] });
  });

  return days;
};

/**
 * Row timestamp inside a day-grouped list. "2 d ago" under a header that
 * already says the date is noise; the clock time is the part the header cannot
 * carry. Today keeps the relative form, where "18 min ago" is the useful read.
 */
export const lcRowTime = (iso: string, t: Dictionary): string => {
  const date = dayjs(iso);
  return date.isSame(dayjs(), 'day') ? formatRelativeTime(iso, t) : date.format('HH:mm');
};

export const lcDayLabel = (key: string, t: Dictionary): string => {
  const day = dayjs(key);
  const today = dayjs().startOf('day');

  if (day.isSame(today, 'day')) return t('today');
  if (day.isSame(today.subtract(1, 'day'), 'day')) return t('yesterday');
  return formatLocalDate(day.toDate());
};

/** Closing balance per calendar day — the newest row of a day carries it. */
const closingBalanceByDay = (transactions: LcTransaction[]): Map<string, number> => {
  const closing = new Map<string, number>();

  transactions.forEach(transaction => {
    const key = dayjs(transaction.createdAt).format('YYYY-MM-DD');
    if (!closing.has(key)) closing.set(key, transaction.balanceAfter);
  });

  return closing;
};

/**
 * Balance at the end of each of the last `days` days, oldest → newest, with the
 * live balance as the final point.
 *
 * Deliberately per-day rather than per-transaction: a curve plotted straight
 * off the ledger puts equal spacing between rows minutes apart and rows a week
 * apart, so its shape says nothing about time. A day that had no transactions
 * carries the previous day's close forward — that is what the balance did.
 *
 * Returns [] for an empty ledger; the caller renders nothing rather than a flat
 * line implying a week of history that isn't there.
 */
export const lcDailyBalanceSeries = (
  transactions: LcTransaction[],
  currentBalance: number,
  days = 7
): number[] => {
  const oldest = transactions.at(-1);
  if (!oldest) return [];

  const closing = closingBalanceByDay(transactions);
  const windowStart = dayjs()
    .startOf('day')
    .subtract(days - 1, 'day');

  // The balance before the ledger's oldest row — derivable from that row alone,
  // and the only honest starting value for days older than any transaction.
  let carried =
    oldest.direction === LcTransactionDirection.CREDIT
      ? oldest.balanceAfter - oldest.amount
      : oldest.balanceAfter + oldest.amount;

  // Days that fall before the window still move the balance, so the first point
  // is what the player held that morning — not the opening of the whole log.
  [...closing.entries()]
    .filter(([key]) => dayjs(key).isBefore(windowStart, 'day'))
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([, close]) => {
      carried = close;
    });

  const series = Array.from({ length: days }, (_, index) => {
    const close = closing.get(windowStart.add(index, 'day').format('YYYY-MM-DD'));
    if (close !== undefined) carried = close;
    return carried;
  });

  // Today's close is the live balance, not the last row of the ledger: a claim
  // or a purchase that happened after the transactions query still shows.
  series[series.length - 1] = currentBalance;

  return series;
};
