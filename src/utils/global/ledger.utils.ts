import dayjs from 'dayjs';
import { formatLocalDate } from '@/utils/global/date.utils';
import { formatRelativeTime } from '@/utils/pages/wallet.utils';
import type { Dictionary } from '@/types/types/i18n.types';

/**
 * The shape every ledger row shares, whatever currency it moves: when it
 * happened, how much, which way, and what the balance stood at afterwards.
 *
 * The LC and Lucky Stars ledgers carry their own enums for direction and type,
 * so `credit` is a plain boolean here — the caller translates its own enum once
 * instead of this module knowing both.
 */
export interface LedgerEntry {
  createdAt: string;
  amount: number;
  balanceAfter: number;
  credit: boolean;
}

export interface LedgerDay<T> {
  /** `YYYY-MM-DD` — the group key, not display text. @see ledgerDayLabel */
  key: string;
  rows: T[];
}

/**
 * Splits a ledger into calendar days, preserving its newest-first order.
 * Relies on that order: rows of one day are contiguous, so a single pass with a
 * running key is enough and nothing needs sorting.
 */
export const groupLedgerByDay = <T extends { createdAt: string }>(rows: T[]): LedgerDay<T>[] => {
  const days: LedgerDay<T>[] = [];

  rows.forEach(row => {
    const key = dayjs(row.createdAt).format('YYYY-MM-DD');
    const current = days.at(-1);

    if (current?.key === key) current.rows.push(row);
    else days.push({ key, rows: [row] });
  });

  return days;
};

/**
 * Row timestamp inside a day-grouped list. "2 d ago" under a header that
 * already says the date is noise; the clock time is the part the header cannot
 * carry. Today keeps the relative form, where "18 min ago" is the useful read.
 */
export const ledgerRowTime = (iso: string, t: Dictionary): string => {
  const date = dayjs(iso);
  return date.isSame(dayjs(), 'day') ? formatRelativeTime(iso, t) : date.format('HH:mm');
};

export const ledgerDayLabel = (key: string, t: Dictionary): string => {
  const day = dayjs(key);
  const today = dayjs().startOf('day');

  if (day.isSame(today, 'day')) return t('today');
  if (day.isSame(today.subtract(1, 'day'), 'day')) return t('yesterday');
  return formatLocalDate(day.toDate());
};

/** What the day added up to — positive when more came in than went out. */
export const ledgerDayNet = (rows: LedgerEntry[]): number =>
  rows.reduce((sum, row) => sum + (row.credit ? row.amount : -row.amount), 0);

/** Closing balance per calendar day — the newest row of a day carries it. */
const closingBalanceByDay = (rows: LedgerEntry[]): Map<string, number> => {
  const closing = new Map<string, number>();

  rows.forEach(row => {
    const key = dayjs(row.createdAt).format('YYYY-MM-DD');
    if (!closing.has(key)) closing.set(key, row.balanceAfter);
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
export const dailyBalanceSeries = (
  rows: LedgerEntry[],
  currentBalance: number,
  days = 7
): number[] => {
  const oldest = rows.at(-1);
  if (!oldest) return [];

  const closing = closingBalanceByDay(rows);
  const windowStart = dayjs()
    .startOf('day')
    .subtract(days - 1, 'day');

  // The balance before the ledger's oldest row — derivable from that row alone,
  // and the only honest starting value for days older than any transaction.
  let carried = oldest.credit
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

  // The live balance wins the last point: the ledger page can be minutes stale
  // against the number printed above the curve, and a curve that ends somewhere
  // else than the balance reads as a bug in the balance.
  series[series.length - 1] = currentBalance;
  return series;
};
