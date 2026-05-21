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
}
