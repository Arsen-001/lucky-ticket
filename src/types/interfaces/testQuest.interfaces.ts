/** Structured drop for a Test-Quest level (only the present keys are granted). */
export interface TestQuestReward {
  lc?: number;
  tickets?: number;
  ap?: number;
  ls?: number;
  lpDays?: number;
}

/** GET /test-quest — the current state of the pinned Test-Quest card. */
export interface TestQuestState {
  /** Countdown level: 31 (entry) → 1 (Genesis crown). */
  level: number;
  totalLevels: number;
  /** Levels claimed so far (0 → 31). */
  climbed: number;
  /** 0–100, drives the card progress bar. */
  progress: number;
  task: string;
  reward: TestQuestReward;
  /** Human label derived server-side, e.g. "300k LC · 8 билетов · LP 2д". */
  rewardLabel: string;
  claimableToday: boolean;
  finished: boolean;
  /** Daily ladder tops out here (4); levels 3 → 1 are the crown. */
  dailyTopLevel: number;
  /** Reached level 4 (claimed the daily ladder) → eligible for the crown. */
  qualified: boolean;
  /** Crown level 1–3 (leaderboard), 4 (qualified floor), or null (not yet qualified). */
  crownLevel: number | null;
  /** Frozen final level (1–31) once the test ends and the badge is minted; null while live. */
  badgeLevel: number | null;
  /** True once the badge is minted (test over). */
  frozen: boolean;
  /** Monthly badge chests paid so far (of chestsTotal), post-freeze. */
  chestsPaid: number;
  chestsTotal: number;
}

/** POST /test-quest/claim — new state plus what was granted. */
export interface ClaimTestQuestResponse extends TestQuestState {
  granted: TestQuestReward;
  grantedLabel: string;
  newBalance: { lc: number; tickets: number; activityPoints: number };
}

/** One row of the Founders leaderboard (the referral race for the crown). */
export interface TestQuestLeaderboardEntry {
  rank: number;
  username: string;
  /** Activated referrals — the metric the crown (levels 3 → 1) is decided by. */
  referrals: number;
  level: number;
  isMe: boolean;
}

/** GET /test-quest/leaderboard — live Founders standings + the caller's rank. */
export interface TestQuestLeaderboard {
  total: number;
  myRank: number | null;
  myReferrals: number;
  top: TestQuestLeaderboardEntry[];
}
