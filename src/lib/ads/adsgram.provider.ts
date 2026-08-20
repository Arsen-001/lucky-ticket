import { Env } from '@/services/environment.service';
import type { AdProvider, AdShowResult, RewardedAdFailure } from './types';

/**
 * Adsgram rewarded-ad provider.
 *
 * Adsgram has no npm package — the SDK is a script loaded in the root layout
 * (see `app/layout.tsx`) that exposes `window.Adsgram`. Docs:
 * https://docs.adsgram.ai/publisher/api-reference
 *
 * Note: Adsgram binds a block id to the platform's Web App URL and hard-matches
 * it against the running origin, so a domain change requires a new block id.
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

function getBlockId(): string | undefined {
  return Env.adsgramBlockId || undefined;
}

// One controller per block id is enough — Adsgram returns the same instance for
// a repeated init, but memoizing avoids re-entering the SDK on every watch.
let controller: AdController | null = null;

// Reason captured from SDK events during the current show() attempt. The SDK
// emits the event synchronously before rejecting the show() promise, so the
// catch below reads the value of the attempt that just failed.
let lastFailure: RewardedAdFailure | null = null;

/**
 * Whether the current attempt put anything on screen. The SDK says so in the
 * `state` it fails with — `load` is still fetching, everything after it has a
 * creative up — and that is what decides whether the waterfall may ask another
 * network. Asking one after a video the player already watched is how a single
 * tap produced two ads.
 */
let reachedScreen = false;

function getController(): AdController | null {
  if (controller) return controller;
  const blockId = getBlockId();
  if (typeof window === 'undefined' || !blockId || !window.Adsgram) return null;
  controller = window.Adsgram.init({ blockId, debug: Env.adsgramDebug });
  controller.addEventListener('onBannerNotFound', () => (lastFailure = 'noAd'));
  controller.addEventListener('onNonStopShow', () => (lastFailure = 'tooFast'));
  // The session ran long — which can only happen to an ad that was PLAYING.
  controller.addEventListener('onTooLongSession', () => {
    lastFailure = 'error';
    reachedScreen = true;
  });
  controller.addEventListener('onError', () => (lastFailure = 'error'));
  return controller;
}

/** Every state but `load` means a creative was already on screen. */
function stateReachedScreen(state: ShowPromiseResult['state'] | undefined): boolean {
  return state !== undefined && state !== 'load';
}

async function show(): Promise<AdShowResult> {
  const ctrl = getController();
  // Configured but the SDK script hasn't loaded — do NOT credit a free reward.
  // Nothing was shown, so the next network may still try.
  if (!ctrl) return { outcome: 'error' };

  lastFailure = null;
  reachedScreen = false;
  try {
    const result = await ctrl.show();
    if (result.done && !result.error) return { outcome: 'completed', displayed: true };
    return {
      outcome: lastFailure ?? 'skipped',
      displayed: reachedScreen || stateReachedScreen(result.state),
    };
  } catch (reason) {
    // Adsgram rejects with a ShowPromiseResult-shaped object when the ad was
    // shown but not completed: error=true is a playback failure, error=false
    // means the user closed it early. Config-class failures (inactive block,
    // unknown blockId, wrong referer, …) reject with an AdsgramError instance
    // instead — treat those as 'error' so the waterfall moves on rather than
    // reporting the misleading "user skipped it".
    const shaped =
      reason && typeof reason === 'object' && 'done' in reason
        ? (reason as ShowPromiseResult)
        : null;
    const displayed = reachedScreen || stateReachedScreen(shaped?.state);

    // A captured SDK event narrows the reason first.
    if (lastFailure) return { outcome: lastFailure, displayed };
    if (shaped) return { outcome: shaped.error ? 'error' : 'skipped', displayed };
    return { outcome: 'error', displayed };
  }
}

export const adsgramProvider: AdProvider = {
  id: 'adsgram',
  isConfigured: () => !!getBlockId(),
  // Adsgram has no "fetch an ad ahead of time" call — `init` is the whole
  // warm-up, and it is what the first `show()` would otherwise pay for. Safe to
  // repeat: the SDK returns the same controller, and we memoise it anyway.
  preload: () => void getController(),
  show,
};
