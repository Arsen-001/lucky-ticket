import { test, expect, type Page } from '@playwright/test';
import { STATIC_ROUTES, DETAIL_PAGES, REDIRECTS } from '../e2e/routes';

/**
 * The suite that runs against a real `next build`.
 *
 * Everything here is invisible to `e2e/`, which auto-starts `next dev`. Three
 * production defects shipped green through that suite:
 *
 *  - the image optimizer 400s on SVG in production and passes it through in dev,
 *    so every language flag rendered as an empty box on prod and looked fine on
 *    every machine it was written on;
 *  - `overflow: scroll` on a painted-track utility reserved a scrollbar with
 *    nothing to scroll — a purple bar under the onboarding language list;
 *  - `global-not-found` was prerendered, and a build-time render cannot perform
 *    a per-request redirect, so unknown URLs served a blank error shell instead
 *    of going Home — including `/engines`, which the live task catalog
 *    deep-links to.
 *
 * So the assertions here are about what a screen LOOKS like once built, not
 * about whether it renders at all (`e2e/` already covers that).
 */

/** Runs in the page. Reports only what a human would see as broken. */
const probe = () => {
  const round = (v: number) => Math.round(v * 10) / 10;

  // `complete` with no intrinsic width = the request finished and produced no
  // image. Images still in flight are `complete === false` and are waited for.
  const blankImages = [...document.querySelectorAll('img')]
    .filter(el => el.complete && el.naturalWidth === 0)
    .map(el => `${el.alt || '(no alt)'} ← ${(el.currentSrc || el.src || '').slice(-70)}`);

  // A reserved track is the box the scrollbar occupies: offset − client − border.
  // Reserved on an axis that cannot scroll = a bar the user can never move.
  // Only scroll containers are measured: `clientWidth`/`clientHeight` are 0 on
  // inline elements by spec, which would report their whole box as a track.
  const scrolls = new Set(['auto', 'scroll']);
  const strayTracks = new Set<string>();
  for (const el of document.querySelectorAll<HTMLElement>('*')) {
    const cs = getComputedStyle(el);
    if (!scrolls.has(cs.overflowX) && !scrolls.has(cs.overflowY)) continue;
    if (!el.offsetWidth && !el.offsetHeight) continue;
    const borderX = parseFloat(cs.borderLeftWidth) + parseFloat(cs.borderRightWidth);
    const borderY = parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth);
    const vertical = el.offsetWidth - el.clientWidth - borderX;
    const horizontal = el.offsetHeight - el.clientHeight - borderY;
    const label = `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 60)}`;
    if (horizontal > 0.5 && el.scrollWidth <= el.clientWidth)
      strayTracks.add(`horizontal ${round(horizontal)}px — ${label}`);
    if (vertical > 0.5 && el.scrollHeight <= el.clientHeight)
      strayTracks.add(`vertical ${round(vertical)}px — ${label}`);
  }

  return {
    blankImages,
    strayTracks: [...strayTracks],
    sidewaysScroll:
      document.documentElement.scrollWidth > window.innerWidth
        ? `${document.documentElement.scrollWidth}px of content in a ${window.innerWidth}px viewport`
        : null,
  };
};

async function assertLooksRightBuilt(page: Page, label: string, url: string) {
  const failedRequests: string[] = [];
  const crashes: string[] = [];
  page.on('response', response => {
    if (response.status() >= 400) {
      failedRequests.push(`${response.status()} ${new URL(response.url()).pathname}`);
    }
  });
  page.on('pageerror', error => {
    // React's SSR→client fallback is recoverable — the screen still renders.
    if (!error.message.includes('Switched to client rendering')) {
      crashes.push(error.message.slice(0, 160));
    }
  });

  await page.goto(url, { waitUntil: 'load' });

  // Mock latency runs to 1200ms; wait for content, then for the images it asked
  // for to settle, so a slow image is never mistaken for a broken one.
  await expect
    .poll(async () => (await page.locator('body').innerText()).trim().length, {
      message: `${label} never rendered visible text`,
    })
    .toBeGreaterThan(0);
  await expect
    .poll(
      async () =>
        page.locator('img').evaluateAll((els: HTMLImageElement[]) =>
          els
            // Only what the viewport actually asked for: `next/image` is lazy by
            // default, so an image below the fold never starts loading and its
            // `complete` stays false forever. Waiting on every image made this
            // suite unsatisfiable on any long list — /activity, in CI.
            .filter(el => {
              const box = el.getBoundingClientRect();
              return box.bottom > 0 && box.top < window.innerHeight;
            })
            .every(el => el.complete)
        ),
      {
        message: `${label} still had images in flight`,
        // Longer than the suite's 15s default, but NOT because the optimizer is
        // slow — that was the first, wrong reading of this timeout. Measured on
        // the CI run it was blamed for: every `/_next/image` optimize answered
        // in 5-20 ms, cold. What actually hung was one medal on /activity whose
        // request was cancelled mid-flight by a re-render; Chrome then never
        // resolved that URL again for the page, so no timeout would ever have
        // been long enough (fixed in ActivityHeroCard — see
        // ActivityTierLadderSkeleton for the mechanism).
        //
        // Kept generous anyway: a slow green costs nothing here (the poll
        // returns the moment it is true), while a non-deterministic red teaches
        // people to re-run instead of reading the log — which is exactly how
        // the sibling backend stayed red for three and a half weeks unnoticed.
        timeout: 45_000,
      }
    )
    .toBe(true);

  const { blankImages, strayTracks, sidewaysScroll } = await page.evaluate(probe);

  expect(blankImages, `images that loaded to nothing on ${label}`).toEqual([]);
  expect(strayTracks, `scrollbar tracks reserved with nothing to scroll on ${label}`).toEqual([]);
  expect(sidewaysScroll, `${label} scrolls sideways`).toBeNull();
  expect(failedRequests, `failed requests on ${label}`).toEqual([]);
  expect(crashes, `uncaught runtime errors on ${label}`).toEqual([]);
}

for (const route of STATIC_ROUTES) {
  test(`built screen looks right: ${route}`, async ({ page }) => {
    await assertLooksRightBuilt(page, route, route);
  });
}

for (const { name, url } of DETAIL_PAGES) {
  test(`built detail screen looks right: ${name}`, async ({ page }) => {
    await assertLooksRightBuilt(page, `${name} (${url})`, url);
  });
}

for (const { from, to, status } of REDIRECTS) {
  test(`redirect survives the build: ${from} → ${to}`, async ({ page }) => {
    // Following the redirect is the point: a build-time render can answer 200
    // with a blank error shell, which only a check on the landing URL catches.
    const response = await page.goto(from, { waitUntil: 'load' });

    if (status === undefined) {
      expect(response?.status(), `HTTP status after ${from}`).toBeLessThan(400);
    } else {
      // An error status can be the right answer — what must not happen is the
      // player being stranded on it. The landing check below is the real test.
      expect(response?.status(), `HTTP status after ${from}`).toBe(status);
    }

    // Polled, not read once: a meta refresh fires after `load`, so the URL is
    // still the dead one at this point. Reading it synchronously passed only
    // for the platform redirect, which `goto` had already followed.
    await expect
      .poll(() => new URL(page.url()).pathname, { message: `where ${from} lands` })
      .toBe(to);
    await expect
      .poll(async () => (await page.locator('body').innerText()).trim().length, {
        message: `${from} landed on a blank page`,
      })
      .toBeGreaterThan(0);
  });
}
