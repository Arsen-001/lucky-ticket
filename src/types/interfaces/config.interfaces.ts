/**
 * Public config served by the backend's `GET /config`. `lcUsdRate` is
 * admin-controllable (drives the LC→TON cash-out rate, DOCS §6.1); the rate
 * anchors are fixed and surfaced so the wallet has a single source for its
 * estimate. `referral` / `jackpot` are display values so admin edits reach the
 * UI copy — optional because an older backend may not serve them yet; every
 * consumer falls back to the bundled constants.
 */
export interface PublicConfig {
  /** USD value of one LC. */
  lcUsdRate: number;
  /** USD value of one TON. */
  tonUsdRate: number;
  /** USD value of one Lucky Star. */
  lsUsdRate: number;
  /** Admin kill switch for rewarded ads — hides every ad surface when false. */
  adsEnabled: boolean;
  /** Advertiser (partners) cabinet master switch — false = coming-soon preview. */
  partnersEnabled?: boolean;
  /**
   * Public leaderboard master switch — false locks the board behind the "opens
   * after the test period" screen. Standings over a closed beta of a few
   * testers would read as the real ranking, so the board stays shut until the
   * test ends and an admin flips this on.
   */
  leaderboardEnabled?: boolean;
  /**
   * Informational pages an admin may switch off (FAQ / privacy / terms). A
   * page that is off loses its drawer entry and renders a "switched off" stub
   * on a direct hit; the backend stops serving its text at the same time, so
   * this is not merely cosmetic. Optional — an older backend omits it, and
   * every consumer then treats the pages as shown.
   */
  pages?: {
    faq: boolean;
    privacy: boolean;
    terms: boolean;
  };
  /** Invite reward display values (admin-editable, DOCS §17). */
  referral?: {
    signup: {
      ap: number;
      stars: number;
      /** @deprecated Equal to `ap`; the reward no longer doubles for Premium. */
      premiumAp: number;
      /** @deprecated Equal to `stars`. */
      premiumStars: number;
    };
    /** True when the per-invite reward ladder replaces the flat signup reward. */
    hasRewardLadder: boolean;
    /**
     * The ongoing reward: this % of the LC a referred friend wins in a
     * tournament accrues to you (DOCS §17.2). Flat — the friend's status does
     * not change it.
     */
    tournamentLcPct?: number;
    /**
     * The second level: this % of a friend-of-a-friend's tournament prize goes
     * to whoever invited the middle link. `0` = the second level is off and the
     * screen stops mentioning it.
     */
    tournamentLcL2Pct?: number;
  };
  /** Jackpot split display values (admin-editable, DOCS §20). */
  jackpot?: {
    accrualPercent: number;
    participantsSharePercent: number;
    podiumSplitPercent: { first: number; second: number; third: number };
  };
  /** Tournament reward display values (admin-editable, DOCS §11). */
  tournaments?: {
    /** Default top-3 shard rewards (per-tournament overrides win over these). */
    shardRewards: { first: number; second: number; third: number };
    /** AP granted for joining, by tier (before the LP/VIP boost). */
    joinApByTier: Record<string, number>;
  };
  /**
   * Engine development knobs (admin-editable, DOCS §9.7/§10): the upgrade-price
   * formula and the level-curve tables. The server charges/grants from the same
   * config, so rendering these keeps the shown prices and curves honest.
   */
  engines?: {
    upgrade: {
      speedBase: number;
      capacityBase: number;
      perSubLevel: number;
      perEngineLevel: number;
      /** Lowercased tier keys ('bronze'…'diamond'). */
      tierCostMultiplier: Record<string, number>;
    };
    levelTables: {
      speedLevelBoostPct: number[];
      /** ABSOLUTE tickets added per capacity sub-level (default +1/level). */
      capacityLevelBonusTickets: number[];
      engineLevelSpeedBoostPct: number[];
      engineLevelBaseCapacity: number[];
    };
  };
  /**
   * Withdrawal limits the wallet forms validate against (admin-editable). The
   * server enforces exactly these, so a form built on them can't invite an
   * amount the API then rejects.
   */
  wallet?: {
    /**
     * The exit kill switch (`walletConfig.withdrawalsEnabled`). False closes
     * BOTH money exits — the TON withdrawal and the LC→TON conversion — and the
     * screens render a lock instead of a form. Absent means an older backend:
     * treat it as open and let the server's 403 be the last word.
     */
    withdrawalsEnabled?: boolean;
    /** Flat fee charged ON TOP of a withdrawal — the recipient gets the amount. */
    withdrawFeeTon: number;
    /** Minimum once the account has cashed out before. */
    minWithdrawTon: number;
    /**
     * Minimum on an account's FIRST cash-out — lower, so a player can watch the
     * exit work before saving up to the real threshold. Which of the two applies
     * comes with the wallet state; this endpoint is anonymous and only says the
     * pair exists.
     */
    firstWithdrawMinTon?: number;
    /** Ceiling on a single withdrawal — the treasury signs these automatically. */
    maxWithdrawTon: number;
    /** Per-account daily withdrawal cap (UTC day) — spans transactions. */
    withdrawDailyCapTon?: number;
    /**
     * Smallest deposit the send-from-wallet form offers. Advisory: whatever
     * arrives on-chain is credited, so this only keeps the form from inviting
     * dust the sender's own network fee eats.
     */
    minDepositTon?: number;
    /** Minimum LC per LC→TON conversion. */
    minWithdrawLc: number;
  };
  /** Stake builder display knobs (admin-editable, DOCS §18). */
  stakes?: {
    durationMinMonths: number;
    durationMaxMonths: number;
    aprMinPercent: number;
    aprMaxPercent: number;
    apDivisor: number;
    apCompletionBonusPercent: number;
    freeStartCount: number;
  };
}
