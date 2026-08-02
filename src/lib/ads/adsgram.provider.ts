import { Env } from '@/services/environment.service';
import type { AdProvider, RewardedAdFailure, RewardedAdOutcome } from './types';

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

async function show(): Promise<Exclude<RewardedAdOutcome, 'unavailable'>> {
  const ctrl = getController();
  // Configured but the SDK script hasn't loaded — do NOT credit a free reward.
  if (!ctrl) return 'error';

  lastFailure = null;
  try {
    const result = await ctrl.show();
    return result.done && !result.error ? 'completed' : (lastFailure ?? 'skipped');
  } catch (reason) {
    // A captured SDK event narrows the reason first.
    if (lastFailure) return lastFailure;
    // Adsgram rejects with a ShowPromiseResult-shaped object when the ad was
    // shown but not completed: error=true is a playback failure, error=false
    // means the user closed it early. Config-class failures (inactive block,
    // unknown blockId, wrong referer, …) reject with an AdsgramError instance
    // instead — treat those as 'error' so the waterfall moves on rather than
    // reporting the misleading "user skipped it".
    if (reason && typeof reason === 'object' && 'done' in reason) {
      return (reason as ShowPromiseResult).error ? 'error' : 'skipped';
    }
    return 'error';
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
