export interface MeResponse {
  id: string;
  username: string;
  email?: string;
  isLuckyPlayer: boolean;
  luckyPlayerExpiresAt?: string;
  isVIP: boolean;
  vipLevel: number;
  isVerified: boolean;
  avatar: string;
  avatarId?: string;
  coins: number;
  points: number;
  phoneNumber?: string;
  twoFactorAuth?: boolean;
  activityPoints: number;
  telegramStars: number;
  /** ISO timestamp of the user's last AP-earning action — drives the decay status. */
  lastActivityAt?: string;
  walletId?: string | null;
  /** Lifetime count of Bronze-tier stakes opened — gates the "first 10 Bronze free" rule. */
  bronzeStakesOpened?: number;
  /** Whether the user has completed or skipped the first-run onboarding tour. */
  hasSeenTour?: boolean;
}
