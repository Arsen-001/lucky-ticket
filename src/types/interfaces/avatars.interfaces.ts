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

export type AvatarDailyRewardKind = 'ltc' | 'stars' | 'ticket';

export interface AvatarDailyReward {
  kind: AvatarDailyRewardKind;
  amount: number;
  /** Required when kind === 'ticket' */
  tier?: TicketType;
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
