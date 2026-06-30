import { GlobalConstants } from '@/constants/global.constants';
import { appConfig } from '@/config/app.config';

/**
 * Net LC a placement actually pays out: the prize pool minus the jackpot skim
 * (DOCS §20), times the placement %, floored — mirrors the backend `finish()`
 * distribution (the base prize, before any per-winner VIP/LP status boost).
 */
export const placementPrizeLc = (prizePool: number, pct: number): number => {
  if (!prizePool) return 0;
  const skim = Math.floor((prizePool * appConfig.jackpot.accrualPercent) / 100);
  return Math.floor(((prizePool - skim) * pct) / 100);
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
