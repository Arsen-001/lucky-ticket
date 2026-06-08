import { defineConfig, devices } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

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
    // Mobile-first app → run the smoke at a phone viewport on Chromium.
    ...devices['Desktop Chrome'],
    viewport: { width: 390, height: 844 },
  },
  // Auto-start the app (mock backend) for the smoke; reuse a running dev server locally.
  webServer: {
    command: 'npm run dev',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
