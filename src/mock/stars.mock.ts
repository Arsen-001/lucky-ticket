import { StarsTransactionDirection, StarsTransactionType } from '@/types/enums/stars.enums';
import type { StarsState, StarsTransaction } from '@/types/interfaces/stars.interfaces';
import { mockDb } from '@/mock/backend/db';

const HOUR_MS = 3_600_000;

/** Static sample history for dev — the real backend serves the StarsTransaction ledger. */
const buildTransactions = (): StarsTransaction[] => {
  const now = Date.now();
  const bal = mockDb.user.telegramStars;
  const rows: Omit<StarsTransaction, 'balanceAfter'>[] = [
    {
      id: 'stx_1',
      type: StarsTransactionType.PURCHASE,
      direction: StarsTransactionDirection.CREDIT,
      amount: 898,
      description: 'Bought 898 Lucky Stars',
      createdAt: new Date(now - 2 * HOUR_MS).toISOString(),
    },
    {
      id: 'stx_2',
      type: StarsTransactionType.ENGINE_SKIP,
      direction: StarsTransactionDirection.DEBIT,
      amount: 12,
      description: 'Engine skip',
      createdAt: new Date(now - 20 * HOUR_MS).toISOString(),
    },
    {
      id: 'stx_3',
      type: StarsTransactionType.STAKE_REWARD,
      direction: StarsTransactionDirection.CREDIT,
      amount: 6,
      description: 'Stake completion (level 2)',
      createdAt: new Date(now - 30 * HOUR_MS).toISOString(),
    },
    {
      id: 'stx_4',
      type: StarsTransactionType.SHOWCASE_SLOT,
      direction: StarsTransactionDirection.DEBIT,
      amount: 50,
      description: 'Showcase slot',
      createdAt: new Date(now - 3 * 24 * HOUR_MS).toISOString(),
    },
    {
      id: 'stx_5',
      type: StarsTransactionType.PROMO,
      direction: StarsTransactionDirection.CREDIT,
      amount: 10,
      description: 'Promo code WELCOME2026',
      createdAt: new Date(now - 5 * 24 * HOUR_MS).toISOString(),
    },
    {
      id: 'stx_6',
      type: StarsTransactionType.AD_EXTRA_VIEWS,
      direction: StarsTransactionDirection.DEBIT,
      amount: 1,
      description: 'Extra ad views · 1',
      createdAt: new Date(now - 6 * 24 * HOUR_MS).toISOString(),
    },
  ];

  // Walk backwards from the current balance so balanceAfter stays consistent.
  let running = bal;
  return rows.map(r => {
    const balanceAfter = running;
    running += r.direction === StarsTransactionDirection.CREDIT ? -r.amount : r.amount;
    return { ...r, balanceAfter };
  });
};

const getTransactions = (): StarsTransaction[] => buildTransactions();

const getState = (): StarsState => {
  const txs = buildTransactions();
  const since = Date.now() - 24 * HOUR_MS;
  const sum = (dir: StarsTransactionDirection, recentOnly = false) =>
    txs
      .filter(
        tx => tx.direction === dir && (!recentOnly || new Date(tx.createdAt).getTime() >= since)
      )
      .reduce((s, tx) => s + tx.amount, 0);
  return {
    balance: mockDb.user.telegramStars,
    lifetimeEarned: sum(StarsTransactionDirection.CREDIT),
    lifetimeSpent: sum(StarsTransactionDirection.DEBIT),
    change24h:
      sum(StarsTransactionDirection.CREDIT, true) - sum(StarsTransactionDirection.DEBIT, true),
  };
};

export const starsMock = {
  stars: getState,
  'stars/transactions': getTransactions,
};
