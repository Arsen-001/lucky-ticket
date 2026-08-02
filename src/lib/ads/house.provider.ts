import type { AdProvider, RewardedAdOutcome } from './types';

/**
 * House ad — the app's own promo, shown when no network had anything to serve.
 *
 * Ad networks never guarantee fill, so without this the "watch an ad" task
 * dead-ends on a bare "no ads right now" modal. The house ad replaces that
 * dead end with something useful to us: an in-app promo plus a way to ask for
 * a real ad again. It is always last in the waterfall.
 *
 * **It never grants.** The impression is unpaid — nobody bought it — so
 * rewarding it would hand out AP for nothing. That is why the presenter has no
 * `completed` exit at all: the reward can only come from a network.
 *
 * The actual UI lives in a React component (`HouseAdOverlay`), which registers
 * itself here on mount. This module is the DOM-free bridge that lets the plain
 * `showRewardedAd()` function hand control to that component and await it.
 */

/**
 * How the player left the promo:
 * - `skipped` — closed it, same meaning as closing a network's video.
 * - `retry`   — asked for another go at a real ad.
 */
export type HouseAdExit = 'skipped' | 'retry';

type HousePresenter = () => Promise<HouseAdExit>;

let presenter: HousePresenter | null = null;

/**
 * Called by `HouseAdOverlay` on mount. Returns the unregister function so the
 * component can clear it on unmount — a stale presenter belonging to an
 * unmounted overlay would never resolve.
 */
export function registerHousePresenter(next: HousePresenter): () => void {
  presenter = next;
  return () => {
    if (presenter === next) presenter = null;
  };
}

async function show(): Promise<Exclude<RewardedAdOutcome, 'unavailable'>> {
  if (!presenter) return 'error';
  try {
    // `retry` reports as `noAd`, which is literally what happened: every
    // network came up empty and the promo stood in for them. The caller reads
    // the provider (`house`) to tell that apart from a network's own no-fill.
    return (await presenter()) === 'skipped' ? 'skipped' : 'noAd';
  } catch {
    return 'error';
  }
}

export const houseProvider: AdProvider = {
  id: 'house',
  // Configured exactly when a mounted overlay is ready to render it.
  isConfigured: () => presenter !== null,
  show,
};
