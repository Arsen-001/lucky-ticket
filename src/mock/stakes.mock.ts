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
  computeStakeReturnCoins,
  findLevelDef,
  findLevelForDeposit,
  stakeDurationMonths,
} from '@/utils/global/stakes.utils';

const nowIso = () => new Date().toISOString();

/**
 * `stakes` query — composed live from config (levels) + shared backend state.
 * Returns fresh copies so RTK Query detects changes after a mutation mutates
 * `mockDb` in place (identical array refs would be skipped by structural sharing).
 *
 * `durationMonths` and `matured` are sent on every active stake because the real
 * `StakesService.getData` sends them: without them here, dev only ever exercises
 * the client-side fallbacks and a drift between the two goes unseen until prod.
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
  activeStakes: mockDb.stakes.activeStakes.map(s => ({
    ...s,
    durationMonths: stakeDurationMonths(s),
    matured: new Date(s.endDate).getTime() <= Date.now(),
  })),
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

  // Base AP credited the moment the stake starts (DOCS §5.3) — and clawed back
  // in full if the stake is cancelled, so it is stamped on the row too.
  const apAwarded = computeStakeBaseAp(amount, months);

  mockDb.user.coins -= amount;
  mockDb.user.telegramStars -= feeBreakdown.fee;
  mockDb.user.freeStakeStartsUsed = freeStartsUsed + 1;
  mockDb.user.activityPoints += apAwarded;
  const start = Date.now();
  // Calendar months, like `end.setMonth(end.getMonth() + n)` on the server —
  // not `n × 30 days`, which drifts a full month past ~30 months.
  const end = new Date(start);
  end.setMonth(end.getMonth() + months);
  const id = `stake-${start}`;
  mockDb.stakes.activeStakes.push({
    id,
    level,
    lockedAmount: amount,
    durationMonths: months,
    startDate: new Date(start).toISOString(),
    endDate: end.toISOString(),
    status: StakeStatus.ACTIVE,
    claimed: false,
  });

  // The full server shape, not a bare `{ success }` — the "stake opened" screen
  // shows the band and end date the SERVER settled on, so a config change
  // mid-session cannot leave it quoting a level the stake does not have.
  return {
    data: {
      success: true,
      id,
      level,
      lockedAmount: amount,
      endDate: end.toISOString(),
      feeStars: feeBreakdown.fee,
      apAwarded,
    },
  };
};

/** POST stakes/cancel — refund the locked LC, charge a Stars penalty, archive. */
const cancelStake = (args: FetchArgs) => {
  const { stakeId } = (args.body ?? {}) as Partial<StakeIdBody>;
  const idx = mockDb.stakes.activeStakes.findIndex(s => s.id === stakeId);
  if (idx === -1) return { error: { status: 404, data: 'Stake not found' } };

  const [stake] = mockDb.stakes.activeStakes.splice(idx, 1);
  const penalty = computeStakeCancelFee(stake.lockedAmount);
  const cancelMonths = stakeDurationMonths(stake);
  const baseAp = computeStakeBaseAp(stake.lockedAmount, cancelMonths);
  // Cancel REVOKES the base AP credited at start (DOCS §18.3) — floored at the
  // current balance so AP decay in between cannot push it below zero. The mock
  // used to keep it, which is how the cancel sheet came to promise the player
  // AP that production takes away.
  const apRevoked = Math.min(baseAp, mockDb.user.activityPoints);

  mockDb.user.coins += stake.lockedAmount;
  mockDb.user.telegramStars = Math.max(0, mockDb.user.telegramStars - penalty);
  mockDb.user.activityPoints -= apRevoked;
  mockDb.stakes.history.unshift({
    id: `h-${Date.now()}`,
    level: stake.level,
    amount: stake.lockedAmount,
    durationMonths: cancelMonths,
    yieldLC: 0,
    bonusLS: 0,
    // The server leaves the stamped AP on the row rather than zeroing it, so
    // the mock does too — `stakeApKept()` is what stops the UI calling it earned.
    apAwarded: baseAp,
    outcome: 'cancelled',
    completedAt: nowIso(),
  });

  return {
    data: {
      success: true,
      id: stake.id,
      principalReturned: stake.lockedAmount,
      cancelFeeStars: penalty,
      apRevoked,
    },
  };
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
  const months = stakeDurationMonths(stake);
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

  // The full `ClaimStakeResult`. It used to return a bare `{ success: true }`
  // against the very type the endpoint declares, so the claim screen rendered
  // `formatCompact(NaN)` — literally "не число" — for the amount credited, and
  // no one could see this screen work in development.
  return {
    data: {
      success: true,
      id: stake.id,
      principalReturned: stake.lockedAmount,
      yieldLC,
      completionStars: bonusLS,
      apBonus: completionBonusAp,
    },
  };
};

export const stakesMock = {
  stakes: getStakes,
  'POST stakes/start': startStake,
  'POST stakes/cancel': cancelStake,
  'POST stakes/claim': claimStake,
};
