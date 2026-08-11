import { appConfig } from '@/config/app.config';
import type { StatusPerks } from '@/types/interfaces/user.interfaces';
import { effectiveStatusPct } from '@/utils/global/status.utils';

/**
 * Nearest start first, without mutating the RTK Query cache array (`sort()` in
 * place on `data` throws under Immer's frozen results).
 *
 * The endpoint does not promise an order, and on live data it does not have
 * one: Home's strip listed Platinum in three hours before Diamond in nine and a
 * sponsored one in five, so "which starts next" could not be read off it.
 */
export const byStartTime = <T extends { startTime?: string }>(items: readonly T[]): T[] =>
  [...items].sort(
    (a, b) => new Date(a.startTime ?? 0).getTime() - new Date(b.startTime ?? 0).getTime()
  );

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
export const statusTournamentLcBoostPct = (
  isLp: boolean,
  isVip: boolean,
  perks?: Pick<StatusPerks, 'tournamentRewardBoostPct'>
): number => effectiveStatusPct('tournamentRewardBoostPct', isLp, isVip, perks);

const statusTournamentJoinApBoostPct = (
  isLp: boolean,
  isVip: boolean,
  perks?: Pick<StatusPerks, 'tournamentJoinApBoostPct'>
): number => effectiveStatusPct('tournamentJoinApBoostPct', isLp, isVip, perks);

/**
 * Applies the status (VIP > LP) AP-join boost when entering a tournament.
 */
export const applyStatusTournamentJoinApBoost = (
  baseAp: number,
  isLp: boolean,
  isVip: boolean,
  perks?: Pick<StatusPerks, 'tournamentJoinApBoostPct'>
): number => {
  const pct = statusTournamentJoinApBoostPct(isLp, isVip, perks);
  if (pct === 0) return baseAp;
  return Math.round(baseAp * (1 + pct / 100));
};
