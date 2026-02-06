export interface LeaderboardEntry {
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
  places: LeaderboardEntry[];
  myPlace: LeaderboardEntry;
}
