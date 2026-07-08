import { Env } from '@/services/environment.service';

/**
 * Adsgram rewarded-ad integration for the Telegram Mini App.
 *
 * Adsgram is the ad network that serves the rewarded videos shown in the Tasks
 * → Ads section. It has no npm package — the SDK is a script loaded in the root
 * layout (see `app/layout.tsx`) that exposes `window.Adsgram`. Docs:
 * https://docs.adsgram.ai/publisher/api-reference
 *
 * Reward crediting: after a real ad is watched to completion the frontend calls
 * `POST /tasks/ads/watch` and the backend grants the reward. Once the account
 * qualifies for Adsgram's server-to-server Reward URL, the backend should treat
 * the Adsgram callback (GET with the user's telegramId) as the authoritative
 * "ad was really watched" signal and the client POST as a UI-sync trigger only.
 * See `DOCS/ADSGRAM_SETUP.md`.
 */

/** Result object Adsgram resolves/rejects `show()` with. */
interface ShowPromiseResult {
  done: boolean;
  description: string;
  state: 'load' | 'render' | 'playing' | 'destroy';
  error: boolean;
}

/**
 * SDK events we subscribe to. Registering a listener for an event makes the
 * SDK emit it INSTEAD of showing its own native Telegram alert (its internal
 * `_invokeAlertOrEvent` prefers listeners over `showAlert`) — that's how the
 * app replaces the stock "AdsgramError" popups with its own modal.
 */
type AdsgramEventName = 'onBannerNotFound' | 'onNonStopShow' | 'onTooLongSession' | 'onError';

interface AdController {
  show: () => Promise<ShowPromiseResult>;
  addEventListener: (event: AdsgramEventName, handler: () => void) => void;
}

interface AdsgramSDK {
  init: (params: {
    blockId: string;
    debug?: boolean;
    debugBannerType?: 'RewardedVideo' | 'FullscreenMedia';
  }) => AdController;
}

declare global {
  interface Window {
    Adsgram?: AdsgramSDK;
  }
}

/**
 * Normalized outcome of a rewarded-ad attempt:
 * - `completed`   — user watched the ad to the end → grant the reward.
 * - `skipped`     — user closed the ad early → no reward.
 * - `noAd`        — no fill: Adsgram has no ad to serve right now → try later.
 * - `tooFast`     — a new ad was requested too soon after the previous one.
 * - `error`       — network is configured but the ad failed to load/show → no reward.
 * - `unavailable` — no ad network configured (dev / plain browser / e2e) → fall
 *                   back to the mock flow and let the backend decide the reward.
 */
export type RewardedAdOutcome =
  | 'completed'
  | 'skipped'
  | 'noAd'
  | 'tooFast'
  | 'error'
  | 'unavailable';

/** The configured Adsgram block id, or `undefined` when no network is wired. */
function getBlockId(): string | undefined {
  return Env.adsgramBlockId || undefined;
}

/** True when a block id is configured at build time (i.e. real ads are enabled). */
export function isAdsgramEnabled(): boolean {
  return !!getBlockId();
}

// One controller per block id is enough — Adsgram returns the same instance for
// a repeated init, but memoizing avoids re-entering the SDK on every watch.
let controller: AdController | null = null;

// Reason captured from SDK events during the current show() attempt. The SDK
// emits the event synchronously before rejecting the show() promise, so the
// catch below reads the value of the attempt that just failed.
let lastFailure: Extract<RewardedAdOutcome, 'noAd' | 'tooFast' | 'error'> | null = null;

function getController(): AdController | null {
  if (controller) return controller;
  const blockId = getBlockId();
  if (typeof window === 'undefined' || !blockId || !window.Adsgram) return null;
  controller = window.Adsgram.init({ blockId, debug: Env.adsgramDebug });
  controller.addEventListener('onBannerNotFound', () => (lastFailure = 'noAd'));
  controller.addEventListener('onNonStopShow', () => (lastFailure = 'tooFast'));
  controller.addEventListener('onTooLongSession', () => (lastFailure = 'error'));
  controller.addEventListener('onError', () => (lastFailure = 'error'));
  return controller;
}

/**
 * Show a rewarded ad and resolve with a normalized outcome. Never throws — the
 * caller branches on {@link RewardedAdOutcome} to decide whether to credit.
 */
export async function showRewardedAd(): Promise<RewardedAdOutcome> {
  // No network configured → keep the existing mock/dev flow.
  if (!getBlockId()) return 'unavailable';

  const ctrl = getController();
  // Configured but the SDK script hasn't loaded — do NOT credit a free reward.
  if (!ctrl) return 'error';

  lastFailure = null;
  try {
    const result = await ctrl.show();
    return result.done && !result.error ? 'completed' : (lastFailure ?? 'skipped');
  } catch {
    // Adsgram rejects with a ShowPromiseResult-shaped object on skip/error;
    // a captured event narrows the reason, otherwise the user closed it early.
    return lastFailure ?? 'skipped';
  }
}
