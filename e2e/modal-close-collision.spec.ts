import { expect, test, type Page } from '@playwright/test';

/**
 * Nothing inside a dialog may be painted under its close button.
 *
 * `Modal` puts the X in the panel's top-right corner and every card draws its
 * own header underneath, so the two only meet when a heading is long enough to
 * reach that corner — which English almost never is and Russian regularly is.
 * Measured 09.08.2026 at 320px: "Улучшить скорость?" had the X drawn over its
 * last two glyphs, and the market card's "НОВИНКА" pill shared the corner with
 * it. Both shipped green through every check the repo had, because a collision
 * exists only in the rendered result — no static rule can see it.
 *
 * Two things make this test trustworthy:
 *
 * - It measures GLYPHS (`Range.getClientRects()`), not element boxes. A centred
 *   block heading spans the whole card, so its box always overlaps a top-right
 *   button while the text sits nowhere near it — the box version of this check
 *   reported three collisions in a row that a screenshot showed were nothing.
 * - It asserts it actually opened dialogs. A sweep that silently stops finding
 *   them would otherwise pass forever.
 *
 * Cost: one fresh page load per control, ~2 minutes per route-locale pair (4.4
 * minutes wall clock over three workers, measured locally; CI is slower). The
 * lever if that becomes a problem is the locale list — Russian alone still
 * covers both regressions this file was written for.
 *
 * Proven by removing the fix: with `px-7` off ConfirmModal's title, `/` in
 * Russian fails with `"Улучшить скорость?"`, which is the regression itself.
 */

/** Narrowest phone in the registry: where text runs out of room first. */
const WIDTH = 320;

/**
 * The locales whose copy is long enough to reach the corner. English is the
 * short one — it is what let both regressions through — so it is not swept.
 */
const LOCALES = ['ru', 'de'] as const;

/** Screens whose dialogs are reachable by tapping visible controls. */
/**
 * Two screens carry the sweep: `/` for the shared ConfirmModal (both engine
 * upgrade confirmations live there) and `/market`, whose item cards put pills
 * in the same corner as the X. `/profile` was dropped after it added ~2 minutes
 * and only re-covered ConfirmModal.
 */
const ROUTES = ['/', '/market'] as const;

/** Controls worth clicking on a screen, in DOM order. */
const CONTROLS = 'button, [role="button"], [role="tab"], [tabindex="0"], [class*="cursor-pointer"]';

/** How many of them to try per screen — a bound on runtime, not on coverage. */
const MAX_CONTROLS = 26;

test.use({ viewport: { width: WIDTH, height: 844 } });

interface Collision {
  dialog: string;
  text: string;
  overlapPx: number;
}

/**
 * The overlap between the panel's own close button and the glyphs of every leaf
 * text node inside it, in the page's own coordinates.
 */
async function collisionInOpenDialog(page: Page): Promise<Collision | null> {
  return page.evaluate(() => {
    const panel = document.querySelector('[role="dialog"]');
    if (!panel) return null;
    // The close button `Modal` renders — a direct child of the panel, drawn on
    // top of whatever card the caller supplied.
    const close = panel.querySelector(':scope > button');
    if (!close) return null;

    const c = close.getBoundingClientRect();
    const dialog = panel.getAttribute('aria-label') ?? '';

    for (const el of panel.querySelectorAll('h1,h2,h3,h4,p,span,button,div')) {
      if (el === close || close.contains(el)) continue;
      if (el.children.length > 0) continue;
      const text = el.textContent?.trim();
      if (!text) continue;

      const range = document.createRange();
      range.selectNodeContents(el);
      for (const r of range.getClientRects()) {
        const overlapX = Math.min(c.right, r.right) - Math.max(c.left, r.left);
        const overlapY = Math.min(c.bottom, r.bottom) - Math.max(c.top, r.top);
        // A pixel of touching is rounding; anything more is the X sitting on
        // top of something the player is meant to read.
        if (overlapX > 2 && overlapY > 2) {
          return { dialog, text: text.slice(0, 60), overlapPx: Math.round(overlapX) };
        }
      }
    }
    return null;
  });
}

/**
 * App-open popups own the screen and swallow taps meant for the page beneath.
 * Escape is the one dismissal that needs no locale-specific button name.
 * @see overlay-touch.spec.ts, which clears them the same way
 */
async function clearAutoPopups(page: Page) {
  const dialogs = page.getByRole('dialog');
  let quiet = 0;
  for (let i = 0; i < 30 && quiet < 2; i++) {
    if ((await dialogs.count()) === 0) {
      quiet += 1;
    } else {
      quiet = 0;
      await page.keyboard.press('Escape');
    }
    await page.waitForTimeout(350);
  }
}

for (const locale of LOCALES) {
  test.describe(`dialogs in ${locale}`, () => {
    for (const route of ROUTES) {
      test(`no text hides under the close button on ${route}`, async ({ page, context }) => {
        test.setTimeout(240_000);
        await context.addCookies([{ name: 'locale', value: locale, url: 'http://localhost:3000' }]);

        const collisions: Collision[] = [];
        const seen = new Set<string>();

        // One fresh load per control, not one per screen. Clicking in place
        // leaves the screen in whatever state the last click produced — a
        // dialog dismissed, a chip toggled, the engine slider advanced — and
        // the control order shifts under the loop. Measured 09.08.2026: the
        // in-place version reached only the first dialog on `/` and never the
        // two upgrade confirmations that this file exists to guard.
        for (let i = 0; i < MAX_CONTROLS; i++) {
          await page.goto(route, { waitUntil: 'domcontentloaded' });
          // Mock latency runs to 1200ms, and CI compiles the route on demand.
          await page.waitForTimeout(2200);
          await clearAutoPopups(page);

          const control = page.locator(CONTROLS).nth(i);
          if (!(await control.isVisible().catch(() => false))) continue;
          await control.click({ timeout: 2000 }).catch(() => {});
          await page.waitForTimeout(800);

          if ((await page.getByRole('dialog').count()) === 0) continue;

          const label =
            (await page.getByRole('dialog').first().getAttribute('aria-label')) || `#${i}`;
          if (seen.has(label)) continue;
          seen.add(label);

          const hit = await collisionInOpenDialog(page);
          if (hit) collisions.push(hit);
        }

        // Without this, a sweep that stopped opening anything would pass — the
        // failure mode that made an earlier version of this measurement report
        // "0 dialogs, 0 problems" while the app was full of them.
        console.log(`[${locale}] ${route} dialogs:`, [...seen].join(' | '));
        expect(
          seen.size,
          `no dialog opened on ${route} — the sweep found nothing to check`
        ).toBeGreaterThan(0);
        expect(collisions, `close button painted over text on ${route} (${locale})`).toEqual([]);
      });
    }
  });
}
