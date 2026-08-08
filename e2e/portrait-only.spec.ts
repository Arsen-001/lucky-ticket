import { expect, test } from '@playwright/test';

/**
 * The game is played upright — a phone turned on its side gets a "rotate back"
 * wall instead of the app. @see PortraitOnlyGate
 *
 * Worth an e2e rather than a unit check: the rule is a media query, so the only
 * way to know it fires is to be a viewport it should fire on. Both directions
 * are asserted, because the expensive mistake here is not "landscape slipped
 * through" — it is the wall appearing on a laptop and taking the desktop access
 * key (`?desktop=<key>`) and local development down with it.
 */

const SLOW = 30_000;

test('a phone on its side gets the wall instead of the app', async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  await expect(page.getByRole('alertdialog')).toBeVisible({ timeout: SLOW });
  // Not merely covered: the app is taken out of the a11y tree and the tab order.
  await expect(page.locator('#scroll-container')).toBeHidden();

  // Turning the phone back gives the game back — the app was never unmounted,
  // so nothing was reloaded and nothing was lost.
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByTestId('app-shell')).toBeVisible({ timeout: SLOW });
  await expect(page.getByRole('alertdialog')).toBeHidden();
});

test('a landscape desktop window is left alone', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  await expect(page.getByTestId('app-shell')).toBeVisible({ timeout: SLOW });
  await expect(page.getByRole('alertdialog')).toBeHidden();
});
