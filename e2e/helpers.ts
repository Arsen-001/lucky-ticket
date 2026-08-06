import { expect, type Page } from '@playwright/test';

// A literal ICU placeholder leaking into rendered text, e.g. "{n}" / "{percent}".
const PLACEHOLDER_LEAK = /\{[a-zA-Z]+\}/;

// React's SSR→client fallback is recoverable — the screen still renders fine for
// the user — so it isn't a crash for smoke purposes. Everything else counts.
const RECOVERABLE = ['Switched to client rendering because the server rendering errored'];

/**
 * Shared smoke assertion: a screen must load without an HTTP error, render real
 * (non-skeleton) text, throw no uncaught runtime error, and not leak an
 * un-interpolated i18n placeholder. Polls for visible text instead of sleeping
 * a fixed amount — image/skeleton-heavy screens can be slow to fill under load.
 */
export async function assertScreenRenders(page: Page, label: string, url: string) {
  const errors: string[] = [];
  page.on('pageerror', error => {
    if (!RECOVERABLE.some(msg => error.message.includes(msg))) errors.push(error.message);
  });

  const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
  expect(response?.status() ?? 0, `HTTP status for ${label}`).toBeLessThan(400);

  // Wait for the mock data (≤1200ms latency, slower under load) to render text.
  await expect
    .poll(async () => (await page.locator('body').innerText()).trim().length, {
      timeout: 15_000,
      message: `${label} never rendered visible text`,
    })
    .toBeGreaterThan(0);

  // Positive identity: this has to be the APP, not one of the four screens that
  // render in its place. `PreLaunchGate` swaps the whole tree for the countdown,
  // the maintenance wall, the boot splash or open-on-your-phone — every one of
  // which loads fine, renders plenty of text and leaks no placeholder, so the
  // checks above pass on all of them. A run with the gate up scored a clean
  // sweep against the same countdown on every route.
  await expect(
    page.getByTestId('app-shell'),
    `${label} did not render the app itself`
  ).toBeAttached({ timeout: 15_000 });

  // Let any late async error surface, then assert no crash + no placeholder leak.
  await page.waitForTimeout(300);
  expect(errors, `uncaught runtime errors on ${label}`).toEqual([]);

  const body = (await page.locator('body').innerText()).trim();
  expect(PLACEHOLDER_LEAK.test(body), `raw i18n placeholder leaked on ${label}`).toBe(false);
}
