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
}
