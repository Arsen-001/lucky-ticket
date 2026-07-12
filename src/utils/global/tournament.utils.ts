import { GlobalConstants } from '@/constants/global.constants';
import { appConfig } from '@/config/app.config';

/**
 * Net LC a placement actually pays out: the prize pool minus the jackpot skim
 * (DOCS §20), times the placement %, floored — mirrors the backend `finish()`
 * distribution (the base prize, before any per-winner VIP/LP status boost).
 */
export const placementPrizeLc = (
  prizePool: number,
  pct: number,
  accrualPercent: number = appConfig.jackpot.accrualPercent
): number => {
  if (!prizePool) return 0;
  const skim = Math.floor((prizePool * accrualPercent) / 100);
  return Math.floor(((prizePool - skim) * pct) / 100);
};

/**
 * Resolves a tournament's top-3 shard rewards: per-tournament overrides win,
 * otherwise the (admin-tunable) default. `total` is the sum of all three — the
 * total shards a tournament distributes, shown on cards next to the prize pool.
 */
export const resolveShardRewards = (
  tournament:
    | { shardsFirst?: number | null; shardsSecond?: number | null; shardsThird?: number | null }
    | undefined,
  defaults: { first: number; second: number; third: number }
): { first: number; second: number; third: number; total: number } => {
  const first = tournament?.shardsFirst ?? defaults.first;
  const second = tournament?.shardsSecond ?? defaults.second;
  const third = tournament?.shardsThird ?? defaults.third;
  return { first, second, third, total: first + second + third };
};

/**
 * Returns the effective LC-reward boost % from status. VIP supersedes LP —
 * the higher-tier value wins, the two never stack.
 */
export const statusTournamentLcBoostPct = (isLp: boolean, isVip: boolean): number => {
  if (isVip) return GlobalConstants.vipTournamentRewardBoostPct;
  if (isLp) return GlobalConstants.luckyPlayerTournamentRewardBoostPct;
  return 0;
};

const statusTournamentJoinApBoostPct = (isLp: boolean, isVip: boolean): number => {
  if (isVip) return GlobalConstants.vipTournamentJoinApBoostPct;
  if (isLp) return GlobalConstants.luckyPlayerTournamentJoinApBoostPct;
  return 0;
};

/**
 * Applies the status (VIP > LP) AP-join boost when entering a tournament.
 */
export const applyStatusTournamentJoinApBoost = (
  baseAp: number,
  isLp: boolean,
  isVip: boolean
): number => {
  const pct = statusTournamentJoinApBoostPct(isLp, isVip);
  if (pct === 0) return baseAp;
  return Math.round(baseAp * (1 + pct / 100));
};
