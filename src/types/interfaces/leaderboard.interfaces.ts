export type LeaderboardPeriod = 'today' | 'week' | 'month' | 'all';

export interface LeaderboardEntry {
  id: string;
  username: string;
  points: number;
  avatar: string;
  rankChange: number;
  place: number;
  isVerified: boolean;
  isPrime: boolean;
  isVIP?: boolean;
}

export interface LeaderboardResponse {
  period: LeaderboardPeriod;
  total: number;
  places: LeaderboardEntry[];
  myPlace: LeaderboardEntry;
}
