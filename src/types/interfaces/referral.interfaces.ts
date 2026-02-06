export interface InvitedFriend {
  id: string;
  username: string;
  avatar: string;
  isPrime: boolean;
  isVerified: boolean;
  points: number;
  earnedCoins: number;
  isVIP?: boolean;
}

export interface ReferralStats {
  totalInvited: number;
  totalEarned: number;
  availableClaim: number;
}
