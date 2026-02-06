export interface InvitedFriend {
  id: string;
  username: string;
  avatar: string;
  isPrime: boolean;
  isVerified: boolean;
  points: number;
  earnedCoins: number;
}

export interface ReferralStats {
  totalInvited: number;
  totalEarned: number;
}
