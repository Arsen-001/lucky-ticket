import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/**
 * Guardrails for the rewarded-ad waterfall (`src/lib/ads`).
 *
 * The money rules live here: exactly one ad per action, a user-initiated skip
 * must never fall through to another provider (otherwise "close the ad" turns
 * into a second chance at a reward), and the house ad must not stand in for a
 * network in dev — that would replace the instant mock grant with a promo.
 *
 * `Env` snapshots process.env at import time, so every case sets the env first
 * and then imports the module fresh.
 */

type AdsModule = typeof import('@/lib/ads');
type HouseModule = typeof import('@/lib/ads/house.provider');

const AD_ENV_KEYS = [
  'NEXT_PUBLIC_ADSGRAM_BLOCK_ID',
  'NEXT_PUBLIC_MONETAG_ZONE_ID',
  'NEXT_PUBLIC_AD_PROVIDERS',
] as const;

async function loadAds(env: Partial<Record<(typeof AD_ENV_KEYS)[number], string>>) {
  for (const key of AD_ENV_KEYS) delete process.env[key];
  Object.assign(process.env, env);
  vi.resetModules();
  const ads: AdsModule = await import('@/lib/ads');
  const house: HouseModule = await import('@/lib/ads/house.provider');
  return { ads, house };
}

/**
 * Minimal fake of the Adsgram SDK. `reject` is what `show()` rejects with —
 * the shape decides whether the app reads it as a skip or a failure.
 */
function stubAdsgram(reject: unknown) {
  (globalThis as Record<string, unknown>).window = {
    Adsgram: {
      init: () => ({
        show: () => Promise.reject(reject),
        addEventListener: () => {},
      }),
    },
  };
}

beforeEach(() => {
  delete (globalThis as Record<string, unknown>).window;
});

afterEach(() => {
  delete (globalThis as Record<string, unknown>).window;
  for (const key of AD_ENV_KEYS) delete process.env[key];
});

describe('rewarded-ad waterfall', () => {
  it('reports `unavailable` when no network is configured, even with the house ad mounted', async () => {
    const { ads, house } = await loadAds({});
    house.registerHousePresenter(async () => 'completed');

    // The dev/mock flow depends on this: a promo screen must not replace the
    // instant grant just because the overlay happens to be mounted.
    expect(await ads.showRewardedAd()).toEqual({ outcome: 'unavailable', provider: null });
  });

  it('falls through a failing network to the house ad', async () => {
    const { ads, house } = await loadAds({ NEXT_PUBLIC_ADSGRAM_BLOCK_ID: '37750' });
    house.registerHousePresenter(async () => 'completed');

    // No SDK on the page → the Adsgram provider fails, and the chain continues.
    expect(await ads.showRewardedAd()).toEqual({ outcome: 'completed', provider: 'house' });
  });

  it('stops on a user skip instead of offering the next provider', async () => {
    // Adsgram rejects with error=false when the user closed the ad early.
    stubAdsgram({ done: false, error: false, state: 'destroy', description: 'closed' });
    const { ads, house } = await loadAds({ NEXT_PUBLIC_ADSGRAM_BLOCK_ID: '37750' });

    let housePlayed = false;
    house.registerHousePresenter(async () => {
      housePlayed = true;
      return 'completed';
    });

    expect(await ads.showRewardedAd()).toEqual({ outcome: 'skipped', provider: 'adsgram' });
    expect(housePlayed, 'a skip must not fall through to another ad').toBe(false);
  });

  it('treats a playback failure as a fall-through, not a skip', async () => {
    stubAdsgram({ done: false, error: true, state: 'playing', description: 'failed' });
    const { ads, house } = await loadAds({ NEXT_PUBLIC_ADSGRAM_BLOCK_ID: '37750' });
    house.registerHousePresenter(async () => 'completed');

    expect(await ads.showRewardedAd()).toEqual({ outcome: 'completed', provider: 'house' });
  });

  it('honours the order in NEXT_PUBLIC_AD_PROVIDERS and drops unknown ids', async () => {
    const { ads, house } = await loadAds({
      NEXT_PUBLIC_ADSGRAM_BLOCK_ID: '37750',
      NEXT_PUBLIC_MONETAG_ZONE_ID: '123',
      NEXT_PUBLIC_AD_PROVIDERS: 'monetag, nonsense ,adsgram',
    });
    house.registerHousePresenter(async () => 'completed');

    // House is not in the list, so the chain ends on the last network failure.
    const result = await ads.showRewardedAd();
    expect(result.provider).toBe('adsgram');
    expect(result.outcome).not.toBe('completed');
  });

  it('ends on the last network failure when the house ad is not mounted', async () => {
    const { ads } = await loadAds({ NEXT_PUBLIC_ADSGRAM_BLOCK_ID: '37750' });

    expect(await ads.showRewardedAd()).toEqual({ outcome: 'error', provider: 'adsgram' });
  });
});
