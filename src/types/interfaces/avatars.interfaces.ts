import type { TicketType } from '@/types/types/ticket.types';

export type AvatarTier = 'free' | 'paid';

export type AvatarBoostType =
  | 'engineSpeed'
  | 'marketDiscount'
  | 'claimMultiplier'
  | 'apEarn'
  | 'tournamentReward';

export interface AvatarBoost {
  type: AvatarBoostType;
  pct: number;
}

export type AvatarDailyRewardKind = 'lc' | 'stars' | 'ticket';

export interface AvatarDailyReward {
  kind: AvatarDailyRewardKind;
  amount: number;
  /** Required when kind === 'ticket' */
  tier?: TicketType;
}

/**
 * Accrued-but-uncollected daily reward of the equipped avatar (DOCS §16.1).
 * The pile never expires, so `pendingLc`/`pendingStars` grow until claimed —
 * and both can be non-zero at once if the player switched avatars mid-accrual,
 * which is why `daysAccrued` is reported rather than derived from an amount.
 */
export interface AvatarDailyRewardState {
  avatarId: string | null;
  avatarName: string | null;
  ratePerDay: { kind: 'lc' | 'stars'; amount: number } | null;
  pendingLc: number;
  pendingStars: number;
  daysAccrued: number;
  canClaim: boolean;
  lastClaimedAt: string | null;
}

export interface ClaimAvatarDailyRewardResponse {
  grantedLc: number;
  grantedStars: number;
  days: number;
}

export interface UserAvatar {
  id: string;
  src: string;
  name: string;
  tier: AvatarTier;
  /** 1–10, 10 is the best */
  level: number;
  boost?: AvatarBoost;
  /** Avatars level > 5 grant a daily reward while equipped */
  dailyReward?: AvatarDailyReward;
  /** true if user owns this avatar — false for paid avatars not yet purchased */
  owned: boolean;
}
