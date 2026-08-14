import { expect, test, type Locator, type Page } from '@playwright/test';
import { appDialogs } from './helpers';

/**
 * Back must move through the app, never put it away.
 *
 * The client hands the back gesture to a Mini App only while its header arrow
 * is visible; with the arrow hidden the press is Telegram's, and Telegram
 * either closes the app or folds it into the collapsed bar. So the thing under
 * test is not a button the player taps but the promises the app makes to the
 * client: keep the arrow up, and answer every press with the topmost layer —
 * ending, at the root, in an explicit "leave the game?".
 *
 * A real Telegram client cannot be had here, so `window.Telegram` is replaced
 * with a stub before any script runs. What this proves: the app shows the arrow
 * and answers correctly. What it cannot prove: that Telegram routes the gesture
 * to us at all — that is the client's half of the contract, and only a device
 * shows it.
 */
const TELEGRAM_STUB = (initData: string) => {
  const state = {
    visible: false,
    press: null as null | (() => void),
    closed: false,
    closingConfirmed: false,
  };
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
    isExpanded: true,
    ready: () => {},
    expand: () => {},
    close: () => {
      state.closed = true;
    },
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
    __tgBack: {
      visible: boolean;
      press: null | (() => void);
      closed: boolean;
      closingConfirmed: boolean;
    };
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
 * The dialog the root press is supposed to raise.
 *
 * A case-SENSITIVE regex, not the string form: `getByRole({ name })` matches a
 * string case-insensitively, so `'Leave the game?'` also matches the raw key
 * `leave the game?` — which is exactly what renders when the dictionary has no
 * such key (or a dev server is still holding the old one). The test passed
 * against a missing translation once already.
 */
const exitDialog = (page: Page) => page.getByRole('heading', { name: /^Leave the game\?$/ });

/**
 * @see overlay-touch.spec.ts — auto-surfacing popups (a won tournament, an
 * announcement, the daily gift) own the screen on entry and arrive as a QUEUE,
 * so this drains what is there without asserting that nothing follows: "the
 * portal was empty three checks running" was true when the loop returned and
 * false a second later, which failed these tests twice under load. Every step
 * that must not be eaten by a late popup retries instead.
 */
async function dismissPopups(page: Page) {
  for (let i = 0; i < 12 && (await appDialogs(page).count()); i++) {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
  }
}

async function openHome(page: Page) {
  await page.goto('/');
  await expect(page.getByRole('button', { name: /^home$/i })).toBeVisible();
  // Hydration gate: the tab bar is server-rendered, so it is on screen well
  // before any client effect has run. Under a loaded dev server that gap is
  // wide enough for a test to press a back button nobody is listening for yet.
  await expect.poll(() => arrowVisible(page), { timeout: 20_000 }).toBe(true);
  await dismissPopups(page);
}

/** Taps something, dismissing whatever auto-surfaced popup got in the way. */
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

test('the arrow stays up on every screen, the root included', async ({ page }) => {
  await installTelegram(page);
  // A hidden arrow is what the client reads as "this press is mine" — and what
  // it does with it is close the app on one build, fold it away on the next.
  await page.goto('/');
  await expect.poll(() => arrowVisible(page)).toBe(true);

  await page.goto('/faq');
  await expect.poll(() => arrowVisible(page)).toBe(true);
});

test('a press with no history lands on Home instead of leaving the app', async ({ page }) => {
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
  // Hydration gate, and a load-bearing one: the rows are server-rendered, so
  // they are clickable BEFORE `NavigationHistoryProvider` has wrapped
  // `pushState`. A tap that lands in that window is never counted, the press
  // then reads as "no history" and lands on Home — which failed this test once
  // under four parallel pages. A visible arrow means the client effects ran.
  await expect.poll(() => arrowVisible(page)).toBe(true);
  await tapPastPopups(page, page.locator('a[href^="/faq/"]').first());
  await expect(page).toHaveURL(/\/faq\/.+/);

  await pressBack(page);
  // Back to the list — NOT to Home, which is where the no-history fallback
  // would have landed. That difference is the whole assertion.
  await expect(page).toHaveURL(/\/faq$/);
});

test('an open sheet swallows the press instead of navigating', async ({ page }) => {
  await installTelegram(page);
  await openHome(page);

  await tapPastPopups(page, page.getByRole('button', { name: /stars/i }));
  const sheet = page.getByRole('heading', { name: /stars/i });
  await expect(sheet).toBeVisible();

  await pressBack(page);
  // The sheet closes and the page stays put: navigating out from under an open
  // dialog is what leaves a portal stranded on the next screen.
  await expect(sheet).toHaveCount(0);
  await expect(page).toHaveURL(/\/$/);
});

test('at the end of the road the app asks instead of vanishing', async ({ page }) => {
  await installTelegram(page);
  await openHome(page);

  // Presses until the ask appears rather than exactly once: an auto-surfaced
  // popup legitimately consumes a press, and which of them is on screen at this
  // moment is not something the test gets to decide.
  await expect
    .poll(
      async () => {
        if (await appDialogs(page).count()) {
          await page.keyboard.press('Escape');
          await page.waitForTimeout(300);
          return 'popup';
        }
        await pressBack(page);
        await page.waitForTimeout(400);
        return (await exitDialog(page).count()) ? 'asked' : 'nothing';
      },
      { timeout: 30_000, message: 'the root press never raised the exit dialog' }
    )
    .toBe('asked');

  // Asked, not acted on: the press alone must never end the session.
  expect(await page.evaluate(() => window.__tgBack.closed)).toBe(false);

  await page.getByRole('button', { name: /^leave$/i }).click();
  await expect.poll(() => page.evaluate(() => window.__tgBack.closed)).toBe(true);
});

test('the client is asked to confirm before it closes the game', async ({ page }) => {
  // Covers the ways out the client still owns on its own (the ✕, the swipe).
  // Needs a Telegram boot (`initData`) — the browser path skips the whole
  // chrome block, confirmation included.
  await installTelegram(page, 'query_id=stub&auth_date=0&hash=stub');
  await page.goto('/');

  // Deliberately not waiting for the app: the sign-in behind this stub is not
  // expected to succeed, and the chrome is set up before it is even attempted.
  await expect.poll(() => page.evaluate(() => window.__tgBack.closingConfirmed)).toBe(true);
});
