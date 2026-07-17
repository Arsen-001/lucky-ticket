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
  /** Invite reward display values (admin-editable, DOCS §17). */
  referral?: {
    signup: {
      ap: number;
      stars: number;
      premiumAp: number;
      premiumStars: number;
    };
    /** True when the per-invite reward ladder replaces the flat signup reward. */
    hasRewardLadder: boolean;
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
  /** Stake builder display knobs (admin-editable, DOCS §18). */
  stakes?: {
    durationMinMonths: number;
    durationMaxMonths: number;
    aprMinPercent: number;
    aprMaxPercent: number;
    apDivisor: number;
    apCompletionBonusPercent: number;
    bronzeFreeStartCount: number;
  };
}
