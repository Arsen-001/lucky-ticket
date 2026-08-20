import { describe, expect, it } from 'vitest';
import dayjs from 'dayjs';
import {
  dailyBalanceSeries,
  groupLedgerByDay,
  ledgerDayNet,
  type LedgerEntry,
} from '@/utils/global/ledger.utils';
import { lcDailyBalanceSeries } from '@/utils/pages/lc.utils';
import { LcTransactionDirection, LcTransactionType } from '@/types/enums/lc.enums';
import type { LcTransaction } from '@/types/interfaces/lc.interfaces';

/**
 * The LC screen and the Lucky Stars screen draw the same balance curve, group
 * the ledger into the same days and print the same day totals — from one
 * implementation, since 21.08.2026. These are the properties both screens read
 * as truth, pinned here so a change made for one currency cannot quietly move
 * the other.
 */

const at = (daysAgo: number, hour = 12): string =>
  dayjs().startOf('day').subtract(daysAgo, 'day').add(hour, 'hour').toISOString();

/** Newest first — the order both ledgers arrive in. */
const rows: LedgerEntry[] = [
  { createdAt: at(0, 21), amount: 500, balanceAfter: 1500, credit: true },
  { createdAt: at(0, 9), amount: 200, balanceAfter: 1000, credit: false },
  { createdAt: at(2, 18), amount: 700, balanceAfter: 1200, credit: true },
];

describe('ledger day grouping', () => {
  it('keeps one group per calendar day, newest first', () => {
    const days = groupLedgerByDay(rows);

    expect(days.map(day => day.rows.length)).toEqual([2, 1]);
    expect(days[0].key).toBe(dayjs().format('YYYY-MM-DD'));
    expect(days[1].key).toBe(dayjs().subtract(2, 'day').format('YYYY-MM-DD'));
  });

  it('nets a day by direction, not by row count', () => {
    expect(ledgerDayNet(groupLedgerByDay(rows)[0].rows)).toBe(300);
    expect(ledgerDayNet(groupLedgerByDay(rows)[1].rows)).toBe(700);
  });
});

describe('daily balance series', () => {
  it('returns nothing for an empty ledger', () => {
    // A flat line would claim a week of history that was never recorded.
    expect(dailyBalanceSeries([], 1000)).toEqual([]);
  });

  it('carries a quiet day forward instead of dropping to zero', () => {
    const series = dailyBalanceSeries(rows, 1500);

    expect(series).toHaveLength(7);
    // Day −1 had no rows: the balance stayed where day −2 closed it.
    expect(series[5]).toBe(1200);
    expect(series.some(point => point === 0)).toBe(false);
  });

  it('ends on the live balance, not on the newest row', () => {
    // The ledger query can be minutes stale against the number printed above
    // the curve, and a curve ending elsewhere reads as a broken balance.
    expect(dailyBalanceSeries(rows, 4242).at(-1)).toBe(4242);
  });

  it('opens the window from the balance BEFORE the oldest row', () => {
    const single: LedgerEntry[] = [
      { createdAt: at(6, 10), amount: 300, balanceAfter: 800, credit: true },
    ];
    expect(dailyBalanceSeries(single, 800)[0]).toBe(800);

    const debit: LedgerEntry[] = [
      { createdAt: at(6, 10), amount: 300, balanceAfter: 500, credit: false },
    ];
    // 500 after spending 300 means the day opened at 800.
    expect(dailyBalanceSeries(debit, 500)[0]).toBe(500);
  });
});

describe('LC still reads the shared implementation', () => {
  it('matches the generic series row for row', () => {
    const lcRows: LcTransaction[] = rows.map((row, index) => ({
      id: `tx-${index}`,
      type: LcTransactionType.TASK_REWARD,
      direction: row.credit ? LcTransactionDirection.CREDIT : LcTransactionDirection.DEBIT,
      amount: row.amount,
      description: 'row',
      createdAt: row.createdAt,
      balanceAfter: row.balanceAfter,
    }));

    expect(lcDailyBalanceSeries(lcRows, 1500)).toEqual(dailyBalanceSeries(rows, 1500));
  });
});
