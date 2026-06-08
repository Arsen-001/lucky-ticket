import { test } from '@playwright/test';
import { assertScreenRenders } from './helpers';

/**
 * Smoke over parameterized DETAIL screens, using stable ids from the mock
 * fixtures (`src/mock/**`). Tournament / profile / support resolve to real data
 * even on a fresh account (global catalogs); stake / engine have no owned data
 * on a fresh account, so those URLs exercise the detail shell's not-found /
 * empty state — which must still render without crashing.
 */
const DETAIL_PAGES = [
  // Tournament detail (carries the "X% to the Jackpot" note) — stable mock id.
  { name: 'tournament', url: '/tournaments/123e4567-e89b-12d3-a456-426655440010' },
  // Another player's profile — bound to the `otherProfile` fixture (user-2).
  { name: 'other-profile', url: '/profile/user-2' },
  // Support article — stable id from support.mock.
  { name: 'support', url: '/support/1' },
  // Stake detail — `stake-mid` is populated on a demo account, empty-state on fresh.
  { name: 'stake', url: '/stakes/stake-mid' },
  // Engine detail — no stable owned-engine id on fresh; exercises the not-found shell.
  { name: 'engine', url: '/engines/eng-smoke' },
];

for (const { name, url } of DETAIL_PAGES) {
  test(`detail screen renders without errors: ${name}`, async ({ page }) => {
    await assertScreenRenders(page, `${name} (${url})`, url);
  });
}
