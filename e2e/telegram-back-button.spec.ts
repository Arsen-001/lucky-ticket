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
    expanded: false,
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
    expand: () => {
      state.expanded = true;
    },
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
      expanded: boolean;
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
  await completeFirstRun(page);
  // Hydration gate: the tab bar is server-rendered, so it is on screen well
  // before any client effect has run. Under a loaded dev server that gap is
  // wide enough for a test to press a back button nobody is listening for yet.
  await expect.poll(() => arrowVisible(page), { timeout: 20_000 }).toBe(true);
  await dismissPopups(page);
}

/**
 * Walks the first-run flow when it is on screen: language → welcome gifts →
 * guided tour.
 *
 * The mock serves a level-zero account (`appConfig.account.fresh`), so the app
 * opens on that flow, and none of its three steps closes on Escape — they are a
 * forced choice, which is why the popup-dismissing helpers cannot get past them.
 * Worse, "has seen the tour" lives in the DEV SERVER's memory, not the browser's:
 * whichever test renders the app first after a server start meets the flow, and
 * everybody else inherits a cleared one. In CI that made the welcome-gifts card
 * mount on top of the exit dialog and swallow its click. So: walk it if it is
 * there, ignore it if it is not.
 */
async function completeFirstRun(page: Page, { escape = true } = {}) {
  // The flow is language → welcome gifts → tour, and every step ignores Escape
  // by design. Two things this has to survive, both of which silently skipped
  // the whole flow before (measured 20.08.2026, with two tests here red on
  // `main` because of it): the step buttons live inside dialogs, and an
  // auto-surfaced tournament result stacks ON TOP carrying a "Continue" of its
  // own — so a step button can be matched and covered at the same time. Look
  // the buttons up inside the dialogs, click the topmost, and fall back to
  // Escape (which the results DO honour) when the click misses.
  for (let i = 0; i < 12 && (await appDialogs(page).count()); i++) {
    const step = appDialogs(page).getByRole('button', {
      name: /^(continue|claim gifts|skip tour)$/i,
    });
    const clicked =
      (await step.count()) > 0 &&
      (await step
        .last()
        .click({ timeout: 2_000 })
        .then(() => true)
        .catch(() => false));
    // `escape: false` on drawer routes (`/wallet`, `/stars`…): Escape there
    // closes the DRAWER and navigates the test back to home, which reads as
    // "the popup would not go away".
    if (!clicked && escape) await page.keyboard.press('Escape');
    if (!clicked && !escape) break;
    await page.waitForTimeout(450);
  }
}

/**
 * Presses back until it actually moves, draining whatever ate the press.
 *
 * A press is answered by the TOPMOST layer — a popup that landed after the tap
 * consumes it and closes instead of navigating. That is not a bug, it is the
 * behaviour asserted two tests down; but it means ONE press is not a promise of
 * one navigation on a screen where the popup queue is still draining, and the
 * article page has nothing that drains it. CI failed exactly there, on a commit
 * that touched three mock fixtures and no navigation code: the URL sat on
 * `/faq/<id>` while the assertion polled a live page for its full ten seconds.
 *
 * Retrying keeps the assertion honest rather than loosening it: the URL still
 * has to become `expected`, and it has to happen by pressing back — a press
 * that navigated somewhere else fails on the next lap just as loudly.
 */
async function pressBackUntil(page: Page, expected: RegExp) {
  for (let attempt = 0; attempt < 6; attempt++) {
    if (await appDialogs(page).count()) {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(400);
    }
    await pressBack(page);
    try {
      await expect(page).toHaveURL(expected, { timeout: 2_000 });
      return;
    } catch {
      /* a popup ate the press — drain it and press again */
    }
  }
  throw new Error(`back never reached ${String(expected)}`);
}

/** Taps something, dismissing whatever auto-surfaced popup got in the way. */
async function tapPastPopups(page: Page, target: Locator) {
  for (let attempt = 0; attempt < 6; attempt++) {
    if (await appDialogs(page).count()) {
      // Same walker as the first run: a page load can land back inside the
      // welcome flow, and Escape alone never leaves it.
      await completeFirstRun(page);
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

test.beforeAll(async ({ browser }) => {
  // Once per worker: get the first-run flow out of the way while nothing is
  // being asserted. It is server-side state, so this clears it for every test
  // that follows — the per-test call below only covers the cross-worker race.
  const page = await browser.newPage({
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3000',
  });
  try {
    await page.goto('/');
    await page.waitForTimeout(2_000);
    await completeFirstRun(page);
  } finally {
    await page.close();
  }
});

test('the arrow is hidden at the root and up on every other screen', async ({ page }) => {
  await installTelegram(page);
  // Since 30.08.2026 (da2c01fc) leaving is one press again: at Home with nothing
  // open the arrow is hidden and the press is the client's own — it closes the
  // app. The arrow exists to step back INSIDE the app, so anywhere else it is up.
  // `openHome` walks the first run and the popups; while one of them is open the
  // arrow is legitimately up (a press must close the overlay, not the game).
  await openHome(page);
  await expect.poll(() => arrowVisible(page), { timeout: 20_000 }).toBe(false);

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
  await completeFirstRun(page);
  // Hydration gate, and a load-bearing one: the rows are server-rendered, so
  // they are clickable BEFORE `NavigationHistoryProvider` has wrapped
  // `pushState`. A tap that lands in that window is never counted, the press
  // then reads as "no history" and lands on Home — which failed this test once
  // under four parallel pages. A visible arrow means the client effects ran.
  await expect.poll(() => arrowVisible(page)).toBe(true);
  await tapPastPopups(page, page.locator('a[href^="/faq/"]').first());
  await expect(page).toHaveURL(/\/faq\/.+/);

  // Back to the list — NOT to Home, which is where the no-history fallback
  // would have landed. That difference is the whole assertion.
  await pressBackUntil(page, /\/faq$/);
});

test('an open sheet swallows the press instead of navigating', async ({ page }) => {
  await installTelegram(page);
  await openHome(page);

  // The wallet, not the header: since 20.08.2026 the ⭐ pill opens the Stars
  // SCREEN, so the sheet is opened where a tap still opens one. `openHome` has
  // already walked the first run and the popups — and the walker must not run
  // here, because Escape on a drawer route closes the drawer and sends the test
  // back to home.
  await page.goto('/wallet');
  const buyMore = page.getByRole('button', { name: /buy more|купить ещё/i });
  await expect(buyMore).toBeEnabled();
  // A reload re-opens the welcome flow (mock `me` never records the choice),
  // and it stacks over the wallet — walk it, but without Escape.
  await completeFirstRun(page, { escape: false });
  // Dispatched rather than clicked: the button rides in with an entry animation,
  // and the mouse click's stability check spun to the timeout on CI (06.09.2026).
  await buyMore.dispatchEvent('click');
  const sheet = page.getByRole('heading', { name: /stars|звёзды/i });
  await expect(sheet).toBeVisible();

  await pressBack(page);
  // The sheet closes and the page stays put: navigating out from under an open
  // dialog is what leaves a portal stranded on the next screen.
  await expect(sheet).toHaveCount(0);
  await expect(page).toHaveURL(/\/wallet$/);
});

test("at the root with nothing open the press is the client's: no arrow, no dialog", async ({
  page,
}) => {
  await installTelegram(page);
  await openHome(page);

  // Drain what the auto-surface queue still holds, until the root is bare: no
  // dialog, and therefore no arrow. Which popup is on screen at this moment is
  // not something the test gets to decide, so this polls rather than presses once.
  await expect
    .poll(
      async () => {
        if (await appDialogs(page).count()) {
          await page.keyboard.press('Escape');
          await page.waitForTimeout(300);
          return 'popup';
        }
        return (await arrowVisible(page)) ? 'arrow' : 'bare';
      },
      { timeout: 20_000, message: 'the root never went bare: a dialog or the arrow stayed' }
    )
    .toBe('bare');

  // The SDK keeps the handler it was given, so a press can still be simulated —
  // and at the bare root it must do nothing: no "leave the game?" ask (retired
  // on 30.08.2026 with da2c01fc), no navigation, and no `close()` from the app.
  // Leaving is Telegram's own gesture now.
  await pressBack(page);
  await page.waitForTimeout(500);
  expect(await exitDialog(page).count(), 'the retired exit dialog came back').toBe(0);
  await expect(page).toHaveURL(/\/$/);
  expect(await page.evaluate(() => window.__tgBack.closed)).toBe(false);
});

test('the client is not asked to confirm before it closes the game', async ({ page }) => {
  // Covers the ways out the client owns on its own (the ✕, the swipe). Needs a
  // Telegram boot (`initData`) — the browser path skips the whole chrome block.
  // `enableClosingConfirmation()` was retired on 30.08.2026 (da2c01fc): it
  // charged every intentional exit an extra tap, and leaving is the far more
  // common press. The stub records `expand()` as proof that the chrome block
  // ran at all — otherwise "not confirmed" would also be true of an app that
  // never booted.
  await installTelegram(page, 'query_id=stub&auth_date=0&hash=stub');
  await page.goto('/');

  // Deliberately not waiting for the app: the sign-in behind this stub is not
  // expected to succeed, and the chrome is set up before it is even attempted.
  await expect.poll(() => page.evaluate(() => window.__tgBack.expanded)).toBe(true);
  expect(await page.evaluate(() => window.__tgBack.closingConfirmed)).toBe(false);
});
