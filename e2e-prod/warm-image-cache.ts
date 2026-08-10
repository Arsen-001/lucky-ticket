import { chromium } from '@playwright/test';
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
 */
export default async function warmImageCache() {
  const baseURL = 'http://localhost:3100';
  const routes = [...STATIC_ROUTES, ...DETAIL_PAGES.map(page => page.url)];

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const optimized = new Set<string>();
  page.on('response', response => {
    if (response.url().includes('/_next/image')) optimized.add(response.url());
  });

  const startedAt = Date.now();
  for (const route of routes) {
    // A screen that fails to load is not this file's problem — the suite itself
    // reports that, with the diagnostics for it. Warming just moves on.
    await page.goto(`${baseURL}${route}`, { waitUntil: 'load' }).catch(() => {});
    // Settle, then wait for what the screen asked for. Serially: one page at a
    // time is the whole point, so nothing coalesces onto anything.
    await page.waitForTimeout(1200);
    await page
      .waitForFunction(
        () => [...document.querySelectorAll('img')].every(el => el.complete),
        undefined,
        { timeout: 8000 }
      )
      .catch(() => {});
  }

  await browser.close();
  console.log(
    `[warm] ${optimized.size} optimized images cached over ${routes.length} routes in ${Math.round((Date.now() - startedAt) / 1000)}s`
  );
}
