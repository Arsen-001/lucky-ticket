/** Structured drop for a Test-Quest level (only the present keys are granted). */
export interface TestQuestReward {
  lc?: number;
  tickets?: number;
  ap?: number;
  ls?: number;
  lpDays?: number;
}

/** One ladder card (31 → 1), server-provided so admin reward edits render live. */
export interface TestQuestLadderEntry {
  level: number;
  task: string;
  /** Already-formatted drop, e.g. "300k LC · 8 билетов · LP 2д". */
  rewardLabel: string;
}

/**
 * Live, cumulative-since-enrollment progress for the countable checklist steps
 * (display-only — it never gates the daily claim). Each field is the running
 * total of that action over the whole test; a step renders `min(count, target)`
 * against its own target. Absent on older backends ⇒ the checklist falls back to
 * the claimed-based done-state.
 */
export interface TestQuestProgress {
  /** Tickets spent (tournaments, market, sends…). */
  ticketsSpent: number;
  /** Rewarded ads watched. */
  adsWatched: number;
  /** Invites shared / sent. */
  shares: number;
  /** Referrals activated (friends who joined via the player). */
  referrals: number;
  /** Engine upgrades performed (speed + capacity). */
  engineUpgrades: number;
}

/** The countable checklist actions that {@link TestQuestProgress} tracks. */
export type TestQuestAction = keyof TestQuestProgress;

/** GET /test-quest — the current state of the pinned Test-Quest card. */
export interface TestQuestState {
  /** Countdown level: 31 (entry) → 1 (top crown). */
  level: number;
  totalLevels: number;
  /** Full ladder text (31 → 1) from the admin-editable config; falls back to the local prototype when absent. */
  ladder?: TestQuestLadderEntry[];
  /** Levels claimed so far (0 → 31). */
  climbed: number;
  /** 0–100, drives the card progress bar. */
  progress: number;
  task: string;
  reward: TestQuestReward;
  /** Human label derived server-side, e.g. "300k LC · 8 билетов · LP 2д". */
  rewardLabel: string;
  claimableToday: boolean;
  /** Subscribed to the official channel @luckyticket365. Required to claim ANY
   *  level's reward — read live (getChatMember) server-side. */
  channelSubscribed: boolean;
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
  /** Live cumulative progress for the countable checklist steps (display-only).
   *  Named `stepProgress` to avoid colliding with the scalar `progress` climb-%. */
  stepProgress?: TestQuestProgress;
}

/** POST /test-quest/claim — new state plus what was granted. */
export interface ClaimTestQuestResponse extends TestQuestState {
  granted: TestQuestReward;
  grantedLabel: string;
  newBalance: { lc: number; tickets: number; activityPoints: number };
}

/** One row of the friends leaderboard (the referral race for the crown). */
export interface TestQuestLeaderboardEntry {
  rank: number;
  username: string;
  /** Activated referrals — the metric the crown (levels 3 → 1) is decided by. */
  referrals: number;
  level: number;
  isMe: boolean;
}

/** GET /test-quest/leaderboard — live friends standings + the caller's rank. */
export interface TestQuestLeaderboard {
  total: number;
  myRank: number | null;
  myReferrals: number;
  top: TestQuestLeaderboardEntry[];
}
