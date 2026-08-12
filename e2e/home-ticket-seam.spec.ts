import { expect, test } from '@playwright/test';

/**
 * Home's tournament card is a ticket that is CUT, not drawn: the two notches on
 * its seam are masked out of the card (`mask-composite: intersect`, with
 * `-webkit-mask-composite: source-in` next to it for older Safari), so the
 * backdrop shows through them instead of two dark dots being painted on.
 *
 * Masks are among the first things to differ in WKWebView, and this one degrades
 * SILENTLY: an engine that ignores the composite paints a plain rectangle with a
 * dashed line down it, which looks deliberate. Nothing errors, nothing shifts,
 * and every desktop check stays green — which is exactly the shape of defect
 * this suite exists to catch, so it is asserted on the pixels.
 *
 * Runs in the webkit project as well as chromium; @see playwright.config.ts.
 *
 * Four traps live on this screen, all of them paid for once already:
 *   · The daily-gift modal opens over the strip. Measure through it and the
 *     sample is the modal's gold, not the card.
 *   · The strip autoplays and the rail fades whatever drifts off centre, so a
 *     card caught mid-slide is painted at a partial, uneven alpha and no flat
 *     colour reading survives.
 *   · The strip loops, so `.first()` is usually an off-centre clone sitting
 *     inside that fade.
 *   · Home refetches, React replaces the nodes, and a held element handle goes
 *     stale mid-screenshot. Nothing here holds one: the card is located, shot by
 *     coordinates, and the coordinates are re-read afterwards to prove the strip
 *     did not move under the camera.
 */

const SLOW = 45_000;

/**
 * WebKit on a CI runner is a different machine from WebKit on a laptop: this
 * screen costs 3.5–7.2s locally and 18–21s there, and the whole dev-server job
 * runs three workers compiling routes on demand. The first run of this test
 * failed at the default 90s — not on the mask, on never getting far enough to
 * look at it — and its retry timed out inside `goto`. The cube tests in
 * `layout-invariants` already carry the same allowance for the same reason.
 */
const SLOW_TEST_TIMEOUT = 180_000;

/** The centred ticket's box plus the two custom properties the punches use. */
type Card = { x: number; y: number; width: number; height: number; stub: number; notch: number };

const CENTRED_CARD = () => {
  // Swiper's own class for the slide in the middle. Used instead of measuring
  // which card is nearest the centre because the colouring below has to be a
  // STYLESHEET rule: Home refetches, React replaces these nodes, and anything
  // written onto an element (inline style, data attribute) is gone by the time
  // the camera fires. Swiper re-applies its classes on every render.
  const centred = document.querySelector('.swiper-slide-active .home-tournament-ticket');
  if (!centred) return null;
  const rect = centred.getBoundingClientRect();
  const style = getComputedStyle(centred);
  return {
    // Page coordinates, not viewport ones: `page.screenshot({ clip })` measures
    // from the top of the DOCUMENT, and Home is scrollable. Reading the rect
    // straight from `getBoundingClientRect` put the crop a scroll-offset away
    // from the card and sampled the backdrop instead.
    x: Math.round(rect.x + window.scrollX),
    y: Math.round(rect.y + window.scrollY),
    width: Math.round(rect.width),
    height: Math.round(rect.height),
    stub: parseFloat(style.getPropertyValue('--home-ticket-stub')),
    notch: parseFloat(style.getPropertyValue('--home-ticket-notch')),
  };
};

test.describe('home ticket seam', () => {
  test('both punches are cut out of the card', async ({ page }) => {
    test.setTimeout(SLOW_TEST_TIMEOUT);
    // Ask the app not to move, instead of asking it to stop after it already
    // has. Autoplay here is JS and gated on `prefers-reduced-motion` (see
    // `HomeUpcomingTournaments`), so emulating the preference means the strip
    // never starts travelling — where `swiper.autoplay.stop()` below only ever
    // caught it between slides, and never at all on a loaded CI runner: this
    // test failed there with "never held still" after 15 attempts (12.08.2026)
    // while passing every time on a laptop.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.getByTestId('app-shell').waitFor({ timeout: SLOW });
    await page.locator('.home-tournament-ticket').first().waitFor({ timeout: SLOW });

    // Hold the screen still: no modal over the strip, no autoplay, no entry
    // animation mid-flight. Durations are collapsed rather than removed — this
    // app's entry animation is `fill-mode: both`, so cancelling it outright
    // would leave items stuck at their opening opacity of 0.
    await page.addStyleTag({
      content: '*{animation-duration:1ms !important;transition-duration:1ms !important;}',
    });
    // Autoplay restarts on interaction, so this is repeated before every attempt.
    const clearTheScreen = () =>
      page.evaluate(() => {
        document.querySelectorAll('.swiper').forEach(el => {
          const swiper = (el as HTMLElement & { swiper?: { autoplay?: { stop(): void } } }).swiper;
          swiper?.autoplay?.stop();
        });
      });
    await clearTheScreen();

    // One flat colour over the whole card makes "is this pixel still card?" a
    // question with a 200-unit answer. Without it the bottom punch is unreadable:
    // down there the card's own fill and the page behind it match to one unit.
    // Flat colours make "is this pixel still card?" a question with a 200-unit
    // answer — without them the bottom punch is unreadable, because down there
    // the card's own fill and the page behind it match to one unit.
    //
    // Two colours, not one: in a looping strip the slides overlap, so a hole in
    // the front card can reveal the card behind it. When both were the same red,
    // "I can see through it" and "there is no hole" were the identical pixel.
    await page.addStyleTag({
      content:
        // The daily-gift modal opens on a timer after its data lands and covers
        // the bottom half of the strip. Removing its node is not enough — it
        // mounts again — so it is hidden by a RULE, which re-mounting cannot
        // undo. This test measured the modal's own scrim twice before that.
        'div.fixed:has([role="dialog"]),[role="dialog"]{display:none !important;}' +
        '.home-tournament-ticket{background:#0000ff !important;}' +
        '.swiper-slide-active .home-tournament-ticket{background:#ff0000 !important;}' +
        '.home-tournament-ticket *{opacity:0 !important;}',
    });

    let card: Card | null = null;
    let painted: Record<string, number[]> | null = null;

    // Locate, shoot, then check the shot actually caught the card.
    //
    // The first version demanded that the rect be IDENTICAL before and after
    // the screenshot, which on a loaded runner never converged — Swiper's
    // transform drifts by a fraction of a pixel and React re-renders under it.
    // The colour check below is the stronger guarantee anyway: if the crop had
    // moved off the card, the "solid" sample would not be red. So drift is
    // tolerated within a pixel and the frame is judged by what it contains.
    for (let attempt = 0; attempt < 15 && !painted; attempt++) {
      await page.waitForTimeout(400);
      await clearTheScreen();
      const before = (await page.evaluate(CENTRED_CARD)) as Card | null;
      if (!before) continue;

      // The strip can put the card outside the viewport between two frames, and
      // a clip that lands off-screen throws rather than returning a bad image.
      // That is a reason to take the shot again, not to fail the run.
      let shot: string;
      try {
        shot = (
          await page.screenshot({
            type: 'png',
            clip: { x: before.x, y: before.y, width: before.width, height: before.height },
          })
        ).toString('base64');
      } catch {
        continue;
      }

      const after = (await page.evaluate(CENTRED_CARD)) as Card | null;
      if (!after || Math.abs(after.x - before.x) > 1 || Math.abs(after.y - before.y) > 1) continue;

      const x = before.stub + 2; // clear of the seam's own dashed border
      const points = {
        topPunch: [x, 2],
        outsideTop: [x, before.notch + 6],
        bottomPunch: [x, before.height - 3],
        outsideBottom: [x, before.height - before.notch - 6],
      };

      painted = await page.evaluate(
        async ({ shot, points, cssWidth }) => {
          const img = new Image();
          img.src = 'data:image/png;base64,' + shot;
          await img.decode();
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0);
          // The phone project renders at deviceScaleFactor 3, so the screenshot
          // is not in CSS pixels — scale by whatever came back.
          const k = img.width / cssWidth;
          return Object.fromEntries(
            Object.entries(points).map(([name, [px, py]]) => [
              name,
              Array.from(ctx.getImageData(Math.round(px * k), Math.round(py * k), 1, 1).data),
            ])
          ) as Record<string, number[]>;
        },
        { shot, points, cssWidth: before.width }
      );

      // Did the camera catch the card this measurement is about? Swiper can move
      // its active class between the two calls, and then the crop lands on a
      // NEIGHBOUR — painted blue, not red. That is a stale frame, so take
      // another one rather than judging the mask on the wrong card.
      const solid = painted.outsideTop;
      if (solid[0] - Math.max(solid[1], solid[2]) <= 15) {
        painted = null;
        continue;
      }
      card = before;
    }

    expect(
      card,
      'the home strip never held still long enough to read the centred ticket'
    ).not.toBeNull();
    expect(painted, 'no pixels read from the ticket').not.toBeNull();
    if (!card || !painted) return;
    expect(card.stub, 'the stub width the punches hang off').toBeGreaterThan(0);
    expect(card.notch, 'the punch radius').toBeGreaterThan(0);

    // Judged against the card's own painted colour, never against #ff0000
    // itself: anything the screen lays over Home (a scrim, the rail's fade) dims
    // the repaint, and an absolute threshold reads that as a failure on a
    // perfectly good card.
    const solid = painted.outsideTop;
    const apart = (p: number[]) => Math.max(...[0, 1, 2].map(i => Math.abs(p[i] - solid[i])));

    expect(
      apart(painted.outsideBottom),
      `card is not one colour end to end (${painted.outsideBottom} vs ${solid})`
    ).toBeLessThan(25);

    expect(
      apart(painted.topPunch),
      `top notch is painted over — the seam mask did not apply (${painted.topPunch} vs card ${solid})`
    ).toBeGreaterThan(25);
    expect(
      apart(painted.bottomPunch),
      `bottom notch is painted over — the seam mask did not apply (${painted.bottomPunch} vs card ${solid})`
    ).toBeGreaterThan(25);
  });
});
