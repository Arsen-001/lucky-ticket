import { expect, test, type Page } from '@playwright/test';

/**
 * The market's product picture must never be clipped by the box that holds it.
 *
 * This has been reported three times and "fixed" twice, because the defect is
 * invisible to a static check: the modals used to take a pre-sized 140–165px
 * node and force `size-full` on it, which resizes the ELEMENT but not what it
 * draws. A gift's picture is an emoji sized by `font-size`, so its 99px glyph
 * survived the boxing and `overflow-hidden` sliced the bear's ears off — while
 * every image-based item next to it looked perfect.
 *
 * So the assertion is geometric and runs on the real screen: for every clipping
 * box inside an open market dialog, no descendant may paint outside it.
 */

/** Decorative glows are positioned outside their box ON PURPOSE — that is what the clip is for. */
const DECORATION = /pointer-events-none|blur-|absolute -/;

const clearGreetingDialogs = async (page: Page) => {
  for (let round = 0; round < 8; round += 1) {
    const dialogs = page.locator('[role="dialog"]');
    if (!(await dialogs.count())) return;
    const buttons = dialogs.last().locator('button');
    const count = await buttons.count();
    if (count) {
      await buttons
        .nth(count - 1)
        .click({ force: true, timeout: 2000 })
        .catch(() => {});
    } else {
      await page.keyboard.press('Escape');
    }
    await page.waitForTimeout(700);
  }
};

/** Every element painting outside a clipping ancestor, decorations excluded. */
const overflowingParts = (page: Page) =>
  page.evaluate(decorationSource => {
    const decoration = new RegExp(decorationSource);
    const dialog = [...document.querySelectorAll('[role="dialog"]')].pop();
    if (!dialog) return [];
    const out: string[] = [];
    const clippers = [...dialog.querySelectorAll('*')].filter(
      element => getComputedStyle(element).overflow !== 'visible'
    );
    for (const box of clippers) {
      const boxRect = box.getBoundingClientRect();
      if (boxRect.width < 4 || boxRect.height < 4) continue;
      for (const child of box.querySelectorAll('*')) {
        const className = String(child.className);
        if (decoration.test(className)) continue;
        const rect = child.getBoundingClientRect();
        if (rect.width < 2 || rect.height < 2) continue;
        const over = Math.max(
          boxRect.top - rect.top,
          boxRect.left - rect.left,
          rect.right - boxRect.right,
          rect.bottom - boxRect.bottom
        );
        // 1px absorbs sub-pixel rounding on fractional layouts.
        if (over > 1) {
          out.push(
            `${child.tagName}.${className.slice(0, 40)} sticks ${Math.round(over)}px out of .${String(
              box.className
            ).slice(0, 40)}`
          );
        }
      }
    }
    return out;
  }, DECORATION.source);

/**
 * The gift is the case that actually broke: its art is an emoji, so it is the
 * only item whose size no `img` rule can reach. The shard covers the ordinary
 * image path in the same walk.
 */
const ITEMS: { label: string; text: string; exact: boolean }[] = [
  { label: 'gift (emoji art)', text: '🧸', exact: false },
  { label: 'shard (image art)', text: 'Bronze Time Shard', exact: true },
];

for (const item of ITEMS) {
  test(`market art is never clipped: ${item.label}`, async ({ page }) => {
    await page.goto('/market', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('app-shell')).toBeAttached({ timeout: 15_000 });
    await page.waitForTimeout(2500);
    await clearGreetingDialogs(page);

    const card = page.getByText(item.text, { exact: item.exact }).first();
    await card.scrollIntoViewIfNeeded();
    await card.click({ force: true });
    await page.waitForTimeout(1200);
    expect(await overflowingParts(page), `${item.label}: info sheet`).toEqual([]);

    // A price row opens the purchase confirmation.
    const priceRows = page.locator('[role="dialog"]').last().locator('button').filter({
      hasText: /\d/,
    });
    if (!(await priceRows.count())) return;
    await priceRows.last().click({ force: true });
    await page.waitForTimeout(1200);
    expect(await overflowingParts(page), `${item.label}: purchase confirmation`).toEqual([]);

    // …and its primary action completes the purchase, landing on the receipt.
    await page.locator('[role="dialog"]').last().locator('button').last().click({ force: true });
    await page.waitForTimeout(2500);
    expect(await overflowingParts(page), `${item.label}: purchase receipt`).toEqual([]);
  });
}
