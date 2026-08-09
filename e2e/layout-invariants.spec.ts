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

/**
 * The per-route sweep runs at ONE width, the narrowest — that is where content
 * runs out of room, so a wider pass finds nothing the narrow one missed. All 40
 * routes at three widths in two engines took the CI job to 17 minutes on a
 * runner where one page load costs 13-21s. The cube checks below still run at
 * every width, which is where per-width behaviour actually lives.
 */
const SWEEP_WIDTH = 320;

/**
 * CI compiles routes on demand and is far slower than a warm local dev server,
 * so the waits here are generous. A 20s cube wait already flaked at 393px while
 * passing at 320 and 430 in the same run — a timeout, not a layout defect.
 */
const SLOW = 45_000;

/**
 * The cube gets a longer wait than the shell, and deliberately so. Measured
 * 10.08.2026: this screen costs 3.5–7.2s in WebKit against a warm local dev
 * server and 18–21s on the CI runner, where three workers compile routes on
 * demand — and in one run the two waits that happened to overlap starved past
 * 45s while their siblings at 320 and 430px passed. Raising 20s to 45s did not
 * end that; a ceiling near four times the observed CI cost does.
 *
 * A wait is not a verdict. Nothing about the layout is asserted here — the
 * expectations below are what decide that, and they are unchanged.
 */
const CUBE_WAIT = 90_000;

/** That wait plus seven viewport measurements needs more than the 90s default. */
const CUBE_TEST_TIMEOUT = 180_000;

/** Home must be the app, and its engines must have painted, before measuring. */
async function openHome(page: Page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.getByTestId('app-shell').waitFor({ timeout: SLOW });
  await page.locator('.engine-cube-scaled').first().waitFor({ timeout: CUBE_WAIT });
  // Let the slider settle on its active slide before measuring.
  await page.waitForTimeout(800);
}

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

/**
 * How long the painted geometry needs after a viewport change before it means
 * anything. Sampled every 100ms on 10.08.2026, three runs, identical curve:
 *
 *   100ms 72.9 · 200 72.92 · 300 72.92 · 400 72.19 · 500 71.15 · 600 70.89 ·
 *   700 70.86 · 800 70.85 · … 1600 70.85
 *
 * Two things to read off it. The old flat 400ms sample lands in the middle of
 * the descent, which is the whole reason this test drifted: every other width
 * read a settled 70.85%, and only the first one of a run — taken right after
 * the load, while the slide holding the cube was still animating in — reported
 * 70.9–72.9%, spending the spread's entire 2-point budget on nothing.
 *
 * The second is why "sample twice and compare" does not work here: the reading
 * holds a PLATEAU for the first 300ms. Two identical samples inside it look
 * exactly like stillness, and that is the wrong number.
 */
const SETTLE_MS = 900;

/** The same measurement, taken once the screen has stopped moving. */
async function settledMeasurement(page: Page) {
  await page.waitForTimeout(SETTLE_MS);
  // Belt and braces for a loaded CI runner, where the curve above may still be
  // running: keep reading until it repeats, then trust it.
  let previous = await declaredVsPainted(page);
  for (let i = 0; i < 8; i++) {
    await page.waitForTimeout(150);
    const next = await declaredVsPainted(page);
    if (!next || !previous) return next;
    const moved = Math.abs(
      next.faceRight - next.faceLeft - (previous.faceRight - previous.faceLeft)
    );
    if (moved < 0.2) return next;
    previous = next;
  }
  return previous;
}

test('cube keeps the same share of the screen on every phone', async ({ page }) => {
  test.setTimeout(CUBE_TEST_TIMEOUT);
  // The whole point of scaling instead of re-flowing: one look, every device.
  // Measured on the PAINTED face, which is what a player actually sees.
  const shares: { width: number; share: number }[] = [];
  await openHome(page);

  for (const width of [320, 360, 375, 390, 393, 412, 430]) {
    await page.setViewportSize({ width, height: 900 });
    const m = await settledMeasurement(page);
    expect(m).not.toBeNull();
    if (!m) return;
    shares.push({ width, share: (m.faceRight - m.faceLeft) / m.viewport });
  }

  const spread = Math.max(...shares.map(s => s.share)) - Math.min(...shares.map(s => s.share));
  expect(
    spread,
    `cube covers a different share of the screen per width: ${shares
      .map(s => `${s.width}px→${(s.share * 100).toFixed(1)}%`)
      .join(', ')}`
  ).toBeLessThan(0.02);
});

for (const width of WIDTHS) {
  test.describe(`at ${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });

    test('home cube is painted at exactly the size its CSS declares', async ({ page }) => {
      test.setTimeout(CUBE_TEST_TIMEOUT);
      await openHome(page);

      // Same reason as the share test: this one measures straight after the
      // load, which is exactly when the entry animation is still running.
      const m = await settledMeasurement(page);
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
  });
}

test.describe(`no screen scrolls sideways at ${SWEEP_WIDTH}px`, () => {
  test.use({ viewport: { width: SWEEP_WIDTH, height: 900 } });

  for (const route of STATIC_ROUTES) {
    test(route, async ({ page }) => {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await page.getByTestId('app-shell').waitFor({ timeout: SLOW });
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
