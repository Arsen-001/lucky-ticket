export interface MeResponse {
  id: string;
  username: string;
  email?: string;
  isPrime: boolean;
  isVIP: boolean;
  isVerified: boolean;
  avatar: string;
  coins: number;
  points: number;
  phoneNumber?: string;
  twoFactorAuth?: boolean;
  activityPoints: number;
}
