import { expect, test, type Locator, type Page } from '@playwright/test';
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
const TELEGRAM_STUB = (initData: string) => {
  const state = { visible: false, press: null as null | (() => void), closingConfirmed: false };
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
    // Usually empty, which keeps this a plain-browser session (the mock-backend
    // flow the rest of the suite runs in) — and that is the point: the arrow
    // must be driven by the app, not by having signed in. Only the
    // closing-confirmation test needs a Telegram boot, and passes one in.
    initData,
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
    enableClosingConfirmation: () => {
      state.closingConfirmed = true;
    },
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
    __tgBack: { visible: boolean; press: null | (() => void); closingConfirmed: boolean };
  }
}

/** Installs the stub before any page script runs. */
const installTelegram = (page: Page, initData = '') => page.addInitScript(TELEGRAM_STUB, initData);

const arrowVisible = (page: Page) => page.evaluate(() => window.__tgBack.visible);

/** What the Telegram client does when the player presses back. */
const pressBack = (page: Page) =>
  page.evaluate(() => {
    if (!window.__tgBack.press) throw new Error('nothing is listening for the back press');
    window.__tgBack.press();
  });

/**
 * Waits until nothing is open on top of Home and the arrow is therefore hidden,
 * dismissing what it finds on the way.
 *
 * @see overlay-touch.spec.ts — auto-surfacing popups (a won tournament, an
 * announcement, the daily gift) arrive as a QUEUE and keep coming while their
 * queries resolve, so "the portal was empty three checks running" is not a
 * state that stays true: it was still true when the loop returned and false a
 * second later, which failed this test twice under load. Polling the condition
 * the test actually needs — no dialog, hence no overlay claiming Back —
 * converges instead of racing it.
 */
async function clearHome(page: Page) {
  await expect
    .poll(
      async () => {
        if (await appDialogs(page).count()) {
          await page.keyboard.press('Escape');
          await page.waitForTimeout(300);
          return 'popup';
        }
        return (await arrowVisible(page)) ? 'arrow' : 'clear';
      },
      { timeout: 30_000, message: 'Home never settled with nothing open on top of it' }
    )
    .toBe('clear');
}

async function openHome(page: Page) {
  await page.goto('/');
  await expect(page.getByRole('button', { name: /^home$/i })).toBeVisible();
  await clearHome(page);
}

/**
 * Taps something, dismissing whatever auto-surfaced popup got in the way.
 *
 * Waiting for the screen to go quiet first is not enough on its own: the
 * watchers keep querying, so a result can arrive between the last quiet check
 * and the tap, and the backdrop then swallows it for the rest of the test (a
 * 90s timeout on `waiting for element ... intercepts pointer events`, seen once
 * on the tab bar). Dismissing and retrying is what makes the tap independent of
 * that timing.
 */
async function tapPastPopups(page: Page, target: Locator) {
  for (let attempt = 0; attempt < 6; attempt++) {
    if (await appDialogs(page).count()) {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(400);
      continue;
    }
    try {
      await target.click({ timeout: 5_000 });
      return;
    } catch {
      /* a popup landed mid-tap — dismiss it on the next lap and try again */
    }
  }
  throw new Error('the tap never got past the auto-surfacing popups');
}

test('the arrow is hidden at the root and shown everywhere else', async ({ page }) => {
  await installTelegram(page);
  await page.goto('/');
  // Home is where back SHOULD close the game — that is the platform behaviour,
  // and hiding the arrow is how the client is told so.
  await expect.poll(() => arrowVisible(page)).toBe(false);

  await page.goto('/faq');
  await expect.poll(() => arrowVisible(page)).toBe(true);
});

test('a press with no history lands on Home instead of closing the app', async ({ page }) => {
  await installTelegram(page);
  // A deep link opens straight onto a screen with nothing behind it. `back()`
  // there would step out of the webview — the exact thing being fixed.
  await page.goto('/faq');
  await expect.poll(() => arrowVisible(page)).toBe(true);

  await pressBack(page);
  await expect(page).toHaveURL(/\/$/);
});

test('a press steps back through in-app history', async ({ page }) => {
  await installTelegram(page);
  // Two rows of the same list, not Home → a tab: the pair differs only by the
  // history entry between them, which is the thing being tested.
  await page.goto('/faq');
  await tapPastPopups(page, page.locator('a[href^="/faq/"]').first());
  await expect(page).toHaveURL(/\/faq\/.+/);
  await expect.poll(() => arrowVisible(page)).toBe(true);

  await pressBack(page);
  // Back to the list — NOT to Home, which is where the no-history fallback
  // would have landed. That difference is the whole assertion.
  await expect(page).toHaveURL(/\/faq$/);
});

test('an open sheet swallows the press instead of navigating', async ({ page }) => {
  await installTelegram(page);
  // Lands on a Home with nothing open — and therefore with the arrow hidden,
  // which `clearHome` has just asserted.
  await openHome(page);

  await tapPastPopups(page, page.getByRole('button', { name: /stars/i }));
  await expect(appDialogs(page)).toHaveCount(1);
  await expect.poll(() => arrowVisible(page)).toBe(true);

  await pressBack(page);
  // The sheet closes and the page stays put: navigating out from under an open
  // dialog is what leaves a portal stranded on the next screen.
  await expect(appDialogs(page)).toHaveCount(0);
  await expect(page).toHaveURL(/\/$/);
  // And Home is back to hiding the arrow — modulo the next popup in the queue,
  // which is why this settles rather than reads once.
  await clearHome(page);
});

test('the client is asked to confirm before it closes the game', async ({ page }) => {
  // The root press is the one `BackButton` deliberately lets through, so it is
  // the client's confirmation that stands between a stray press and a dead
  // session. Needs a Telegram boot (`initData`) — the browser path skips the
  // whole chrome block, confirmation included.
  await installTelegram(page, 'query_id=stub&auth_date=0&hash=stub');
  await page.goto('/');

  // Deliberately not waiting for the app: the sign-in behind this stub is not
  // expected to succeed, and the chrome is set up before it is even attempted.
  await expect.poll(() => page.evaluate(() => window.__tgBack.closingConfirmed)).toBe(true);
});
