import { expect, test, type Page } from '@playwright/test';

/**
 * The game is played upright — a phone turned on its side gets a "rotate back"
 * wall instead of the app. @see PortraitOnlyGate
 *
 * Worth an e2e rather than a unit check: the rule is a media query, so the only
 * way to know it fires is to be a viewport it should fire on. Every direction is
 * asserted, because "landscape slipped through" is the cheap mistake here. The
 * expensive ones are the wall showing up where it must not: on a laptop (which
 * takes the desktop access key `?desktop=<key>` and local development down with
 * it) and on an upright phone whose webview merely happens to be short and wide.
 */

const SLOW = 30_000;

/**
 * Headless Chromium reports a fixed `screen.orientation` no matter what the
 * emulated viewport is, so the device half of the rule has to be stubbed — and
 * stubbing it is the point: viewport shape and device orientation are exactly
 * the two things the wall must stop confusing.
 *
 * `'follow-viewport'` is an ordinary phone, where the webview fills the screen
 * and the two always agree. A fixed value is a webview that disagrees with the
 * phone holding it — Telegram's compact mode, the fullscreen transition, an
 * open keyboard, split-screen.
 */
async function stubDeviceOrientation(page: Page, mode: 'follow-viewport' | 'portrait-primary') {
  await page.addInitScript(
    pinned => {
      Object.defineProperty(window.screen, 'orientation', {
        configurable: true,
        get: () => ({
          type:
            pinned ??
            (window.innerWidth < window.innerHeight ? 'portrait-primary' : 'landscape-primary'),
          angle: 0,
          addEventListener: () => {},
          removeEventListener: () => {},
        }),
      });
    },
    mode === 'portrait-primary' ? 'portrait-primary' : null
  );
}

test('a phone on its side gets the wall instead of the app', async ({ page }) => {
  await stubDeviceOrientation(page, 'follow-viewport');
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

test('an upright phone keeps the game when its webview is short and wide', async ({ page }) => {
  // The bug this file exists to keep dead: inside Telegram the app is handed a
  // webview, not a window, and that webview is wider than it is tall in compact
  // mode, mid-fullscreen-animation, with the keyboard up and in split-screen.
  // The wall used to read that as "the phone is on its side" and stand in front
  // of players holding the phone perfectly straight.
  await stubDeviceOrientation(page, 'portrait-primary');
  await page.setViewportSize({ width: 412, height: 380 });
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  await expect(page.getByTestId('app-shell')).toBeVisible({ timeout: SLOW });
  await expect(page.getByRole('alertdialog')).toBeHidden();
  await expect(page.locator('#scroll-container')).toBeVisible();
});

test('a landscape desktop window is left alone', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  await expect(page.getByTestId('app-shell')).toBeVisible({ timeout: SLOW });
  await expect(page.getByRole('alertdialog')).toBeHidden();
});
