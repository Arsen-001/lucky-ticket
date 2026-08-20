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
 * - `noAd`        — no fill: the network has nothing to serve right now. The
 *                   player is told so in one modal; nothing stands in for the
 *                   missing video (see `./index.ts`).
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

/**
 * Every wired provider — real ad networks only. There used to be a `house` id
 * for the app's own promo, which always filled and therefore ended every
 * waterfall; it is gone on purpose, so a no-fill reports the network that
 * refused (17.08.2026).
 *
 * Adding one here is not enough: the id is validated server-side by
 * `@IsIn(AD_PROVIDERS)` on `POST /tasks/ads/watch` and `…/attempt`, so a
 * network missing from `src/admin/ad-networks.constants.ts` in the backend
 * makes every watch 400 — the reward is lost, not merely unreported.
 *
 * RichAds was wired on 19.08.2026 and removed on 20.08.2026 without ever being
 * switched on: with Adsgram filling 97% a third network had ~nothing to add,
 * and RichAds publishes no server-to-server postback at all, so its views would
 * have been credited on the client's word. If a third source is ever wanted it
 * should be one whose grant can be verified — see DOCS/ADS_SETUP.md.
 */
export type AdProviderId = 'adsgram' | 'monetag';

/**
 * Outcome plus the provider that produced it. The backend needs the provider
 * to price the impression and to attribute revenue per network once several
 * are live.
 */
export interface RewardedAdResult {
  outcome: RewardedAdOutcome;
  /** `null` only when no network is wired at all (`unavailable`). */
  provider: AdProviderId | null;
}

/**
 * One provider's answer: what happened, and — critically — whether anything
 * reached the player's screen.
 *
 * The waterfall may only move to the next network when the previous one showed
 * NOTHING. Without this flag it moved on any failure, including a video that
 * played and then broke, so one tap could open a second ad on top of a first
 * the player had already sat through. Reported from production 20.08.2026 as
 * three ads for one tap, with Adsgram logging 39 errors that day.
 */
export interface AdShowResult {
  outcome: Exclude<RewardedAdOutcome, 'unavailable'>;
  /**
   * True when a creative reached the screen, even briefly. Default `false`
   * means "nothing was shown" — so a provider that cannot tell must say so
   * explicitly rather than let the chain guess.
   */
  displayed?: boolean;
}

export interface AdProvider {
  readonly id: AdProviderId;
  /** True when the provider has everything it needs to attempt a show. */
  isConfigured: () => boolean;
  /** Play one rewarded ad. Must never throw — always resolves to a result. */
  show: () => Promise<AdShowResult>;
  /** Optional warm-up so the first show doesn't wait on a cold request. */
  preload?: () => void;
}
