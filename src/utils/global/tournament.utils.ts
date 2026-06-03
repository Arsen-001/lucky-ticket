import { GlobalConstants } from '@/constants/global.constants';

/**
 * Returns the effective LC-reward boost % from status. VIP supersedes LP —
 * the higher-tier value wins, the two never stack.
 */
export const statusTournamentLcBoostPct = (isLp: boolean, isVip: boolean): number => {
  if (isVip) return GlobalConstants.vipTournamentRewardBoostPct;
  if (isLp) return GlobalConstants.luckyPlayerTournamentRewardBoostPct;
  return 0;
};

/**
 * Applies the status (VIP > LP) LC-reward boost on top of a tournament's base
 * payout. Returns the boosted amount when status is active, otherwise the base.
 */
export const applyStatusTournamentLcBoost = (
  baseLc: number,
  isLp: boolean,
  isVip: boolean
): number => {
  const pct = statusTournamentLcBoostPct(isLp, isVip);
  if (pct === 0) return baseLc;
  return Math.round(baseLc * (1 + pct / 100));
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
