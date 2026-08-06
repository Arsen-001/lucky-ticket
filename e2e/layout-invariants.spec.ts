import { expect, test, type Page } from '@playwright/test';
import { STATIC_ROUTES } from './routes';

/**
 * Engine-agnostic layout invariants — the net that catches a rendering engine
 * COMPUTING something different from what the CSS says, which no amount of
 * desktop checking can see.
 *
 * Written after a real prod regression: the home cube's scale was derived with
 * `tan(atan2(box, design))`, the standard CSS trick for dividing one length by
 * another. WebKit evaluates it in radians — it returned 1.6198 where the answer
 * is 1 — so every iPhone in Telegram painted a 486px cube into a 300px slot.
 * Chromium computed it correctly, the unit tests passed, the smoke passed, and
 * `@supports (scale: tan(atan2(1px, 1px)))` reported support because WebKit
 * PARSES the expression happily; only the value was wrong. A user found it.
 *
 * So these assertions never compare one engine against another (that only tells
 * you they differ, not who is right). They compare what was PAINTED against what
 * the stylesheet DECLARED — a contract every engine owes independently.
 */

/** Widths that matter: smallest Android, iPhone 15 Pro, iPhone 15 Pro Max. */
const WIDTHS = [320, 393, 430] as const;

async function declaredVsPainted(page: Page) {
  return page.evaluate(() => {
    const scaled = document.querySelector('.engine-cube-scaled');
    const face = document.querySelector('.engine-card-cube-face--front > div');
    if (!scaled || !face) return null;

    // Resolve the stylesheet's own answer for the footprint, independently of
    // whatever the transform actually did.
    const probe = document.createElement('div');
    probe.style.cssText = 'position:absolute;height:1px;width:var(--engine-cube-box)';
    document.body.appendChild(probe);
    const declaredBox = probe.getBoundingClientRect().width;
    probe.remove();

    const painted = scaled.getBoundingClientRect();
    const faceBox = face.getBoundingClientRect();
    return {
      declaredBox,
      paintedBox: painted.width,
      paintedSquare: Math.abs(painted.width - painted.height),
      faceLeft: faceBox.left,
      faceRight: faceBox.right,
      faceContentH: face.scrollHeight,
      faceBoxH: face.clientHeight,
      viewport: window.innerWidth,
    };
  });
}

for (const width of WIDTHS) {
  test.describe(`at ${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });

    test('home cube is painted at exactly the size its CSS declares', async ({ page }) => {
      await page.goto('/');
      await page.locator('.engine-cube-scaled').first().waitFor({ timeout: 20_000 });
      // Let the slider settle on its active slide before measuring.
      await page.waitForTimeout(800);

      const m = await declaredVsPainted(page);
      expect(m, 'engine cube missing from home — the mock account owns engines').not.toBeNull();
      if (!m) return;

      // THE check. A miscomputed scale shows up here and nowhere else.
      expect(
        Math.abs(m.paintedBox - m.declaredBox),
        `cube painted ${m.paintedBox}px where CSS declares ${m.declaredBox}px`
      ).toBeLessThan(1.5);

      expect(m.paintedSquare, 'cube is not square').toBeLessThan(1.5);

      // The face is painted wider than its box (perspective pushes it toward the
      // viewer); it still has to stay inside the phone column.
      expect(m.faceLeft, 'cube face runs off the left edge').toBeGreaterThan(-1);
      expect(m.faceRight, 'cube face runs off the right edge').toBeLessThan(m.viewport + 1);

      // Content laid out at the design square must not be clipped by the face.
      expect(m.faceContentH, 'cube face content is clipped').toBeLessThanOrEqual(m.faceBoxH + 1);
    });

    for (const route of STATIC_ROUTES) {
      test(`no horizontal overflow: ${route}`, async ({ page }) => {
        await page.goto(route, { waitUntil: 'domcontentloaded' });
        await page.getByTestId('app-shell').waitFor({ timeout: 20_000 });
        await page.waitForTimeout(400);

        const { scrollWidth, innerWidth } = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
        }));
        expect(
          scrollWidth,
          `${route} scrolls sideways at ${innerWidth}px (content ${scrollWidth}px)`
        ).toBeLessThanOrEqual(innerWidth + 1);
      });
    }
  });
}
