/**
 * Effective status perks for the current user (VIP per-level / LP), resolved by
 * the backend so the UI shows exactly what the server enforces. `undefined`
 * (older backend) → fall back to the code constants.
 */
export interface StatusPerks {
  engineSpeedBoostPct: number;
  stakeYieldBoostPct: number;
  tournamentRewardBoostPct: number;
  tournamentJoinApBoostPct: number;
  marketDiscountPct: number;
  referralPct: number;
  adsDailyLimit: number;
  ticketSendDailyLimits: Record<string, number>;
  /** Bulk "Claim all" per tier on the Tickets page (DOCS §8.4). LP-only by default. */
  bulkClaimEnabled: boolean;
}

export interface MeResponse {
  id: string;
  username: string;
  /**
   * The name written in Telegram (`first_name` + `last_name`), sent only when
   * it should be shown instead of `username` — i.e. the player never renamed
   * themselves in Settings. Render it with `displayNameOf()`, never raw.
   */
  displayName?: string;
  email?: string;
  isLuckyPlayer: boolean;
  luckyPlayerExpiresAt?: string;
  isVIP: boolean;
  vipLevel: number;
  /** Effective per-level status perks (market discount, referral %, …). */
  statusPerks?: StatusPerks;
  isVerified: boolean;
  avatar: string;
  avatarId?: string;
  coins: number;
  points: number;
  phoneNumber?: string;
  twoFactorAuth?: boolean;
  activityPoints: number;
  /** Activated referrals (cumulative) — second half of the tier gate (DOCS §5.1). */
  referralsCount: number;
  telegramStars: number;
  /** ISO timestamp of the user's last AP-earning action — drives the decay status. */
  lastActivityAt?: string;
  walletId?: string | null;
  /** Lifetime count of Bronze-tier stakes opened — gates the "first 10 Bronze free" rule. */
  bronzeStakesOpened?: number;
  /** Whether the user has completed or skipped the first-run onboarding tour. */
  hasSeenTour?: boolean;
}

/** Email-verification gift bundle (backend RewardRungData shape). */
export interface EmailVerifyReward {
  ap: number;
  lc: number;
  stars: number;
  tickets: number;
  /** Backend Tier enum casing (BRONZE…DIAMOND); lowercase before t(). */
  ticketTier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';
}

/** GET me/email/reward — what the settings screen shows next to the field. */
export interface EmailRewardInfo {
  /** Admin kill switch for the gift (the code flow itself always runs). */
  enabled: boolean;
  /** The one-off gift was already granted to this account. */
  claimed: boolean;
  verified: boolean;
  reward: EmailVerifyReward;
}

export interface RequestEmailCodeResponse {
  sent: boolean;
  email: string;
  expiresInSec: number;
  cooldownSec: number;
}

export interface ConfirmEmailResponse {
  email: string;
  verified: boolean;
  /** Non-null only when the one-off gift was granted by THIS confirmation. */
  reward: EmailVerifyReward | null;
}
