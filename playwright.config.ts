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
      // 486px cube into a 300px slot once while every Chromium check stayed green.
      //
      // Scoped to the CUBE checks, not the whole spec: that divergence is about
      // computed values, and the per-route overflow sweep is plain box-model
      // layout, which Chromium already covers. Walking 40 routes twice pushed this
      // job to 10 min on a good day and tipped it over the 90s-per-page timeout on
      // a slow runner — three routes failed that way, none of them for a layout
      // reason. Four cube tests keep the engine coverage that actually earned its
      // place.
      //
      // What this project can NOT tell you: anything about how 3D PAINTS. This
      // WebKit build (headless and headed alike, measured 09.08.2026) renders no
      // CSS 3D at all — `perspective` on a parent is ignored, and a `preserve-3d`
      // stack paints in DOM order with no depth sorting, so the far face lands on
      // top of the near one. A screenshot of the engine cube here therefore shows
      // the passport face mirrored over the card, on any code: it is the probe
      // flattening the cube, not the app. The cube checks below survive that
      // because they read geometry (`getBoundingClientRect`, computed transforms),
      // which WebKit computes correctly — verified face by face against Chromium,
      // identical to the pixel. Judge the cube's LOOK on a device or in real
      // Safari; never from a `playwright.webkit` screenshot.
      name: 'webkit',
      testMatch: /layout-invariants\.spec\.ts/,
      grepInvert: /no screen scrolls sideways/,
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
