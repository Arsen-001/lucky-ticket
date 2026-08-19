/** Structured drop for a Test-Quest level (only the present keys are granted). */
export interface TestQuestReward {
  lc?: number;
  tickets?: number;
  ap?: number;
  ls?: number;
  lpDays?: number;
}

/**
 * One line of a level's checklist as the SERVER sends it.
 *
 * `labelKey` is an i18n key, not text — the shell resolves it, so the checklist
 * stays translated into all 18 languages while its numbers and composition are
 * server-owned. Typed loosely on purpose: this is untrusted wire data, and
 * `resolveTestQuestSteps` narrows it against the keys this build actually
 * knows before anything reaches `t()`.
 */
export interface TestQuestStepDto {
  labelKey: string;
  target?: number;
  action?: string;
  kind: string;
  gate?: string;
}

/** One ladder card (31 → 1), server-provided so admin reward edits render live. */
export interface TestQuestLadderEntry {
  level: number;
  task: string;
  /** Already-formatted drop, e.g. "300k LC · 8 билетов · LP 2д". */
  rewardLabel: string;
  /** The level's checklist. Absent on older backends ⇒ the local prototype
   *  ladder is used instead (see `resolveTestQuestSteps`). */
  steps?: TestQuestStepDto[];
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
  /**
   * Shards BOUGHT in the market, lifetime. Not the shard balance: minting a chip
   * spends 20, and a balance-backed counter would drop the step back to 0 the
   * moment the player used what the ladder told them to buy.
   * Optional — an older backend simply leaves the step at 0 instead of crashing.
   */
  shardsBought?: number;
  /** Tickets collected off engines, lifetime (`Profile.ticketsEarned`). */
  ticketsCollected?: number;
  /**
   * Stakes currently ACTIVE — the one live counter, because the step says
   * «hold», not «make»: a matured stake stops counting, as the wording promises.
   */
  activeStakes?: number;
  /** Stakes ever made — lifetime, so «make your first stake» stays done. */
  stakesMade?: number;
  /** Engines the player owns right now (bought, granted or starter). */
  enginesOwned?: number;
  /**
   * Engines BOUGHT in the market, lifetime. The «buy an engine» ladder counts
   * this and not `enginesOwned`, because level 12 GRANTS one — a gift must not
   * tick a step that says «buy».
   */
  enginesBought?: number;
  /** Chips in the inventory, minted or won. */
  chipsOwned?: number;
  /** Engines carrying a chip in a slot — taking it off undoes the step. */
  chipsEquipped?: number;
  /** Tickets BOUGHT in the market, lifetime (`Profile.ticketsBought`). */
  ticketsBought?: number;
  /** 1 once a nickname is set. */
  nicknameSet?: number;
  /** 1 while a TON wallet is linked. */
  walletConnected?: number;
  /** 1 once Telegram reports a channel boost from this player. */
  channelBoosted?: number;
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
  /** Checklist of the level being climbed now (also present inside `ladder`). */
  steps?: TestQuestStepDto[];
  claimableToday: boolean;
  /**
   * Every blocking step of the current level is done, so the server will accept
   * the claim. Separate from `claimableToday` on purpose: the screen has to tell
   * "come back tomorrow" apart from "finish the checklist", and one flag cannot
   * say both. Absent on a backend older than 19.08.2026 ⇒ treated as satisfied,
   * because that server does not gate on the checklist either.
   */
  stepsComplete?: boolean;
  /** How many blocking steps are still open — drives the "N tasks left" hint. */
  stepsRemaining?: number;
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
