import type { FetchArgs } from '@reduxjs/toolkit/query';
import { LcTransactionDirection, LcTransactionType } from '@/types/enums/lc.enums';
import type {
  ConvertLcToTonRequest,
  LcState,
  LcTransaction,
} from '@/types/interfaces/lc.interfaces';
import { mockDb } from '@/mock/backend/db';
import { lcToTon } from '@/utils/global/lc.utils';
import { appConfig } from '@/config/app.config';

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
});

const getTransactions = (): LcTransaction[] => mockDb.lc.transactions.map(tx => ({ ...tx }));

const convertLcToTon = (args: FetchArgs) => {
  const { lcAmount } = (args.body ?? {}) as Partial<ConvertLcToTonRequest>;
  const amount = lcAmount ?? 0;

  // The exit kill switch, mirrored from the backend so the locked state is
  // developable here: LC→TON dies with the TON withdrawal, on one flag.
  if (!appConfig.wallet.withdrawalsEnabled) {
    return { error: { status: 403, data: { error: 'withdrawals-disabled' } } };
  }
  if (amount <= 0) {
    return { error: { status: 400, data: 'Amount must be positive' } };
  }
  if (mockDb.user.coins < amount) {
    return { error: { status: 400, data: 'Insufficient LC balance' } };
  }

  const tonCredited = Number(lcToTon(amount).toFixed(4));
  mockDb.user.coins -= amount;
  mockDb.lc.lifetimeSpent += amount;
  mockDb.wallet.tonBalance = Number((mockDb.wallet.tonBalance + tonCredited).toFixed(4));

  mockDb.lc.transactions.unshift({
    id: `lctx_${Date.now()}`,
    type: LcTransactionType.CONVERT_TO_TON,
    direction: LcTransactionDirection.DEBIT,
    amount,
    description: `Converted ${amount} LC → ${tonCredited} TON`,
    createdAt: new Date().toISOString(),
    balanceAfter: mockDb.user.coins,
  });

  return { data: { success: true, lcSpent: amount, tonCredited } };
};

export const lcMock = {
  lc: getLcState,
  'lc/transactions': getTransactions,
  'POST lc/convert-ton': convertLcToTon,
};
