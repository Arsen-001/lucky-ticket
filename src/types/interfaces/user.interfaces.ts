/**
 * Effective status perks for the current user (VIP per-level / LP), resolved by
 * the backend so the UI shows exactly what the server enforces. `undefined`
 * (older backend) → fall back to the code constants.
 */
export interface StatusPerks {
  /** VIP's engine-speed SUMMAND (0 for a non-VIP). Since 17.08.2026 the Lucky
   *  Player half lives in `engineSpeedMultiplierPct` — the two stack. */
  engineSpeedBoostPct: number;
  /** Lucky Player's engine-speed MULTIPLIER as a % (30 = ×1.3; 0 / absent =
   *  none). Applied after the additive stack, like the speed chip. */
  engineSpeedMultiplierPct?: number;
  stakeYieldBoostPct: number;
  tournamentRewardBoostPct: number;
  tournamentJoinApBoostPct: number;
  marketDiscountPct: number;
  referralPct: number;
  /**
   * EXTRA daily rewarded-ad views the status grants, ON TOP of the base cap —
   * a bonus, not the cap itself. VIP level 1 sends `2`, meaning 10 + 2 = 12.
   */
  adsDailyBonus: number;
  /**
   * Rewarded-ad views the status lets the player take WITHOUT watching, per
   * day (DOCS §7.3) — the reward is identical, only the video is gone. A count
   * of views, not a bonus: it is bounded by the daily cap, so it never hands
   * out a view the player did not already have.
   */
  adsSkipDaily: number;
  /** EXTRA percentage points on the stake-fee volume discount (DOCS §18.5). */
  stakeFeeDiscountBonusPct: number;
  /** EXTRA per-recipient daily ticket sends per tier, on top of the free table. */
  ticketSendDailyBonus: Record<string, number>;
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
  /** Lifetime count of stakes opened — metered against `stakes.freeStartCount`. */
  freeStakeStartsUsed?: number;
  /** Whether the user has completed or skipped the first-run onboarding tour. */
  hasSeenTour?: boolean;
  /**
   * The account was wiped for blocking the bot and the player has not been told
   * yet. Carries no numbers on purpose — the notice explains an empty account,
   * it does not itemise the loss. Cleared by `ackWipeNotice`.
   */
  wipeNotice?: boolean;
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
