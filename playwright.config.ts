import { defineConfig, devices } from '@playwright/test';

// Overridable so the suite can be pointed at a server started with different
// env — which is how the "is this the app or the countdown?" assertion gets a
// positive control: run it once against a server with NEXT_PUBLIC_COMING_SOON=1
// and it must FAIL. A check that has never been seen failing proves nothing.
const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3000';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // One retry absorbs the occasional dev-server timing flake under load
  // (the suite auto-starts `next dev`, which compiles routes on demand).
  retries: 1,
  workers: 3,
  reporter: 'list',
  timeout: 90_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      // Mobile-first app → run the smoke at a phone viewport on Chromium.
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 } },
    },
    {
      // The audience is iPhones inside Telegram, i.e. WKWebView — and WebKit does
      // not always COMPUTE from the same CSS what Chromium computes. It shipped a
      // 486px cube into a 300px slot once (see layout-invariants.spec.ts) while
      // every Chromium check stayed green. Scoped to the invariants spec, which
      // walks every screen itself, so the engine is covered without doubling the
      // whole suite.
      name: 'webkit',
      testMatch: /layout-invariants\.spec\.ts/,
      use: { ...devices['iPhone 14 Pro Max'] },
    },
  ],
  // Auto-start the app (mock backend) for the smoke; reuse a running dev server locally.
  webServer: {
    command: 'npm run dev',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
