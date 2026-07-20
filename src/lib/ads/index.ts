import { Env } from '@/services/environment.service';
import { adsgramProvider } from './adsgram.provider';
import { monetagProvider } from './monetag.provider';
import { houseProvider } from './house.provider';
import type { AdProvider, AdProviderId, RewardedAdResult } from './types';

/**
 * Rewarded-ad waterfall.
 *
 * One user action plays exactly ONE ad. Networks are tried in order and the
 * next one is only asked after the previous returned nothing — never two ads
 * in a row. The house ad closes the chain so the action always works, even
 * when every network is empty.
 *
 * Order comes from `NEXT_PUBLIC_AD_PROVIDERS` (comma-separated) so it can be
 * re-tuned from Vercel env once real per-network eCPM is known, with no code
 * change. Unknown or unconfigured ids are dropped.
 */

const PROVIDERS: Record<AdProviderId, AdProvider> = {
  adsgram: adsgramProvider,
  monetag: monetagProvider,
  house: houseProvider,
};

/** Applied when `NEXT_PUBLIC_AD_PROVIDERS` is unset. */
const DEFAULT_ORDER: AdProviderId[] = ['adsgram', 'monetag', 'house'];

function isProviderId(value: string): value is AdProviderId {
  return value in PROVIDERS;
}

/** The configured order, before filtering by what's actually usable. */
function getConfiguredOrder(): AdProviderId[] {
  const raw = Env.adProviders?.trim();
  if (!raw) return DEFAULT_ORDER;
  const ids = raw
    .split(',')
    .map(part => part.trim())
    .filter(isProviderId);
  return ids.length > 0 ? ids : DEFAULT_ORDER;
}

function getChain(): AdProvider[] {
  return getConfiguredOrder()
    .map(id => PROVIDERS[id])
    .filter(provider => provider.isConfigured());
}

/**
 * Warm up the first network that supports it. Called when the ads UI mounts so
 * the first watch doesn't pay for a cold request.
 */
export function preloadRewardedAd(): void {
  for (const provider of getChain()) provider.preload?.();
}

/**
 * Play a rewarded ad and resolve with a normalized outcome plus the provider
 * that produced it. Never throws — the caller branches on the outcome to
 * decide whether to credit.
 */
export async function showRewardedAd(): Promise<RewardedAdResult> {
  const chain = getChain();

  // No real network wired (dev / plain browser / e2e) — keep the existing mock
  // flow. The house ad alone must not stand in for a network here: it would
  // replace the instant dev grant with a promo screen for no reason.
  if (!chain.some(provider => provider.id !== 'house')) {
    return { outcome: 'unavailable', provider: null };
  }

  let last: RewardedAdResult = { outcome: 'error', provider: chain[0].id };
  for (const provider of chain) {
    const outcome = await provider.show();

    // Watched to the end → done. Closed by the user → also done: falling
    // through would turn "close the ad" into "get another chance at a
    // reward", so the chain stops and nothing is granted.
    if (outcome === 'completed' || outcome === 'skipped') return { outcome, provider: provider.id };

    // noAd / tooFast / error → the next provider gets a turn. The last one is
    // reported if everyone comes up empty, so the modal explains the real
    // reason rather than a generic failure.
    last = { outcome, provider: provider.id };
  }

  return last;
}

export type { RewardedAdOutcome, RewardedAdResult, AdProviderId } from './types';
