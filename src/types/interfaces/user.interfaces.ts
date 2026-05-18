export interface MeResponse {
  id: string;
  username: string;
  email?: string;
  isLuckyPlayer: boolean;
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
  walletId?: string | null;
}
