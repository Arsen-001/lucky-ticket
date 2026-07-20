import type { AdProvider, RewardedAdOutcome } from './types';

/**
 * House ad — the app's own promo, shown when no network had anything to serve.
 *
 * Ad networks never guarantee fill, so without this the "watch an ad" task
 * dead-ends on a "no ads right now" modal. The house ad turns that dead end
 * into a working action: the user watches an in-app promo instead and the
 * reward flow proceeds. It is always last in the waterfall — a paid impression
 * is always preferred over an unpaid one.
 *
 * The actual UI lives in a React component (`HouseAdOverlay`), which registers
 * itself here on mount. This module is the DOM-free bridge that lets the plain
 * `showRewardedAd()` function hand control to that component and await it.
 */

type HousePresenter = () => Promise<'completed' | 'skipped'>;

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
    return await presenter();
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
