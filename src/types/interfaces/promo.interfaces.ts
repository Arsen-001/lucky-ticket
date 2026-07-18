import type { ActivityTier } from '@/constants/global.constants';

export type PromoRewardKind = 'lc' | 'tickets' | 'stars';

/** One reward granted by a redeemed promo code. */
export interface PromoReward {
  kind: PromoRewardKind;
  amount: number;
  /** Tier — only meaningful for ticket rewards. */
  tier?: ActivityTier;
}

export interface PromoRedeemResponse {
  /** The redeemed code (uppercased), echoed back for the reveal. */
  code: string;
  rewards: PromoReward[];
}

/**
 * Reason a redemption failed, surfaced to the user as a localized message.
 * `channel` — the player must be subscribed to the official Telegram channel.
 */
export type PromoErrorReason = 'invalid' | 'expired' | 'used' | 'channel';
