import { expect, test, type Page } from '@playwright/test';
import { appDialogs } from './helpers';

/**
 * The two contracts of the Stars sheet, driven by touch instead of a mouse:
 * a tap opens it and it stays open, and a tap on the backdrop dismisses it.
 *
 * `hasTouch` makes Playwright dispatch real touch events through CDP, so the
 * app sees the touch → compatibility-click sequence rather than one clean
 * mouse click.
 *
 * What this file does NOT do is reproduce the reported phone bug (the sheet
 * opening and closing itself from one tap on the ⭐ pill). Measured 06.08.2026:
 * these tests pass identically with and without the backdrop-dismiss guard in
 * `useBackdropDismiss`, so they cannot tell the two versions apart. CDP touch
 * emulation delivers a single clean click and never produces the webview's late
 * compatibility click. Treat them as guards on the contracts above, not as
 * evidence about that bug — it is still unreproduced outside a real device.
 */
test.use({ hasTouch: true, isMobile: true });

/** Matches the wallet card's "Buy more" / "Купить ещё". */
const BUY_MORE = /buy more|купить ещё/i;
/** Matches "Buy Stars" / "Купить Звёзды" / "Stars kaufen". */
const SHEET_HEADING = /stars|звёзды/i;

/**
 * App-open popups (an unseen tournament result, an admin notification) own the
 * screen and swallow taps on the header. They close on Escape, which is the one
 * dismissal that needs no locale-specific button name.
 */
async function clearAutoPopups(page: Page) {
  // Dialogs, not the portal's children: `ToastViewport` lives in `#portal-root`
  // permanently, so "the portal is empty" is never true.
  const portal = appDialogs(page);
  let quietRounds = 0;
  // Emptying it once is not enough: the results arrive as a queue, and the next
  // one surfaces as soon as the previous leaves. Wait for the portal to stay
  // empty across consecutive checks, or the tap lands on the next backdrop.
  for (let i = 0; i < 40 && quietRounds < 3; i++) {
    if ((await portal.count()) === 0) {
      quietRounds += 1;
    } else {
      quietRounds = 0;
      // First-run steps (language → welcome gifts → tour) ignore Escape by
      // design: they are a flow, not a dismissable popup, and a fresh browser
      // profile always starts inside one. Without this the loop pressed Escape
      // at the language picker until it gave up, and every test in this file
      // failed before it began (measured 20.08.2026 — it was failing on the old
      // header-pill opener too, so this is not new breakage).
      const step = portal.getByRole('button', {
        name: /^(continue|claim gifts|skip tour)$/i,
      });
      // Escape when the click misses: a tournament result sits ON TOP of the
      // first-run flow and carries a "Continue" of its own, so the step button
      // can be matched and covered at the same time. Falling back keeps the
      // loop moving instead of clicking at an intercepted button forty times.
      const clicked =
        (await step.count()) > 0 &&
        (await step
          .last()
          .click({ timeout: 2_000 })
          .then(() => true)
          .catch(() => false));
      if (!clicked) await page.keyboard.press('Escape');
    }
    // Past the close animation, after which the overlay leaves the DOM.
    await page.waitForTimeout(400);
  }
  expect(await portal.count(), 'auto-surfaced popups never stopped coming').toBe(0);
}

/**
 * Opens the Stars sheet with a real tap — from the wallet's stars card, which
 * is where a tap still opens it. The header's ⭐ pill stopped doing so on
 * 20.08.2026: it opens the Stars screen now, the way the AP and LC pills open
 * theirs. The sheet under test is the same component either way.
 */
async function openStarsSheet(page: Page) {
  await page.goto('/wallet');
  const buyMore = page.getByRole('button', { name: BUY_MORE });
  await expect(buyMore, 'the wallet never rendered its stars card').toBeEnabled();
  await clearAutoPopups(page);
  await buyMore.tap();
}

test('the Stars sheet survives the tap that opened it', async ({ page }) => {
  await openStarsSheet(page);

  const sheet = page.getByRole('heading', { name: SHEET_HEADING });
  await expect(sheet, 'the sheet never opened').toHaveCount(1);

  // The regression, exactly: it opened, then the tap's own compatibility click
  // reached the backdrop and closed it. A closed sheet leaves the DOM one
  // animation later, so a surviving count of 1 here is the whole assertion.
  await page.waitForTimeout(1000);
  await expect(sheet, 'the sheet closed itself after opening').toHaveCount(1);
});

test('the amount field keeps focus while the sheet is open', async ({ page }) => {
  await openStarsSheet(page);
  const amount = page.locator('#portal-root input');
  await amount.tap();
  await expect(amount, 'tapping the field did not focus it').toBeFocused();

  // The reported bug, and the reason it looked like a keyboard "opening and
  // closing itself": a CLOSED Modal's effect called
  // `document.activeElement.blur()`, and its deps carry the caller's inline
  // `onClose`, so it re-ran on any parent render. Home re-renders once a second
  // for the engine tick, so focus survived about 600ms. Waiting past several
  // ticks is the whole assertion.
  await page.waitForTimeout(3000);
  await expect(amount, 'focus was stolen while the sheet was open').toBeFocused();
});

test('tapping the backdrop still closes the Stars sheet', async ({ page }) => {
  await openStarsSheet(page);
  const sheet = page.getByRole('heading', { name: SHEET_HEADING });
  await expect(sheet, 'the sheet never opened').toHaveCount(1);

  // Past the enter animation: a dismissal landing mid-slide is ignored by
  // design, and asserting through that window would test the guard, not the tap.
  await page.waitForTimeout(600);

  // Well above the panel, which is anchored to the bottom edge — so this is the
  // backdrop, and a raw coordinate tap is the only way to hit it.
  const viewport = page.viewportSize();
  await page.touchscreen.tap((viewport?.width ?? 390) / 2, 80);

  await expect(sheet, 'the backdrop stopped dismissing').toHaveCount(0);
});
