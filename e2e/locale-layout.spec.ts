import { expect, test, type Page } from '@playwright/test';
import { STATIC_ROUTES } from './routes';

/**
 * Does the layout survive a language that is not English?
 *
 * Two failure modes, neither visible in the language the app was built in:
 *
 *  - **Right-to-left.** The physical Tailwind utilities were converted to
 *    logical ones so the layout follows `dir`, but two families were left
 *    physical on purpose (`left-1/2` centring, symmetric decorative pairs).
 *    That reasoning was never checked against a painted screen.
 *  - **Longer words.** Turkish and German run noticeably longer than English.
 *    A button sized to "Claim" has no room for "Ödülü al" or
 *    "Belohnung erhalten", and the overflow is silent — the text just gets cut.
 *
 * The narrowest supported width, because that is where content runs out of
 * room; a wider pass finds nothing this one missed.
 */
const WIDTH = 320;

/** RTL, and the two languages whose words are longest. */
const LOCALES = ['ar', 'tr', 'de'] as const;

/** CI compiles routes on demand, so the waits are generous. */
const SLOW = 45_000;

/**
 * Open a route in a given language, and prove it is the app that opened.
 *
 * The `app-shell` wait is the whole point, not a formality. `PreLaunchGate`
 * swaps the entire tree for one of four stand-ins — countdown, maintenance,
 * boot splash, open-on-your-phone — and each of them loads fine and renders
 * plenty of text. The first version of this file waited on body text instead,
 * and scored 243 green checks against the same QR wall on every route in every
 * language: the layout audit had measured one screen 243 times without ever
 * seeing a real one. Under `.env.local` this suite talks to the real backend,
 * which answers "you are on a computer" and serves exactly that wall, so the
 * failure is the DEFAULT here, not an edge case. Run against the mock layer:
 *
 *     NEXT_PUBLIC_API_URL= npm run dev
 */
const openWithLocale = async (page: Page, locale: string, route: string) => {
  await page
    .context()
    .addCookies([{ name: 'locale', value: locale, url: 'http://localhost:3000' }]);
  await page.goto(route, { waitUntil: 'domcontentloaded' });
  await expect(
    page.getByTestId('app-shell'),
    `${route} in ${locale} did not render the app itself — the gate is up, so nothing below measures the real screen`
  ).toBeAttached({ timeout: SLOW });
  await page.waitForFunction(() => document.body.innerText.trim().length > 20, null, {
    timeout: SLOW,
  });
};

for (const locale of LOCALES) {
  test.describe(`layout in ${locale}`, () => {
    test.use({ viewport: { width: WIDTH, height: 844 } });

    test(`${locale}: the document declares the right direction`, async ({ page }) => {
      await openWithLocale(page, locale, '/');
      const { dir, lang } = await page.evaluate(() => ({
        dir: document.documentElement.dir,
        lang: document.documentElement.lang,
      }));
      expect({ dir, lang }).toEqual({ dir: locale === 'ar' ? 'rtl' : 'ltr', lang: locale });
    });

    for (const route of STATIC_ROUTES) {
      test(`${locale}: ${route} does not scroll sideways`, async ({ page }) => {
        await openWithLocale(page, locale, route);

        const { scrollWidth, innerWidth } = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
        }));

        expect(
          scrollWidth,
          `${route} in ${locale} scrolls sideways at ${innerWidth}px (content ${scrollWidth}px)`
        ).toBeLessThanOrEqual(innerWidth + 1);
      });

      test(`${locale}: ${route} does not cut its own text`, async ({ page }) => {
        await openWithLocale(page, locale, route);

        /**
         * Text wider than the box that holds it, where nothing was asked to
         * clip it.
         *
         * `truncate` / `line-clamp` / `overflow-hidden` are deliberate — a long
         * username SHOULD get an ellipsis — so anything carrying them is
         * excluded. What is left is text overflowing a box that never planned
         * for it, which is the shape a too-long translation takes.
         */
        const clipped = await page.evaluate(() => {
          const out: string[] = [];
          const named = (el: HTMLElement) =>
            `${el.tagName} "${(el.innerText ?? '').trim().slice(0, 40)}"`;

          for (const el of document.querySelectorAll<HTMLElement>(
            'button, a, h1, h2, h3, p, span'
          )) {
            if (el.children.length > 0) continue;
            const text = (el.innerText ?? '').trim();
            if (!text) continue;
            const style = getComputedStyle(el);
            const deliberate =
              style.textOverflow === 'ellipsis' || style.webkitLineClamp !== 'none';
            if (deliberate) continue;

            // Sideways: a single unbreakable line wider than the box holding it.
            if (style.overflow === 'visible' && style.whiteSpace.startsWith('nowrap')) {
              const over = el.scrollWidth - el.clientWidth;
              if (over > 1) out.push(`${named(el)} runs ${over}px past its box`);
            }

            /**
             * Downwards — the failure mode a longer language actually produces.
             *
             * English "Claim" fits one line; German "Belohnung erhalten" wraps to
             * two, and in a box with a fixed height and `overflow: hidden` the
             * second line is simply not painted. Nothing scrolls, nothing throws,
             * and the button looks fine until you read it. `line-clamp` and
             * `ellipsis` are excluded above because there the trimming is asked
             * for; what is left is a box that never expected a second line.
             */
            if (style.overflow !== 'visible' && el.scrollHeight - el.clientHeight > 1) {
              out.push(`${named(el)} is cut off ${el.scrollHeight - el.clientHeight}px below`);
            }
          }

          /**
           * Text painted outside the app's own column, with no way to reach it.
           *
           * Sideways scrolling catches this only when the PAGE is allowed to
           * scroll; inside an `overflow-hidden` shell the overflowing text is
           * silently clipped at the edge instead, and the route still passes the
           * scroll check while a word sits half off-screen.
           *
           * Two exclusions, both learned from this check's own false positives:
           *
           *  - **Inside a horizontal scroller** the reader scrolls to it, so
           *    off-screen is the design. Without this the check is asymmetric and
           *    therefore useless for comparing directions: a tab row overflowing
           *    to the right in English stays under `innerWidth` and passes, while
           *    the identical row overflowing to the LEFT in Arabic lands at
           *    negative x and fails. That measured "18 Arabic-only defects" that
           *    were the same correctly-mirrored rows.
           *  - **Inside something closed.** The drawer is parked off the edge
           *    while shut, carrying all 16 of its menu items — the single biggest
           *    source of noise here, and deliberate.
           *
           * The second exclusion is why `closed overlays really are off-screen`
           * below exists. Excluding the drawer by IDENTITY ("it is closed, so it
           * cannot be in the way") assumed the exact fact worth checking, and it
           * was false: `end-…` flips with direction but `translate-x` does not, so
           * in Arabic the shut drawer travelled INTO the screen and covered 86px
           * of every route. This check ran green over all of it. An exclusion may
           * not rest on the property it is hiding — so that one is now asserted.
           */
          const unreachable = (el: HTMLElement): boolean => {
            for (let node = el.parentElement; node; node = node.parentElement) {
              if (node.hasAttribute('inert') || node.getAttribute('aria-hidden') === 'true')
                return false;
              const style = getComputedStyle(node);
              if (/auto|scroll/.test(style.overflowX)) return false;
            }
            return true;
          };

          for (const el of document.querySelectorAll<HTMLElement>(
            'button, a, h1, h2, h3, p, span'
          )) {
            if (el.children.length > 0) continue;
            if (!(el.innerText ?? '').trim()) continue;
            const box = el.getBoundingClientRect();
            if (box.width === 0 || box.height === 0) continue;
            if (box.right <= window.innerWidth + 1 && box.left >= -1) continue;
            if (!unreachable(el)) continue;
            out.push(
              `${named(el)} sits outside the screen (${Math.round(box.left)}…${Math.round(box.right)} of ${window.innerWidth}px)`
            );
          }

          return out;
        });

        expect(clipped, `${route} in ${locale} cuts its own text`).toEqual([]);
      });
    }

    /**
     * A shut overlay must be OFF the screen, not merely marked shut.
     *
     * `inert` and `aria-hidden` say "you cannot reach this". They say nothing
     * about where it is painted, and the check above trusted them to mean both.
     * Measured, not assumed: the panel's own box against the viewport.
     */
    test('closed overlays really are off-screen', async ({ page }) => {
      await openWithLocale(page, locale, '/tasks');

      const intruders = await page.evaluate(() => {
        const W = window.innerWidth;
        const out: string[] = [];
        // Slide-in panels only. `[inert]` is NOT the net to cast here: while a
        // modal is up the whole page behind it is inert, and that div legitimately
        // fills the column.
        for (const el of document.querySelectorAll<HTMLElement>('aside')) {
          const style = getComputedStyle(el);
          if (style.position !== 'fixed') continue;
          if (style.display === 'none' || style.visibility === 'hidden') continue;
          const box = el.getBoundingClientRect();
          if (box.width < 40 || box.height < 40) continue;
          // Overlapping the column at all is the failure — a shut panel that
          // pokes in by a single pixel is one that did not travel far enough.
          const overlap = Math.min(box.right, W) - Math.max(box.left, 0);
          if (overlap > 0)
            out.push(
              `${el.tagName.toLowerCase()} covers ${Math.round(overlap)}px of the ${W}px column (${Math.round(box.left)}…${Math.round(box.right)})`
            );
        }
        return out;
      });

      expect(intruders, `a closed panel is sitting on the page in ${locale}`).toEqual([]);
    });

    /**
     * The raised tab-bar disc marks which tab is open. It is placed from a
     * percentage counted in tab ORDER, so it has to be offset from the edge the
     * row starts at; as a physical `left` it landed on the mirror-image column
     * and lit up Tickets while Tasks was open.
     */
    test('the tab-bar disc stands on the tab that is actually open', async ({ page }) => {
      await openWithLocale(page, locale, '/tasks');

      const gap = await page.evaluate(() => {
        const disc = document.querySelector<HTMLElement>('[data-testid="tab-active-disc"]');
        const active = document.querySelector<HTMLElement>('[aria-current="page"]');
        if (!disc || !active) return null;
        const d = disc.getBoundingClientRect();
        const a = active.getBoundingClientRect();
        return Math.round(Math.abs((d.left + d.right) / 2 - (a.left + a.right) / 2));
      });

      test.skip(gap === null, 'no disc or no active tab exposed on this screen');
      expect(gap, `the disc is not over the open tab in ${locale}`).toBeLessThan(24);
    });
  });
}
