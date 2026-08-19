import { Env } from '@/services/environment.service';
import { classifyFastReject } from './fast-reject';
import type { AdProvider, RewardedAdOutcome } from './types';

/**
 * RichAds rewarded-ad provider (Telegram Mini App "interstitial video").
 *
 * The SDK is a plain script loaded in the root layout (no npm package) that
 * puts a `TelegramAdsController` class on `window`. One controller is built and
 * initialised with the publisher's two ids, then every view is one
 * `triggerInterstitialVideo()` call. Docs:
 * https://docs.richads.com/publishers/tma-integration.html
 *
 * Two things their documentation does NOT give us, both load-bearing here:
 *
 * - **No reason code.** The promise rejects with an undocumented `result` for
 *   every failure — no fill, playback error and a player closing the ad are one
 *   and the same rejection. `classifyFastReject` separates them by elapsed
 *   time, exactly as the Monetag provider has to.
 * - **No server-to-server postback.** Adsgram and Monetag both call us back and
 *   that callback is what actually grants the reward; RichAds has no such
 *   thing, so a completed RichAds view is credited on the CLIENT's word
 *   (`s2sEnabledFor('richads')` is false in the backend). That is a real hole —
 *   a crafted request can claim a view that never played — and the reason to
 *   keep this network below the two that can be verified, not above them.
 */

interface RichAdsController {
  initialize: (params: { pubId: string; appId: string; debug?: boolean }) => void;
  triggerInterstitialVideo: () => Promise<unknown>;
}

declare global {
  interface Window {
    TelegramAdsController?: new () => RichAdsController;
  }
}

function getIds(): { pubId: string; appId: string } | null {
  const pubId = Env.richadsPubId?.trim();
  const appId = Env.richadsAppId?.trim();
  return pubId && appId ? { pubId, appId } : null;
}

// One initialised controller per session. `initialize` is what the first view
// would otherwise pay for, so building it early is the whole warm-up — the SDK
// exposes no separate "fetch an ad now" call.
let controller: RichAdsController | null = null;

function getController(): RichAdsController | null {
  if (controller) return controller;
  const ids = getIds();
  if (typeof window === 'undefined' || !ids || !window.TelegramAdsController) return null;
  const next = new window.TelegramAdsController();
  next.initialize({ ...ids, debug: Env.richadsDebug });
  controller = next;
  return controller;
}

async function show(): Promise<Exclude<RewardedAdOutcome, 'unavailable'>> {
  const ctrl = getController();
  // Configured but the SDK script hasn't loaded — do NOT credit a free reward.
  if (!ctrl) return 'error';

  const startedAt = performance.now();
  try {
    await ctrl.triggerInterstitialVideo();
    return 'completed';
  } catch {
    return classifyFastReject(startedAt);
  }
}

export const richadsProvider: AdProvider = {
  id: 'richads',
  isConfigured: () => !!getIds(),
  preload: () => void getController(),
  show,
};
