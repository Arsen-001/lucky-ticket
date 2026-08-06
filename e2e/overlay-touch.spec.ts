import { expect, test, type Page } from '@playwright/test';

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

/** Matches "Add Stars" / "Пополнить Stars" / "Stars aufladen". */
const STARS_PILL = /stars/i;
/** Matches "Buy Stars" / "Купить Звёзды" / "Stars kaufen". */
const SHEET_HEADING = /stars|звёзды/i;

/**
 * App-open popups (an unseen tournament result, an admin notification) own the
 * screen and swallow taps on the header. They close on Escape, which is the one
 * dismissal that needs no locale-specific button name.
 */
async function clearAutoPopups(page: Page) {
  const dialogs = page.getByRole('dialog');
  for (let i = 0; i < 12; i++) {
    if ((await dialogs.count()) === 0) return;
    await page.keyboard.press('Escape');
    // Past the close animation, after which the overlay leaves the DOM.
    await page.waitForTimeout(400);
  }
  expect(await dialogs.count(), 'auto-surfaced popups never stopped coming').toBe(0);
}

/** Opens the Stars sheet from the header pill with a real tap. */
async function tapStarsPill(page: Page) {
  await page.goto('/');
  await expect(page.getByRole('button', { name: STARS_PILL })).toBeVisible();
  await clearAutoPopups(page);
  await page.getByRole('button', { name: STARS_PILL }).tap();
}

test('the Stars sheet survives the tap that opened it', async ({ page }) => {
  await tapStarsPill(page);

  const sheet = page.getByRole('heading', { name: SHEET_HEADING });
  await expect(sheet, 'the sheet never opened').toHaveCount(1);

  // The regression, exactly: it opened, then the tap's own compatibility click
  // reached the backdrop and closed it. A closed sheet leaves the DOM one
  // animation later, so a surviving count of 1 here is the whole assertion.
  await page.waitForTimeout(1000);
  await expect(sheet, 'the sheet closed itself after opening').toHaveCount(1);
});

test('tapping the backdrop still closes the Stars sheet', async ({ page }) => {
  await tapStarsPill(page);
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
