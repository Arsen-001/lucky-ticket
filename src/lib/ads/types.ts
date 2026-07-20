/**
 * Shared contract for rewarded-ad providers.
 *
 * The app plays ONE ad per user action. Multiple networks are wired as a
 * waterfall (see `./index.ts`), not as multiple ads — a provider is only asked
 * after the previous one failed to deliver.
 */

/**
 * Normalized outcome of a rewarded-ad attempt:
 * - `completed`   — user watched the ad to the end → grant the reward.
 * - `skipped`     — user closed the ad early → no reward, and no fallback
 *                   (otherwise "close the ad to get another one" becomes a farm).
 * - `noAd`        — no fill: the network has nothing to serve right now.
 * - `tooFast`     — a new ad was requested too soon after the previous one.
 * - `error`       — the network is configured but the ad failed to load/show.
 * - `unavailable` — no ad network configured at all (dev / plain browser / e2e)
 *                   → fall back to the mock flow and let the backend decide.
 */
export type RewardedAdOutcome =
  | 'completed'
  | 'skipped'
  | 'noAd'
  | 'tooFast'
  | 'error'
  | 'unavailable';

/** Outcomes that mean "this provider delivered nothing — try the next one". */
export type RewardedAdFailure = Extract<RewardedAdOutcome, 'noAd' | 'tooFast' | 'error'>;

/** Every wired provider. `house` is the app's own promo — it always fills. */
export type AdProviderId = 'adsgram' | 'monetag' | 'house';

/**
 * Outcome plus the provider that produced it. The backend needs the provider
 * to price the impression (a house ad is unpaid and may reward differently)
 * and to attribute revenue per network once several are live.
 */
export interface RewardedAdResult {
  outcome: RewardedAdOutcome;
  /** `null` only when no network is wired at all (`unavailable`). */
  provider: AdProviderId | null;
}

export interface AdProvider {
  readonly id: AdProviderId;
  /** True when the provider has everything it needs to attempt a show. */
  isConfigured: () => boolean;
  /** Play one rewarded ad. Must never throw — always resolves to an outcome. */
  show: () => Promise<Exclude<RewardedAdOutcome, 'unavailable'>>;
  /** Optional warm-up so the first show doesn't wait on a cold request. */
  preload?: () => void;
}
