export type LeaderboardPeriod = 'today' | 'week' | 'month' | 'all';

export interface LeaderboardEntry {
  id: string;
  username: string;
  /** Telegram name, when it should be shown instead of `username`. @see displayNameOf */
  displayName?: string;
  points: number;
  avatar: string;
  rankChange: number;
  place: number;
  isVerified: boolean;
  isLuckyPlayer: boolean;
  isVIP?: boolean;
  vipLevel?: number;
  liked: boolean;
  likesReceived: number;
}

export interface LeaderboardResponse {
  period: LeaderboardPeriod;
  total: number;
  places: LeaderboardEntry[];
  myPlace: LeaderboardEntry;
}
