import { test, expect, type Page } from '@playwright/test';
import { STATIC_ROUTES } from './routes';
import { appDialogs } from './helpers';

/**
 * Two things that are invisible in review and invisible on screen, so they only
 * stay fixed if a machine keeps checking them:
 *
 * 1. **Every control says what it is.** An icon-only button with no
 *    `aria-label` is announced as "button" and nothing else. This is the same
 *    class of defect as the 39 unnamed dialogs (`tests/modal-label.test.ts`) —
 *    that one is a source sweep, this one catches what only exists at runtime
 *    (a name coming from data, an icon rendered by a shared component).
 *
 * 2. **`tap-target` still reaches 44px.** The utility is an absolutely
 *    positioned `::after`, and it dies silently in two ways: an ancestor that
 *    clips with `overflow: hidden`, or a layer painted over it (that is exactly
 *    how the profile banner collage was eating the preview/share buttons). Both
 *    leave the markup looking correct.
 */

/**
 * A fresh mock account greets several screens with an auto-surfaced dialog
 * (tournament result, reward claim). Its backdrop owns every point on the
 * screen, so any hit test taken through it measures the backdrop instead.
 *
 * They arrive as a QUEUE, not one at a time — `/tasks` opens four in a row:
 * tournament win, place result, "better luck next time", daily gift. Between
 * two of them there is a gap where none is on screen, and the first version of
 * this returned on that gap: the remaining dialogs then opened AFTER dismissal
 * finished and every measurement went through their backdrop. `/tasks` failed
 * deterministically once anything on it wore `tap-target`, which is how the gap
 * was found (13.08.2026) — before that, nothing measured there, so a screen the
 * suite could not see at all was passing.
 *
 * So an empty screen is not the end condition: two consecutive empty looks are.
 */
async function dismissAutoDialogs(page: Page) {
  // Polled in short steps rather than slept in long ones: the queue is four
  // deep, and a fixed 600ms per look cost the suite ~35% of its runtime waiting
  // on nothing. A dialog either appears within the settle window or there is
  // none coming.
  const SETTLE_MS = 900;
  const STEP_MS = 100;

  const nextDialog = async () => {
    for (let waited = 0; waited < SETTLE_MS; waited += STEP_MS) {
      const dialog = appDialogs(page).first();
      if (await dialog.isVisible().catch(() => false)) return dialog;
      await page.waitForTimeout(STEP_MS);
    }
    return null;
  };

  for (let i = 0; i < 8; i++) {
    const dialog = await nextDialog();
    if (!dialog) return;
    const buttons = dialog.locator('button');
    const count = await buttons.count();
    if (count === 0) {
      await page.keyboard.press('Escape');
    } else {
      await buttons
        .nth(count - 1)
        .click({ timeout: 5000 })
        .catch(() => {});
    }
    // Let the dismissal animation finish before looking for the next one.
    await page.waitForTimeout(250);
  }
}

async function openScreen(page: Page, route: string) {
  await page.goto(route, { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('app-shell')).toBeAttached({ timeout: 20_000 });
  await page.waitForTimeout(1500);
  await dismissAutoDialogs(page);
}

for (const route of STATIC_ROUTES) {
  test(`every control on ${route} says what it is`, async ({ page }) => {
    await openScreen(page, route);

    const unnamed = await page.evaluate(() => {
      const nodes = document.querySelectorAll('button, a[href], [role="button"]');
      return [...nodes]
        .filter(el => {
          const style = getComputedStyle(el);
          if (style.display === 'none' || style.visibility === 'hidden') return false;
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) return false;
          const named =
            (el.textContent ?? '').trim() ||
            el.getAttribute('aria-label') ||
            el.getAttribute('title') ||
            el.getAttribute('aria-labelledby');
          return !named;
        })
        .map(el => {
          const icon = el.querySelector('svg')?.getAttribute('class') ?? '';
          return `<${el.tagName.toLowerCase()} class="${String(el.className).slice(0, 60)}"> icon="${icon}"`;
        });
    });

    expect(unnamed, `controls with no accessible name on ${route}`).toEqual([]);
  });

  test(`tap-target controls on ${route} own their 44px zone`, async ({ page }) => {
    await openScreen(page, route);

    const short = await page.evaluate(async () => {
      // 44/2 minus a pixel, so every sample sits inside the required square.
      const REACH = 21;
      const owns = (el: Element, hit: Element | null) =>
        // An ancestor swallowing the point is NOT the control owning it.
        !!hit && (hit === el || el.contains(hit));

      const results: Array<{ who: string; missed: number }> = [];

      for (const el of document.querySelectorAll('.tap-target')) {
        /**
         * Measured where the control is USABLE, not where it happens to sit.
         *
         * Taking the reading at the current scroll position asks the wrong
         * question: a card resting under the fixed tab bar, or clipped by the
         * bottom edge of its own scroller, owns none of its points — and that is
         * the bar and the scroller doing their job, not a broken hit zone. One
         * flick of the thumb and the same control is fully tappable.
         *
         * Scrolling it to the middle first removes both, and needs no special
         * cases: nothing fixed lives in the middle of the screen. Two earlier
         * attempts to filter those cases out by geometry were worse than the
         * disease — one of them dropped EVERY control on every screen (the shell
         * wraps the app in a full-screen fixed layer) and still reported 80
         * green while measuring nothing.
         *
         * `inline: 'center'` for the same reason on the other axis, and it is
         * not decoration: the default `nearest` parks a control that lives in a
         * horizontally scrolling rail flush against the screen edge, where the
         * sample at cx+21 falls outside the viewport and `elementFromPoint`
         * answers null — a lost point that says nothing about the hit zone.
         * Measured 13.08.2026: with `nearest`, engine dots 9 through 21 each
         * reported one point lost while owning their full 44×44.
         */
        el.scrollIntoView({ block: 'center', inline: 'center', behavior: 'instant' });
        await new Promise(resolve => setTimeout(resolve, 40));

        const rect = el.getBoundingClientRect();
        if (!(rect.width > 0 && rect.top >= 0 && rect.bottom <= window.innerHeight)) continue;
        // Same guard horizontally: a rail wider than the screen can leave its
        // first and last control half off the edge even after centring.
        if (!(rect.left >= 0 && rect.right <= window.innerWidth)) continue;
        // A control on a 3D face turned away from the viewer still reports a
        // box — a sliver. The home cube keeps its chip and booster slots on
        // its bottom face, so each "Unequip" paints its 20×20 as 18×2 and
        // loses all five sample points to the faces in front of it. Nothing
        // there is touchable until the player rotates the cube, so that
        // reading is about the cube, not about hit zones. Half the CSS box
        // separates the cases with room to spare: the cube draws its facing
        // side at 0.81 scale and an edge-on side at ~0.1.
        if (!(rect.height >= el.clientHeight / 2 && rect.width >= el.clientWidth / 2)) continue;

        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const points: Array<[number, number]> = [
          [cx, cy],
          [cx - REACH, cy],
          [cx + REACH, cy],
          [cx, cy - REACH],
          [cx, cy + REACH],
        ];
        const missed = points.filter(([x, y]) => !owns(el, document.elementFromPoint(x, y)));
        results.push({
          who: el.getAttribute('aria-label') ?? (el.textContent ?? '').trim().slice(0, 20),
          missed: missed.length,
        });
      }

      return results
        .filter(result => result.missed > 0)
        .map(result => `${result.who} (${result.missed} of 5 sample points lost)`);
    });

    expect(short, `tap-target hit zones swallowed on ${route}`).toEqual([]);
  });
}
