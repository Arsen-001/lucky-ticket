import { mockDb } from '@/mock/backend/db';
import { LcTransactionDirection, LcTransactionType } from '@/types/enums/lc.enums';

/**
 * Moves money on the shared mock player, the way the real backend does.
 *
 * Every spend on the live backend moves `user.coins` or `user.telegramStars`
 * and writes a ledger row, and the Mini App refreshes all four surfaces that
 * draw them (see `src/api/balance-tags.ts`). In dev those refetches used to come
 * back with the SAME number for most purchases — the market, gift, engine and
 * extra-ad handlers all answered `{}` without touching `mockDb`, and the tasks
 * fixture credited a private balance of its own — so the header moved only where
 * an optimistic patch happened to exist, while /lc, /stars and /wallet kept
 * quoting the pre-purchase balance. The disagreement was pure mock, but it is
 * exactly the bug the balance groups exist to prevent, which made the two
 * impossible to tell apart on localhost.
 *
 * Floors at zero rather than refusing: the mock still has no affordability check
 * anywhere (any purchase in dev succeeds), and that is a separate gap — this
 * only makes the numbers move.
 */
export interface MockBalanceMove {
  /** LC. */
  lc?: number;
  /** Lucky Stars. */
  stars?: number;
  /** Activity points — credits only; nothing in the app spends AP. */
  ap?: number;
  /** Ledger row text. LC only: the mock has no Stars ledger to write to. */
  description?: string;
  type?: LcTransactionType;
  sourceId?: string;
}

let ledgerSeq = 0;

const writeLcRow = (
  amount: number,
  direction: LcTransactionDirection,
  { description = 'Purchase', type = LcTransactionType.MARKET_PURCHASE, sourceId }: MockBalanceMove
) => {
  // Newest first — `getLcTransactions` serves this array in order.
  mockDb.lc.transactions.unshift({
    id: `lctx_mock_${++ledgerSeq}`,
    type,
    direction,
    amount,
    description,
    createdAt: new Date().toISOString(),
    balanceAfter: mockDb.user.coins,
    sourceId,
  });
};

/** Debit a purchase. */
export const chargeMockUser = (move: MockBalanceMove) => {
  const { lc = 0, stars = 0 } = move;
  if (stars > 0) mockDb.user.telegramStars = Math.max(0, mockDb.user.telegramStars - stars);
  if (lc <= 0) return;
  mockDb.user.coins = Math.max(0, mockDb.user.coins - lc);
  mockDb.lc.lifetimeSpent += lc;
  writeLcRow(lc, LcTransactionDirection.DEBIT, move);
};

/** Credit a reward (task claim, ad view, prize). */
export const creditMockUser = (move: MockBalanceMove) => {
  const { lc = 0, stars = 0, ap = 0 } = move;
  if (stars > 0) mockDb.user.telegramStars += stars;
  if (ap > 0) mockDb.user.activityPoints += ap;
  if (lc <= 0) return;
  mockDb.user.coins += lc;
  mockDb.lc.lifetimeEarned += lc;
  writeLcRow(lc, LcTransactionDirection.CREDIT, {
    type: LcTransactionType.TASK_REWARD,
    description: 'Reward',
    ...move,
  });
};
