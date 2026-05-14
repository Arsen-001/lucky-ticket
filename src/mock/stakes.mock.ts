import type { FetchArgs } from '@reduxjs/toolkit/query';
import { StakeStatus } from '@/types/enums/stakes.enums';
import type { StakeIdBody, StakesData, StartStakeBody } from '@/types/interfaces/stakes.interfaces';
import { appConfig } from '@/config/app.config';
import { mockDb } from '@/mock/backend/db';

const nowIso = () => new Date().toISOString();

/**
 * `stakes` query — composed live from config (levels) + shared backend state.
 * Returns fresh copies so RTK Query detects changes after a mutation mutates
 * `mockDb` in place (identical array refs would be skipped by structural sharing).
 */
const getStakes = (): StakesData => ({
  levels: appConfig.stakes.levels,
  activeStakes: mockDb.stakes.activeStakes.map(s => ({ ...s })),
  history: mockDb.stakes.history.map(h => ({ ...h })),
});

/** POST stakes/start — lock LC from the user balance into a new active stake. */
const startStake = (args: FetchArgs) => {
  const body = (args.body ?? {}) as Partial<StartStakeBody>;
  const level = body.level ?? 1;
  const amount = body.amount ?? 0;

  if (amount <= 0 || mockDb.user.coins < amount) {
    return { error: { status: 400, data: 'Insufficient balance' } };
  }

  mockDb.user.coins -= amount;
  const start = Date.now();
  mockDb.stakes.activeStakes.push({
    id: `stake-${start}`,
    level,
    lockedAmount: amount,
    startDate: new Date(start).toISOString(),
    endDate: new Date(start + appConfig.stakes.durationHours * 3_600_000).toISOString(),
    status: StakeStatus.ACTIVE,
    claimed: false,
  });

  return { data: { success: true } };
};

/** POST stakes/cancel — refund the locked LC, charge a Stars penalty, archive. */
const cancelStake = (args: FetchArgs) => {
  const { stakeId } = (args.body ?? {}) as Partial<StakeIdBody>;
  const idx = mockDb.stakes.activeStakes.findIndex(s => s.id === stakeId);
  if (idx === -1) return { error: { status: 404, data: 'Stake not found' } };

  const [stake] = mockDb.stakes.activeStakes.splice(idx, 1);
  const penalty = appConfig.stakes.cancelStarsPerLevel * stake.level;

  mockDb.user.coins += stake.lockedAmount;
  mockDb.user.telegramStars = Math.max(0, mockDb.user.telegramStars - penalty);
  mockDb.stakes.history.unshift({
    id: `h-${Date.now()}`,
    level: stake.level,
    amount: stake.lockedAmount,
    ticketsCount: 0,
    bonusLC: 0,
    bonusStars: 0,
    outcome: 'cancelled',
    completedAt: nowIso(),
  });

  return { data: { success: true } };
};

/** POST stakes/claim — pay out rewards for a completed stake, archive it. */
const claimStake = (args: FetchArgs) => {
  const { stakeId } = (args.body ?? {}) as Partial<StakeIdBody>;
  const idx = mockDb.stakes.activeStakes.findIndex(s => s.id === stakeId);
  if (idx === -1) return { error: { status: 404, data: 'Stake not found' } };

  const stake = mockDb.stakes.activeStakes[idx];
  if (new Date(stake.endDate).getTime() > Date.now()) {
    return { error: { status: 400, data: 'Stake not ready' } };
  }

  mockDb.stakes.activeStakes.splice(idx, 1);
  const levelDef = appConfig.stakes.levels.find(l => l.level === stake.level);
  const bonusLC = Math.round(stake.lockedAmount * (appConfig.stakes.aprMaxPercent / 100));
  const bonusStars = levelDef ? Math.round((levelDef.starsMin + levelDef.starsMax) / 2) : 0;

  mockDb.user.coins += stake.lockedAmount + bonusLC;
  mockDb.user.telegramStars += bonusStars;
  mockDb.stakes.history.unshift({
    id: `h-${Date.now()}`,
    level: stake.level,
    amount: stake.lockedAmount,
    ticketsCount: stake.level,
    bonusLC,
    bonusStars,
    outcome: 'completed',
    completedAt: nowIso(),
  });

  return { data: { success: true } };
};

export const stakesMock = {
  stakes: getStakes,
  'POST stakes/start': startStake,
  'POST stakes/cancel': cancelStake,
  'POST stakes/claim': claimStake,
};
