import type { FetchArgs } from '@reduxjs/toolkit/query';
import { LcTransactionDirection, LcTransactionType } from '@/types/enums/lc.enums';
import type {
  ConvertStarsToLcRequest,
  LcState,
  LcTransaction,
} from '@/types/interfaces/lc.interfaces';
import { mockDb } from '@/mock/backend/db';

const HOUR_MS = 3_600_000;

/** Net change in the last 24h derived from the transaction log. */
const compute24hChange = (): number => {
  const since = Date.now() - 24 * HOUR_MS;
  return mockDb.lc.transactions.reduce((sum, tx) => {
    if (new Date(tx.createdAt).getTime() < since) return sum;
    return sum + (tx.direction === LcTransactionDirection.CREDIT ? tx.amount : -tx.amount);
  }, 0);
};

const getLcState = (): LcState => ({
  balance: mockDb.user.coins,
  lifetimeEarned: mockDb.lc.lifetimeEarned,
  lifetimeSpent: mockDb.lc.lifetimeSpent,
  change24h: compute24hChange(),
  starsToLcRate: mockDb.lc.starsToLcRate,
});

const getTransactions = (): LcTransaction[] => mockDb.lc.transactions.map(tx => ({ ...tx }));

const convertStarsToLc = (args: FetchArgs) => {
  const { stars } = (args.body ?? {}) as Partial<ConvertStarsToLcRequest>;
  const amount = stars ?? 0;
  if (amount <= 0) {
    return { error: { status: 400, data: 'Stars amount must be positive' } };
  }
  if (mockDb.user.telegramStars < amount) {
    return { error: { status: 400, data: 'Insufficient Stars balance' } };
  }

  const lcCredited = amount * mockDb.lc.starsToLcRate;
  mockDb.user.telegramStars -= amount;
  mockDb.user.coins += lcCredited;
  mockDb.lc.lifetimeEarned += lcCredited;

  mockDb.lc.transactions.unshift({
    id: `lctx_${Date.now()}`,
    type: LcTransactionType.CONVERT_FROM_STARS,
    direction: LcTransactionDirection.CREDIT,
    amount: lcCredited,
    description: `Converted ${amount} Stars → ${lcCredited} LC`,
    createdAt: new Date().toISOString(),
    balanceAfter: mockDb.user.coins,
  });

  return { data: { success: true, starsSpent: amount, lcCredited } };
};

export const lcMock = {
  lc: getLcState,
  'lc/transactions': getTransactions,
  'POST lc/convert': convertStarsToLc,
};
