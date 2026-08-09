import { GlobalConstants } from '@/constants/global.constants';
import type { StatusPerks } from '@/types/interfaces/user.interfaces';
import type { TicketType } from '@/types/types/ticket.types';

/**
 * Status perks are BONUSES over a base every player already has, never the
 * final number (DOCS §7.3). These helpers add the two counted perks to their
 * base so the UI quotes what the server will actually enforce.
 *
 * Each takes the backend-resolved `me.statusPerks` when present and falls back
 * to the code constants when it is absent (older API) — the same shape as
 * `effectiveMarketDiscountPct`. The fallback is FLAT and therefore only an
 * approximation for VIP, whose real bonus scales per level; that is exactly why
 * the perk payload is preferred whenever it exists.
 */

/** The percentage perks, and the flat code constants that stand in for each. */
const PCT_FALLBACK = {
  engineSpeedBoostPct: {
    vip: GlobalConstants.vipEngineSpeedBoostPct,
    lp: GlobalConstants.luckyPlayerEngineSpeedBoostPct,
  },
  stakeYieldBoostPct: {
    vip: GlobalConstants.vipStakeYieldBoostPct,
    lp: GlobalConstants.luckyPlayerStakeYieldBoostPct,
  },
  tournamentRewardBoostPct: {
    vip: GlobalConstants.vipTournamentRewardBoostPct,
    lp: GlobalConstants.luckyPlayerTournamentRewardBoostPct,
  },
  tournamentJoinApBoostPct: {
    vip: GlobalConstants.vipTournamentJoinApBoostPct,
    lp: GlobalConstants.luckyPlayerTournamentJoinApBoostPct,
  },
} as const;

export type StatusPctKey = keyof typeof PCT_FALLBACK;

/**
 * The percentage a status actually grants for `key`. Prefers the
 * backend-resolved per-level value and falls back to the flat constant only
 * when `me.statusPerks` is absent.
 *
 * The fallback is the LEVEL-20 ceiling, so using it for a VIP is a promise the
 * server will not keep: at level 1 the real values are +1% engine, +0.1% stake
 * and 0% on both tournament perks, against constants of 25 / 40 / 50 / 100.
 * Anything quoting a number to the player has to pass the perks.
 */
export const effectiveStatusPct = (
  key: StatusPctKey,
  isLp: boolean,
  isVip: boolean,
  perks?: Partial<Record<StatusPctKey, number>>
): number => {
  const fromServer = perks?.[key];
  if (Number.isFinite(fromServer)) return fromServer as number;
  if (isVip) return PCT_FALLBACK[key].vip;
  if (isLp) return PCT_FALLBACK[key].lp;
  return 0;
};

/**
 * EXTRA percentage points a status adds to the stake-fee volume discount.
 * Both statuses default to the same +10 the Lucky-Player-only bracket ladder
 * used to be, so the fallback is flat rather than VIP-scaled.
 */
export const effectiveStakeFeeDiscountBonusPct = (
  isLp: boolean,
  isVip: boolean,
  perks?: Pick<StatusPerks, 'stakeFeeDiscountBonusPct'>
): number => {
  const fromServer = perks?.stakeFeeDiscountBonusPct;
  if (Number.isFinite(fromServer)) return fromServer as number;
  return isLp || isVip ? GlobalConstants.stakeFeeDiscountBonusLuckyPlayer : 0;
};

/** Fallback ad-view bonus from the code constants (VIP > LP; DOCS §7.3). */
const fallbackAdsDailyBonus = (isLp: boolean, isVip: boolean): number => {
  const base = GlobalConstants.apRewards.watchVideoDailyLimit;
  if (isVip) return GlobalConstants.vipWatchVideoDailyLimit - base;
  if (isLp) return GlobalConstants.apRewards.luckyPlayerWatchVideoDailyLimit - base;
  return 0;
};

/** The FREE daily rewarded-ad cap this user is held to. Bought slots sit on top. */
export const effectiveAdsDailyLimit = (
  isLp: boolean,
  isVip: boolean,
  perks?: Pick<StatusPerks, 'adsDailyBonus'>
): number =>
  GlobalConstants.apRewards.watchVideoDailyLimit +
  (perks && Number.isFinite(perks.adsDailyBonus)
    ? perks.adsDailyBonus
    : fallbackAdsDailyBonus(isLp, isVip));

/** Fallback per-tier send bonus from the code constants (VIP inherits the LP table). */
const fallbackTicketSendBonus = (tier: TicketType, isLp: boolean, isVip: boolean): number => {
  const limits = GlobalConstants.ticketSendDailyLimits;
  return isLp || isVip ? limits.luckyPlayer[tier] - limits.default[tier] : 0;
};

/**
 * How many tickets of `tier` this user may send to one recipient per day.
 * `0` means the tier is closed — Platinum and Diamond start there, so only a
 * positive status bonus opens them.
 */
export const effectiveTicketSendDailyLimit = (
  tier: TicketType,
  isLp: boolean,
  isVip: boolean,
  perks?: Pick<StatusPerks, 'ticketSendDailyBonus'>
): number => {
  const bonus = perks?.ticketSendDailyBonus?.[tier.toUpperCase()];
  return (
    GlobalConstants.ticketSendDailyLimits.default[tier] +
    (Number.isFinite(bonus) ? (bonus as number) : fallbackTicketSendBonus(tier, isLp, isVip))
  );
};
