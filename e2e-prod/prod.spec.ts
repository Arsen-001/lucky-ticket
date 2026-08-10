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

/**
 * Images the screen asked for and has not got yet, named well enough to act on.
 *
 * Two things are deliberately NOT waited for, because the browser has decided
 * not to fetch them and no timeout can change that:
 *
 *  - anything outside the viewport (`next/image` is lazy by default), and
 *  - anything inside it that is not FACING it. The home cube keeps chip art on
 *    its bottom face, which paints a 72×72 icon as 46×5; Chrome never requests
 *    those (measured 10.08.2026: five such slivers at ratio 0.07 while the front
 *    face sat at 0.72 and loaded normally).
 */
const imagesInFlight = (page: Page) =>
  page.locator('img').evaluateAll((els: HTMLImageElement[]) =>
    els
      .filter(el => {
        const box = el.getBoundingClientRect();
        if (!(box.bottom > 0 && box.top < window.innerHeight)) return false;
        return box.height >= el.offsetHeight / 2 && box.width >= el.offsetWidth / 2;
      })
      .filter(el => !el.complete)
      // Name the offender. This used to assert a bare `true`, so a red said only
      // "images in flight" and every diagnosis after it was guesswork — the
      // file, its size and whether the request had even been made all had to be
      // re-derived by hand.
      .map(el => {
        const box = el.getBoundingClientRect();
        const file =
          decodeURIComponent(el.currentSrc || el.src)
            .split('/')
            .pop() ?? '?';
        return `${file.slice(0, 70)} [${Math.round(box.width)}×${Math.round(box.height)}, loading=${el.loading}, natural=${el.naturalWidth}, currentSrc=${el.currentSrc ? 'set' : 'EMPTY'}]`;
      })
  );

/**
 * Poll until nothing is in flight, and return what still is when time runs out.
 *
 * 20s, not the old 45s: the optimizer answers in 10–64 ms even cold (measured
 * from the CI trace of the run this was written for — 24 requests on
 * /invite-friends, 21 answered in that band). What the long timeout was really
 * waiting on was a request that gets CANCELLED mid-flight when the element
 * holding it is swapped out (a skeleton giving way to data does exactly that).
 * Chrome then never issues that URL again for the page: measured here on a
 * production build, neither re-assigning `src`/`srcset` nor appending a BRAND
 * NEW `img` with the same URL loads it — `currentSrc` stays empty forever. So
 * no timeout and no in-page retry can rescue that state, and waiting 45s for it
 * only bought a slower red.
 *
 * The caller therefore reloads and asks again. A screen whose images production
 * genuinely cannot serve fails both times; the cancelled-request artifact
 * cannot survive a fresh document, because the poisoning is per-page.
 */
const waitForImages = async (page: Page, label: string) => {
  const deadline = Date.now() + 20_000;
  let inFlight = await imagesInFlight(page);
  while (inFlight.length && Date.now() < deadline) {
    await page.waitForTimeout(500);
    inFlight = await imagesInFlight(page);
  }
  if (inFlight.length)
    console.log(`[${label}] images in flight after 20s: ${inFlight.join(' | ')}`);
  return inFlight;
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

  // The app itself, not one of the screens PreLaunchGate renders in its place
  // (countdown / maintenance / splash / open-on-your-phone). All four load
  // cleanly and render text, so without this the whole sweep can pass against
  // the same countdown on every route — which is exactly what it did.
  await expect(
    page.getByTestId('app-shell'),
    `${label} did not render the app itself`
  ).toBeAttached({ timeout: 15_000 });

  // A stuck image is not always a broken one, so this asks twice: once on the
  // load under test, and — only if something is still open — once on a fresh
  // load of the same URL. See `imagesInFlight` for why the second ask is the
  // honest arbiter and not a re-run in disguise.
  let inFlight = await waitForImages(page, label);
  if (inFlight.length) {
    await page.reload({ waitUntil: 'load' });
    await expect(
      page.getByTestId('app-shell'),
      `${label} did not render the app itself after a reload`
    ).toBeAttached({ timeout: 15_000 });
    inFlight = await waitForImages(page, label);
  }

  expect(
    inFlight,
    `${label} still had images in flight after a second, fresh load — production cannot serve them`
  ).toEqual([]);

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
