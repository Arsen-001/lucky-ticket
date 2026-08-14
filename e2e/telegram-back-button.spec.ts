import { expect, test, type Page } from '@playwright/test';
import { appDialogs } from './helpers';

/**
 * Back must move through the app, not out of it.
 *
 * On Android the system back gesture reaches a Mini App **only while Telegram's
 * own header arrow is visible** — hidden, the first press closes the game from
 * any screen. So the thing under test is not a button the player taps but the
 * pair of promises the app makes to the client: keep the arrow in sync with
 * "there is somewhere to go", and answer the press with the topmost layer.
 *
 * A real Telegram client cannot be had here, so `window.Telegram` is replaced
 * with a stub before any script runs (the SDK's own assignment is swallowed by
 * the setter). What this proves: the app shows, hides and answers correctly.
 * What it cannot prove: that Telegram Android routes its gesture to us — that
 * is the client's half of the contract and only a device shows it.
 */
const TELEGRAM_STUB = () => {
  const state = { visible: false, press: null as null | (() => void) };
  const backButton = {
    get isVisible() {
      return state.visible;
    },
    show: () => {
      state.visible = true;
    },
    hide: () => {
      state.visible = false;
    },
    onClick: (handler: () => void) => {
      state.press = handler;
    },
    offClick: () => {
      state.press = null;
    },
  };
  const webApp = {
    // No `initData`: this stays a plain-browser session (the mock-backend flow
    // the rest of the suite runs in), which is exactly the point — the arrow
    // must be driven by the app, not by having signed in.
    initData: '',
    initDataUnsafe: {},
    // ≥ 6.1, the version `BackButton` needs; deliberately not 8.0, which would
    // switch on fullscreen and orientation-lock paths unrelated to this test.
    version: '6.1',
    platform: 'unknown',
    ready: () => {},
    expand: () => {},
    setHeaderColor: () => {},
    setBackgroundColor: () => {},
    disableVerticalSwipes: () => {},
    onEvent: () => {},
    offEvent: () => {},
    BackButton: backButton,
  };
  // BOTH properties have to swallow their assignment. telegram-web-app.js loads
  // after this and writes `window.Telegram.WebApp = <the real one>`; guarding
  // only `window.Telegram` left the real SDK object in place, reporting version
  // 6.0 — under which the app correctly does nothing and the test read as a
  // failure of the app rather than of its stub.
  const telegram = {};
  Object.defineProperty(telegram, 'WebApp', {
    configurable: true,
    get: () => webApp,
    set: () => {},
  });
  Object.defineProperty(window, 'Telegram', {
    configurable: true,
    get: () => telegram,
    set: () => {},
  });
  Object.defineProperty(window, '__tgBack', { configurable: true, value: state });
};

declare global {
  interface Window {
    __tgBack: { visible: boolean; press: null | (() => void) };
  }
}

const arrowVisible = (page: Page) => page.evaluate(() => window.__tgBack.visible);

/** What the Telegram client does when the player presses back. */
const pressBack = (page: Page) =>
  page.evaluate(() => {
    if (!window.__tgBack.press) throw new Error('nothing is listening for the back press');
    window.__tgBack.press();
  });

/**
 * @see overlay-touch.spec.ts — auto-surfacing popups own the screen on entry.
 *
 * Waits for the app to be up FIRST: on a cold route the loop otherwise counts
 * an empty portal three times before the daily-gift modal has even been
 * queried, declares the screen quiet and hands back a page that pops a dialog
 * a second later.
 */
async function openHome(page: Page) {
  await page.goto('/');
  await expect(page.getByRole('button', { name: /^home$/i })).toBeVisible();
  const portal = appDialogs(page);
  let quietRounds = 0;
  for (let i = 0; i < 40 && quietRounds < 3; i++) {
    if ((await portal.count()) === 0) {
      quietRounds += 1;
    } else {
      quietRounds = 0;
      await page.keyboard.press('Escape');
    }
    await page.waitForTimeout(400);
  }
  expect(await portal.count(), 'auto-surfaced popups never stopped coming').toBe(0);
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(TELEGRAM_STUB);
});

test('the arrow is hidden at the root and shown everywhere else', async ({ page }) => {
  await page.goto('/');
  // Home is where back SHOULD close the game — that is the platform behaviour,
  // and hiding the arrow is how the client is told so.
  await expect.poll(() => arrowVisible(page)).toBe(false);

  await page.goto('/faq');
  await expect.poll(() => arrowVisible(page)).toBe(true);
});

test('a press with no history lands on Home instead of closing the app', async ({ page }) => {
  // A deep link opens straight onto a screen with nothing behind it. `back()`
  // there would step out of the webview — the exact thing being fixed.
  await page.goto('/faq');
  await expect.poll(() => arrowVisible(page)).toBe(true);

  await pressBack(page);
  await expect(page).toHaveURL(/\/$/);
});

test('a press steps back through in-app history', async ({ page }) => {
  await openHome(page);
  // Not `/^tasks$/`: the tab's accessible name carries the claimable dot's
  // label when there is a reward waiting behind it.
  await page.getByRole('button', { name: /tasks/i }).click();
  await expect(page).toHaveURL(/\/tasks/);
  await expect.poll(() => arrowVisible(page)).toBe(true);

  await pressBack(page);
  await expect(page).toHaveURL(/\/$/);
});

test('an open sheet swallows the press instead of navigating', async ({ page }) => {
  await openHome(page);
  // Home hides the arrow — until something opens on top of it.
  await expect.poll(() => arrowVisible(page)).toBe(false);

  await page.getByRole('button', { name: /stars/i }).click();
  await expect(appDialogs(page)).toHaveCount(1);
  await expect.poll(() => arrowVisible(page)).toBe(true);

  await pressBack(page);
  // The sheet closes and the page stays put: navigating out from under an open
  // dialog is what leaves a portal stranded on the next screen.
  await expect(appDialogs(page)).toHaveCount(0);
  await expect(page).toHaveURL(/\/$/);
  await expect.poll(() => arrowVisible(page)).toBe(false);
});
