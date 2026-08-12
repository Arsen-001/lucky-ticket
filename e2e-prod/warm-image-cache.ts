import { chromium, type Page, type Request } from '@playwright/test';
import { STATIC_ROUTES, DETAIL_PAGES } from '../e2e/routes';

/**
 * Walk the app once, serially, before the suite starts — purely to fill
 * `next start`'s image-optimizer cache.
 *
 * Why this exists. The optimizer coalesces concurrent requests for the same
 * cache key onto one job, and a job whose FIRST requester goes away is left
 * dead: every later request for that URL — from any page, any tab, after any
 * reload — joins the dead entry and never gets an answer. The suite manufactures
 * exactly that: three workers loading screens in parallel, each screen swapping
 * skeletons for data and tearing down images mid-request.
 *
 * The mechanism, read out of `next@16.3.0` rather than inferred: the optimizer
 * fetches the source through `fetchInternalImage(href, req, res)` — the FIRST
 * requester's own request and socket — and awaits `mocked.res.hasStreamed`,
 * which resolves only on `finish`/`end`/`error`. Lose that socket and none of
 * the three ever fires, so the job never settles; `Batcher` only drops a key
 * from `pending` in its `finally`, so the key stays claimed for the life of the
 * server process.
 *
 * Measured on the CI run this was written for (10.08.2026, trace from
 * `/invite-friends`): 46 optimizer requests, 44 answered in 1–40 ms, and
 * `bolt…&w=32` never answered — on the first load AND on a fresh reload 20 s
 * later, while every other image on that same reload came back in ~1 ms from
 * cache. One poisoned key, red build. Locally it is unreproducible: a single
 * browser never races itself, and the cache is warm from the first run onwards.
 *
 * A warm cache removes the race outright — a key already on disk is served from
 * it and never starts a job to coalesce onto. It also makes the sweep faster
 * than it was before (~1 ms per image instead of 5–40 ms).
 *
 * This is a CI-shape fix, not a cover-up: a screen whose images production
 * genuinely cannot serve still fails, because warming asks for the same URLs and
 * a broken one stays broken.
 *
 * ── 12.08.2026: warming was itself poisoning keys ──────────────────────────
 * It waited on `imgs.every(el => el.complete)` with an 8 s cap and swallowed the
 * timeout, then navigated. Both halves are wrong for this job:
 *
 *  - `complete` is a property of the ELEMENT, and it is false for a lazy image
 *    the browser has not asked for yet, so on a screen with anything below the
 *    fold the condition cannot be met and the 8 s is always spent;
 *  - navigating (or closing the browser) while a request is open is precisely
 *    the act that kills a key. Warming is always the FIRST requester, so a key
 *    it abandons is dead for every worker that follows.
 *
 * Trace of the red run it was fixed on: `bolt&w=32` and `lc-coin&w=48` answered
 * with status −1 twice each, 21 s apart, while `lc-coin&w=64` — the same source
 * image, one width over — came back in 1 ms. Per-key death, surviving a reload:
 * only the server can do that, and only if something abandoned the key first.
 *
 * So this now tracks the REQUESTS, not the elements, and leaves a page only once
 * nothing is in flight. Giving up is still possible (a genuinely broken URL must
 * not hang the whole suite) but it is loud and named, so a red says which key
 * was left open instead of leaving it to be re-derived from a trace.
 */

const isOptimizerRequest = (request: Request) => request.url().includes('/_next/image');

/**
 * How long to wait for a screen's optimizer requests to drain before giving up
 * on it. Generous on purpose: the cost of waiting is seconds of CI time, the
 * cost of walking away is a dead key and a red build.
 */
const DRAIN_TIMEOUT = 30_000;

/** Nothing may be in flight, and nothing new started, for this long. */
const QUIET_WINDOW = 750;

export default async function warmImageCache() {
  const baseURL = 'http://localhost:3100';
  const routes = [...STATIC_ROUTES, ...DETAIL_PAGES.map(page => page.url)];

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

  const inFlight = new Set<string>();
  const optimized = new Set<string>();
  const abandoned = new Set<string>();
  let lastActivity = Date.now();

  page.on('request', request => {
    if (!isOptimizerRequest(request)) return;
    inFlight.add(request.url());
    lastActivity = Date.now();
  });
  const settle = (request: Request) => {
    if (!isOptimizerRequest(request)) return;
    inFlight.delete(request.url());
    optimized.add(request.url());
    lastActivity = Date.now();
  };
  page.on('requestfinished', settle);
  page.on('requestfailed', settle);

  /** Wait until no optimizer request is open and none has started recently. */
  const drain = async (label: string) => {
    const deadline = Date.now() + DRAIN_TIMEOUT;
    while (Date.now() < deadline) {
      if (!inFlight.size && Date.now() - lastActivity > QUIET_WINDOW) return;
      await page.waitForTimeout(100);
    }
    // Only reachable if the server stopped answering, which is worth a red on
    // its own — name the keys so the next reader does not need the trace.
    for (const url of inFlight) abandoned.add(url);
    console.log(
      `[warm] ${label}: ${inFlight.size} image request(s) still open after ${DRAIN_TIMEOUT / 1000}s — ${[...inFlight].join(' | ')}`
    );
    inFlight.clear();
  };

  /**
   * Lazy images below the fold are never requested by a page that just sits
   * there, so warming would leave their keys cold for three parallel workers to
   * race over. One pass down and back asks for them here, serially, where there
   * is nothing to race.
   *
   * Scrolls the element that actually scrolls, not the window: both layouts put
   * `overflow-auto` on the content div ((tabs) and (out-tabs) alike), so the
   * document never moves and `window.scrollTo` would be a no-op.
   */
  const revealLazyImages = async (target: Page) => {
    await target
      .evaluate(async () => {
        const scrollers = [
          document.scrollingElement,
          ...document.querySelectorAll<HTMLElement>('*'),
        ].filter((el): el is HTMLElement => !!el && el.scrollHeight > el.clientHeight + 4);

        for (const el of scrollers) {
          const step = el.clientHeight || window.innerHeight;
          for (let y = step; y < el.scrollHeight + step; y += step) {
            el.scrollTop = y;
            await new Promise(resolve => setTimeout(resolve, 150));
          }
          el.scrollTop = 0;
        }
      })
      .catch(() => {});
  };

  const startedAt = Date.now();
  for (const route of routes) {
    // A screen that fails to load is not this file's problem — the suite itself
    // reports that, with the diagnostics for it. Warming just moves on.
    await page.goto(`${baseURL}${route}`, { waitUntil: 'load' }).catch(() => {});
    // Mock latency runs to 1200ms, and the data swap replaces images.
    await page.waitForTimeout(1200);
    await revealLazyImages(page);
    await drain(route);
  }

  // The last screen's requests are as easy to abandon as any other's, and
  // closing the browser abandons them just as hard as navigating.
  await drain('before close');
  await browser.close();

  console.log(
    `[warm] ${optimized.size} optimized images cached over ${routes.length} routes in ${Math.round((Date.now() - startedAt) / 1000)}s`
  );
  if (abandoned.size) {
    console.log(`[warm] ${abandoned.size} key(s) left open — expect them to fail for every worker`);
  }
}
