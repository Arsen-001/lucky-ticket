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

/**
 * A placeholder, not the live unit. These tests only care that SOME block id is
 * set — the waterfall branches on presence, never on the value — and the real
 * one used to sit here in six places, in a repository that is public.
 *
 * Worth being honest about what this buys: almost nothing on its own. The
 * Adsgram SDK sends the block id from the player's browser, so anyone who opens
 * the Mini App can read it off the network tab; it is a public identifier by
 * construction, not a secret. What it does buy is that the number is no longer
 * greppable next to the project name in a public repo, which is the same reason
 * the revenue docs moved out (13.08.2026).
 */
const BLOCK_ID = '00000';

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
    house.registerHousePresenter(async () => 'retry');

    // The dev/mock flow depends on this: a promo screen must not replace the
    // instant grant just because the overlay happens to be mounted.
    expect(await ads.showRewardedAd()).toEqual({ outcome: 'unavailable', provider: null });
  });

  it('falls through a failing network to the house ad', async () => {
    const { ads, house } = await loadAds({ NEXT_PUBLIC_ADSGRAM_BLOCK_ID: BLOCK_ID });
    house.registerHousePresenter(async () => 'retry');

    // No SDK on the page → the Adsgram provider fails, and the chain continues.
    // The house ad answers, and answers `noAd`: it fills the screen, never the
    // wallet.
    expect(await ads.showRewardedAd()).toEqual({ outcome: 'noAd', provider: 'house' });
  });

  it('stops on a user skip instead of offering the next provider', async () => {
    // Adsgram rejects with error=false when the user closed the ad early.
    stubAdsgram({ done: false, error: false, state: 'destroy', description: 'closed' });
    const { ads, house } = await loadAds({ NEXT_PUBLIC_ADSGRAM_BLOCK_ID: BLOCK_ID });

    let housePlayed = false;
    house.registerHousePresenter(async () => {
      housePlayed = true;
      return 'retry';
    });

    expect(await ads.showRewardedAd()).toEqual({ outcome: 'skipped', provider: 'adsgram' });
    expect(housePlayed, 'a skip must not fall through to another ad').toBe(false);
  });

  it('treats a playback failure as a fall-through, not a skip', async () => {
    stubAdsgram({ done: false, error: true, state: 'playing', description: 'failed' });
    const { ads, house } = await loadAds({ NEXT_PUBLIC_ADSGRAM_BLOCK_ID: BLOCK_ID });
    house.registerHousePresenter(async () => 'retry');

    expect(await ads.showRewardedAd()).toEqual({ outcome: 'noAd', provider: 'house' });
  });

  it('never grants for the house ad, whichever way the player leaves it', async () => {
    // The money rule: an unpaid impression must not be able to pay out. Both
    // exits are checked, so adding a third one to the overlay fails here first.
    for (const exit of ['retry', 'skipped'] as const) {
      const { ads, house } = await loadAds({ NEXT_PUBLIC_ADSGRAM_BLOCK_ID: BLOCK_ID });
      house.registerHousePresenter(async () => exit);

      const result = await ads.showRewardedAd();
      expect(result.provider).toBe('house');
      expect(result.outcome).not.toBe('completed');
    }
  });

  it('honours the order in NEXT_PUBLIC_AD_PROVIDERS and drops unknown ids', async () => {
    const { ads, house } = await loadAds({
      NEXT_PUBLIC_ADSGRAM_BLOCK_ID: BLOCK_ID,
      NEXT_PUBLIC_MONETAG_ZONE_ID: '123',
      NEXT_PUBLIC_AD_PROVIDERS: 'monetag, nonsense ,adsgram',
    });
    house.registerHousePresenter(async () => 'retry');

    // House is not in the list, so the chain ends on the last network failure.
    const result = await ads.showRewardedAd();
    expect(result.provider).toBe('adsgram');
    expect(result.outcome).not.toBe('completed');
  });

  it('ends on the last network failure when the house ad is not mounted', async () => {
    const { ads } = await loadAds({ NEXT_PUBLIC_ADSGRAM_BLOCK_ID: BLOCK_ID });

    expect(await ads.showRewardedAd()).toEqual({ outcome: 'error', provider: 'adsgram' });
  });
});
