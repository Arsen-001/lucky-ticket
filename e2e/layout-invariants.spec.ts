import { expect, test, type Page } from '@playwright/test';
import { STATIC_ROUTES } from './routes';
import { appDialogs } from './helpers';

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

    /**
     * The face rail is offset from `.engine-cube-viewport`, the un-scaled
     * FOOTPRINT, while the face is painted `--engine-cube-face-w` wide — 1.134x
     * of it. A constant offset therefore lands somewhere different on every
     * width, and the one it shipped with (`right: -9px`, written to park the
     * rail in the gutter) put it 8px INSIDE the card and 1.3px off the «Забрать»
     * button on a 390px phone. Only painted geometry catches that: the CSS says
     * "outside", and it is outside — of the wrong box.
     */
    test('the face rail rides the card edge without crowding its controls', async ({ page }) => {
      test.setTimeout(CUBE_TEST_TIMEOUT);
      await openHome(page);
      await page.waitForTimeout(SETTLE_MS);

      const m = await page.evaluate(() => {
        const slide = document.querySelector('[data-engine-slide]');
        const face = slide?.querySelector('.engine-card-cube-face--front');
        const rail = slide?.querySelector('.engine-cube-face-pips');
        if (!face || !rail) return null;
        const faceBox = face.getBoundingClientRect();
        const railBox = rail.getBoundingClientRect();
        // The rightmost control the player has to hit on the front face.
        const controlRight = [...face.querySelectorAll('button')]
          .map(b => b.getBoundingClientRect())
          .filter(r => r.width > 0)
          .reduce((max, r) => Math.max(max, r.right), 0);
        return {
          faceRight: faceBox.right,
          railLeft: railBox.left,
          railRight: railBox.right,
          controlRight,
        };
      });

      expect(m, 'engine cube missing from home').not.toBeNull();
      if (!m) return;

      expect(
        m.railRight,
        `rail ends at ${m.railRight.toFixed(1)} but the face is painted to ${m.faceRight.toFixed(1)} — it is hanging off the card`
      ).toBeLessThanOrEqual(m.faceRight + 0.5);

      expect(
        m.railLeft - m.controlRight,
        `only ${(m.railLeft - m.controlRight).toFixed(1)}px between the rail and the nearest control`
      ).toBeGreaterThanOrEqual(4);
    });
  });
}

/**
 * Nothing in the cube's claim strip may wrap.
 *
 * The strip is two lines by design — ticket name over countdown — inside a face
 * that is laid out once and then scaled, so a third line does not reflow, it
 * pushes the claim button out of its row. That is exactly what shipped: the
 * fill count sat on the clock line as `23:48:16 · 0/96`, the separator stayed
 * with the clock and `0/96` wrapped underneath, and a player photographed the
 * result. The count is gone from this face now and the line is `nowrap`, but
 * the invariant worth holding is the general one — no text in this strip may
 * take a second line box, whatever anyone adds later.
 *
 * Measured in Ukrainian, which owns the longest ticket wording of the 18
 * dictionaries ("Бронзовий квиток", "Золотий"), at the narrowest phone. And
 * measured as LINE BOXES (`getClientRects().length`), not height: a wrap is
 * exactly a second box, while a height threshold would need re-tuning with the
 * type scale.
 */
test('nothing in the cube claim strip takes a second line', async ({ page }) => {
  test.setTimeout(CUBE_TEST_TIMEOUT);
  await page.setViewportSize({ width: 320, height: 900 });
  await page.context().addCookies([
    {
      name: 'locale',
      value: 'uk',
      url: page.url().startsWith('http') ? page.url() : 'http://localhost:3000',
    },
  ]);
  await openHome(page);
  await page.waitForTimeout(SETTLE_MS);

  const m = await page.evaluate(() => {
    // Both states of the strip stay mounted and toggle `hidden`, so the
    // producing one is readable without touching the DOM: the mock's second
    // engine is mid-cycle while the first has tickets waiting.
    const strips = [
      ...document.querySelectorAll('[data-engine-slide] .engine-card-cube-face--front div'),
    ]
      .filter(d => d.querySelector('svg.lucide-clock, svg.lucide-clock-icon'))
      .filter(d => d.getBoundingClientRect().height > 0);
    const strip = strips[0];
    if (!strip) return null;
    const spans = [...strip.querySelectorAll('span')].filter(
      s => (s.textContent ?? '').trim().length > 0
    );
    return {
      count: spans.length,
      wrapped: spans
        .map(s => ({
          text: (s.textContent ?? '').trim().slice(0, 24),
          boxes: s.getClientRects().length,
        }))
        .filter(s => s.boxes > 1),
    };
  });

  expect(
    m,
    'no producing claim strip on screen — the mock account owns mid-cycle engines'
  ).not.toBeNull();
  if (!m) return;
  expect(m.count, 'claim strip has no text to measure').toBeGreaterThan(0);
  expect(
    m.wrapped,
    `these wrapped onto a second line: ${m.wrapped.map(w => `"${w.text}" (${w.boxes})`).join(', ')}`
  ).toEqual([]);
});

/**
 * The ad rail's scrub lens, against the widest wording the app ships.
 *
 * It carried a hard-coded width (176px, 216 for a three-reward view) sized on
 * the English header — "View #20 · in 19 views". Russian says the same thing in
 * "Просмотр №20 · через 19 показов", half again as long, so the status ran
 * straight out through the rounded border and the title broke mid-word. Nothing
 * in a type-check, a lint or the English smoke can see that: the strings live
 * in `messages/*.json` and the box was a number in a `.tsx`.
 *
 * So this asserts the contract, not the number — whatever the lens ends up
 * measuring, it stays inside the rail it belongs to and its header stays on one
 * line. Narrowest phone, Russian locale, dragged end to end: that is the worst
 * case the app can produce.
 */
test.describe('ad rail lens', () => {
  test.use({ viewport: { width: SWEEP_WIDTH, height: 900 } });

  test('scrub bubble stays inside the rail in every locale it ships', async ({
    page,
    context,
    baseURL,
  }) => {
    await context.addCookies([{ name: 'locale', value: 'ru', url: baseURL ?? '' }]);
    await page.goto('/tasks', { waitUntil: 'domcontentloaded' });
    await page.getByTestId('app-shell').waitFor({ timeout: SLOW });

    const track = page.locator('[role="slider"] > div').first();
    await track.waitFor({ timeout: SLOW });

    // The daily-gift sheet rides in on its own query, i.e. AFTER the rail is
    // already on screen — dismissing once at load finds nothing and then a
    // fixed overlay silently eats the drag. Keep sweeping for a few seconds.
    for (let i = 0; i < 6; i++) {
      await page.waitForTimeout(500);
      if (await appDialogs(page).count()) await page.keyboard.press('Escape');
    }
    expect(await appDialogs(page).count(), 'a modal is covering the ad rail').toBe(0);

    await track.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);

    const box = await track.boundingBox();
    expect(box, 'ad rail never laid out').not.toBeNull();
    if (!box) return;
    const y = box.y + box.height / 2;

    await page.mouse.move(box.x + box.width * 0.02, y);
    await page.mouse.down();

    for (const fraction of [0.02, 0.25, 0.5, 0.75, 0.98]) {
      await page.mouse.move(box.x + box.width * fraction, y);
      await page.waitForTimeout(150);

      const lens = await page.evaluate(() => {
        const rail = document.querySelector('[role="slider"]');
        const track = rail?.firstElementChild as HTMLElement | undefined;
        const lens = rail?.querySelector('[class*="bottom-full"]') as HTMLElement | null;
        if (!track || !lens) return null;
        const header = lens.firstElementChild as HTMLElement;
        const l = lens.getBoundingClientRect();
        const t = track.getBoundingClientRect();
        return {
          text: lens.innerText.replace(/\n/g, ' · '),
          spillLeft: t.left - l.left,
          spillRight: l.right - t.right,
          headerClipped: header.scrollWidth - header.clientWidth,
          headerHeight: header.getBoundingClientRect().height,
        };
      });

      expect(lens, `no lens at ${fraction} of the rail`).not.toBeNull();
      if (!lens) continue;
      const where = `"${lens.text}"`;
      expect(lens.spillLeft, `lens hangs off the left of the rail — ${where}`).toBeLessThan(1);
      expect(lens.spillRight, `lens hangs off the right of the rail — ${where}`).toBeLessThan(1);
      expect(lens.headerClipped, `lens header is clipped — ${where}`).toBeLessThan(1);
      // One line of an 11/13px header is ~20px; two are ~36. Anything past 26
      // means the title wrapped, which is the same defect seen from the inside.
      expect(lens.headerHeight, `lens header wrapped onto a second line — ${where}`).toBeLessThan(
        26
      );
    }

    await page.mouse.up();
  });
});

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
