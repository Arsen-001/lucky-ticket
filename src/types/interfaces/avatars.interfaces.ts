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

export interface UserAvatar {
  id: string;
  src: string;
  name: string;
  tier: AvatarTier;
  /** 1–10, 10 is the best */
  level: number;
  boost?: AvatarBoost;
  /** true if user owns this avatar — false for paid avatars not yet purchased */
  owned: boolean;
}
