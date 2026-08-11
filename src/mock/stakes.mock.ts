import type { FetchArgs } from '@reduxjs/toolkit/query';
import { StakeStatus } from '@/types/enums/stakes.enums';
import type { StakeIdBody, StakesData, StartStakeBody } from '@/types/interfaces/stakes.interfaces';
import { appConfig } from '@/config/app.config';
import { mockDb } from '@/mock/backend/db';
import {
  computeStakeBaseAp,
  computeStakeCancelFee,
  computeStakeCompletionBonusAp,
  computeStakeCompletionStars,
  computeStakeFee,
  computeStakeMonths,
  computeStakeReturnCoins,
  findLevelDef,
  findLevelForDeposit,
} from '@/utils/global/stakes.utils';

const nowIso = () => new Date().toISOString();

/**
 * `stakes` query — composed live from config (levels) + shared backend state.
 * Returns fresh copies so RTK Query detects changes after a mutation mutates
 * `mockDb` in place (identical array refs would be skipped by structural sharing).
 */
const getStakes = (): StakesData => ({
  enabled: true,
  config: {
    aprMinPercent: appConfig.stakes.aprMinPercent,
    aprMaxPercent: appConfig.stakes.aprMaxPercent,
    durationMinMonths: appConfig.stakes.durationMinMonths,
    durationMaxMonths: appConfig.stakes.durationMaxMonths,
    apDivisor: appConfig.stakes.apDivisor,
    apCompletionBonusPercent: appConfig.stakes.apCompletionBonusPercent,
  },
  levels: appConfig.stakes.levels,
  activeStakes: mockDb.stakes.activeStakes.map(s => ({ ...s })),
  history: mockDb.stakes.history.map(h => ({ ...h })),
});

/** POST stakes/start — lock LC from the user balance into a new active stake. */
const startStake = (args: FetchArgs) => {
  const body = (args.body ?? {}) as Partial<StartStakeBody>;
  const amount = body.amount ?? 0;
  // Mirrors the server: the deposit decides the band, `body.level` is ignored.
  // A deposit under the cheapest band opens at level 0 — no band, no boost.
  const level = findLevelForDeposit(appConfig.stakes.levels, amount)?.level ?? 0;
  const months = body.durationMonths ?? appConfig.stakes.durationMinMonths;

  if (amount <= 0 || mockDb.user.coins < amount) {
    return { error: { status: 400, data: 'Insufficient balance' } };
  }

  const isLuckyPlayer = mockDb.user.isLuckyPlayer ?? false;
  const freeStartsUsed = mockDb.user.freeStakeStartsUsed ?? 0;
  const feeBreakdown = computeStakeFee(
    amount,
    months,
    isLuckyPlayer,
    freeStartsUsed,
    mockDb.user.isVIP ?? false,
    mockDb.user.statusPerks
  );

  if (mockDb.user.telegramStars < feeBreakdown.fee) {
    return { error: { status: 400, data: 'Insufficient Stars for stake fee' } };
  }

  mockDb.user.coins -= amount;
  mockDb.user.telegramStars -= feeBreakdown.fee;
  mockDb.user.freeStakeStartsUsed = freeStartsUsed + 1;
  // Base AP credited the moment the stake starts (DOCS §5.3) — retained even if cancelled.
  mockDb.user.activityPoints += computeStakeBaseAp(amount, months);
  const start = Date.now();
  mockDb.stakes.activeStakes.push({
    id: `stake-${start}`,
    level,
    lockedAmount: amount,
    startDate: new Date(start).toISOString(),
    endDate: new Date(start + months * 30 * 86_400_000).toISOString(),
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
  const penalty = computeStakeCancelFee(stake.lockedAmount);
  const cancelMonths = computeStakeMonths(stake.startDate, stake.endDate);
  // Cancel keeps the base AP that was credited on start (DOCS §5.3) — record it for history.
  const baseApKept = computeStakeBaseAp(stake.lockedAmount, cancelMonths);

  mockDb.user.coins += stake.lockedAmount;
  mockDb.user.telegramStars = Math.max(0, mockDb.user.telegramStars - penalty);
  mockDb.stakes.history.unshift({
    id: `h-${Date.now()}`,
    level: stake.level,
    amount: stake.lockedAmount,
    durationMonths: cancelMonths,
    yieldLC: 0,
    bonusLS: 0,
    apAwarded: baseApKept,
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
  const levelDef = findLevelDef(appConfig.stakes.levels, stake.level);
  const months = computeStakeMonths(stake.startDate, stake.endDate);
  const yieldLC = computeStakeReturnCoins(
    stake.lockedAmount,
    months,
    mockDb.user.isLuckyPlayer ?? false,
    mockDb.user.isVIP ?? false,
    undefined,
    // The mock stands in for the server, so it has to credit the same status and
    // band boosts the screens quote — otherwise dev pays out a different number
    // than it promised, and only production notices.
    mockDb.user.statusPerks,
    levelDef?.yieldBoostPct ?? 0
  );
  const bonusLS = computeStakeCompletionStars(months, levelDef);

  const completionBonusAp = computeStakeCompletionBonusAp(stake.lockedAmount, months);
  const baseAp = computeStakeBaseAp(stake.lockedAmount, months);

  mockDb.user.coins += stake.lockedAmount + yieldLC;
  mockDb.user.telegramStars += bonusLS;
  // Completion bonus AP on top of the base granted at start (DOCS §5.3 / §18.3).
  mockDb.user.activityPoints += completionBonusAp;
  mockDb.stakes.history.unshift({
    id: `h-${Date.now()}`,
    level: stake.level,
    amount: stake.lockedAmount,
    durationMonths: months,
    yieldLC,
    bonusLS,
    apAwarded: baseAp + completionBonusAp,
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
