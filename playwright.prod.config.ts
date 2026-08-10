import { defineConfig, devices } from '@playwright/test';

/**
 * The production-build suite. Separate from `playwright.config.ts` because it
 * needs a different server: `next build && next start`, not `next dev`.
 *
 * That difference is the whole point — the optimizer, prerendering and route
 * redirects behave differently in a build, and three shipped defects were
 * invisible to the dev-server suite. Kept as its own config (and its own npm
 * script) so the fast dev smoke stays fast; this one pays for a full build.
 *
 * Port 3100, not 3000: a dev server is usually already running there.
 */
const BASE_URL = 'http://localhost:3100';

export default defineConfig({
  testDir: './e2e-prod',
  // Fills the image-optimizer cache before the workers start. Read the file for
  // the failure it prevents — a coalesced optimizer job whose first requester
  // walks away leaves a key that never answers again, for anyone.
  globalSetup: './e2e-prod/warm-image-cache.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 1,
  workers: 3,
  reporter: 'list',
  timeout: 90_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    // Mobile-first app → a phone viewport, where sideways scroll actually shows.
    ...devices['Desktop Chrome'],
    viewport: { width: 390, height: 844 },
  },
  webServer: {
    // Builds against the mock layer so every screen has data without a backend.
    command: 'npm run e2e:prod-server',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    // A cold production build is minutes, not seconds.
    timeout: 600_000,
  },
});
