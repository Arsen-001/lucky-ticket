import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/**
 * Guardrails for the rewarded-ad waterfall (`src/lib/ads`).
 *
 * The money rules live here: exactly one ad per action, a user-initiated skip
 * must never fall through to another provider (otherwise "close the ad" turns
 * into a second chance at a reward), and an empty chain must surface the
 * network's OWN reason — that reason is what the player's modal names and what
 * the attempt is telemetered against. Nothing stands in for a missing video: the
 * app's own promo used to close the chain and was removed on 17.08.2026,
 * because it cost a second tap and attributed every no-fill to itself.
 *
 * `Env` snapshots process.env at import time, so every case sets the env first
 * and then imports the module fresh.
 */

type AdsModule = typeof import('@/lib/ads');

const AD_ENV_KEYS = [
  'NEXT_PUBLIC_ADSGRAM_BLOCK_ID',
  'NEXT_PUBLIC_MONETAG_ZONE_ID',
  'NEXT_PUBLIC_AD_PROVIDERS',
] as const;

async function loadAds(
  env: Partial<Record<(typeof AD_ENV_KEYS)[number], string>>
): Promise<AdsModule> {
  for (const key of AD_ENV_KEYS) delete process.env[key];
  Object.assign(process.env, env);
  vi.resetModules();
  return import('@/lib/ads');
}

/**
 * Minimal fake of the Adsgram SDK. `reject` is what `show()` rejects with — the
 * shape decides whether the app reads it as a skip or a failure. `event`, when
 * given, is emitted first, exactly as the real SDK does: it prefers a
 * registered listener over its own Telegram alert, and the listener is what
 * narrows the reason.
 */
function stubAdsgram(reject: unknown, event?: 'onBannerNotFound' | 'onNonStopShow' | 'onError') {
  const handlers: Record<string, () => void> = {};
  (globalThis as Record<string, unknown>).window = {
    Adsgram: {
      init: () => ({
        show: () => {
          if (event) handlers[event]?.();
          return Promise.reject(reject);
        },
        addEventListener: (name: string, handler: () => void) => {
          handlers[name] = handler;
        },
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
const ZONE_ID = '123';

beforeEach(() => {
  delete (globalThis as Record<string, unknown>).window;
});

afterEach(() => {
  delete (globalThis as Record<string, unknown>).window;
  for (const key of AD_ENV_KEYS) delete process.env[key];
});

describe('rewarded-ad waterfall', () => {
  it('reports `unavailable` when no network is configured', async () => {
    const ads = await loadAds({});

    // The dev/mock flow depends on this: with nothing wired the action keeps
    // working and the backend decides, instead of refusing on the client.
    expect(await ads.showRewardedAd()).toEqual({ outcome: 'unavailable', provider: null });
  });

  it("surfaces the network's own reason when it has no fill", async () => {
    // `onBannerNotFound` + a rejected show() is Adsgram's empty answer.
    stubAdsgram(new Error('AdsgramError'), 'onBannerNotFound');
    const ads = await loadAds({ NEXT_PUBLIC_ADSGRAM_BLOCK_ID: BLOCK_ID });

    // Both halves matter: `noAd` picks the modal's copy, and `adsgram` is what
    // the attempt is reported against. A stand-in provider closing the chain
    // would replace both.
    expect(await ads.showRewardedAd()).toEqual({ outcome: 'noAd', provider: 'adsgram' });
  });

  it('stops on a user skip instead of asking the next network', async () => {
    // Adsgram rejects with error=false when the user closed the ad early.
    stubAdsgram({ done: false, error: false, state: 'destroy', description: 'closed' });
    const ads = await loadAds({
      NEXT_PUBLIC_ADSGRAM_BLOCK_ID: BLOCK_ID,
      NEXT_PUBLIC_MONETAG_ZONE_ID: ZONE_ID,
    });

    // Monetag is configured and next in line, so a fall-through would show up
    // as its id here.
    expect(await ads.showRewardedAd()).toEqual({ outcome: 'skipped', provider: 'adsgram' });
  });

  it('treats a playback failure as a fall-through, not a skip', async () => {
    stubAdsgram({ done: false, error: true, state: 'playing', description: 'failed' });
    const ads = await loadAds({
      NEXT_PUBLIC_ADSGRAM_BLOCK_ID: BLOCK_ID,
      NEXT_PUBLIC_MONETAG_ZONE_ID: ZONE_ID,
    });

    // Monetag gets its turn and fails too (no SDK tag on the page), so the
    // reason reported is the LAST network's.
    expect(await ads.showRewardedAd()).toEqual({ outcome: 'error', provider: 'monetag' });
  });

  it('honours the order in NEXT_PUBLIC_AD_PROVIDERS and drops unknown ids', async () => {
    const ads = await loadAds({
      NEXT_PUBLIC_ADSGRAM_BLOCK_ID: BLOCK_ID,
      NEXT_PUBLIC_MONETAG_ZONE_ID: ZONE_ID,
      NEXT_PUBLIC_AD_PROVIDERS: 'monetag, nonsense ,adsgram',
    });

    // Monetag is asked first, so the chain ends on Adsgram — the reverse of the
    // default order.
    const result = await ads.showRewardedAd();
    expect(result.provider).toBe('adsgram');
    expect(result.outcome).not.toBe('completed');
  });

  it('ignores a leftover `house` entry in the env list', async () => {
    // Production ran `adsgram,house` until 17.08.2026. That value must degrade
    // to the network alone rather than resurrect a stand-in for a missing ad.
    const withNetwork = await loadAds({
      NEXT_PUBLIC_ADSGRAM_BLOCK_ID: BLOCK_ID,
      NEXT_PUBLIC_AD_PROVIDERS: 'adsgram,house',
    });
    expect((await withNetwork.showRewardedAd()).provider).toBe('adsgram');

    // `house` on its own leaves no usable id, which falls back to the default
    // order — networks only.
    const houseOnly = await loadAds({
      NEXT_PUBLIC_ADSGRAM_BLOCK_ID: BLOCK_ID,
      NEXT_PUBLIC_AD_PROVIDERS: 'house',
    });
    expect((await houseOnly.showRewardedAd()).provider).toBe('adsgram');
  });

  it('ends on the network failure when only one network is wired', async () => {
    const ads = await loadAds({ NEXT_PUBLIC_ADSGRAM_BLOCK_ID: BLOCK_ID });

    // Configured but no SDK on the page — `error`, and no free reward.
    expect(await ads.showRewardedAd()).toEqual({ outcome: 'error', provider: 'adsgram' });
  });
});
