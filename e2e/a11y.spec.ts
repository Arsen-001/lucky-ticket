import { test, expect, type Page } from '@playwright/test';
import { STATIC_ROUTES } from './routes';
import { dismissAutoDialogs } from './helpers';

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
 * Что делать с модалками, которые не закрываются.
 *
 * Очередь в моке бесконечна по устройству: единственная кнопка окна подарков —
 * «Забрать», и она уводит на главную; онбординг мок не запоминает, поэтому
 * возврат на измеряемый экран поднимает всю очередь заново. Разбор честно
 * пробуется первым — он и проверяет, что кнопки закрытия работают, — но если
 * после бюджета что-то осталось, оставшееся ПРЯЧЕТСЯ.
 *
 * Это не заметание под ковёр: здесь меряются тап-зоны САМОГО ЭКРАНА, а
 * поведение оверлеев проверяют overlay-touch и modal-close-collision. Без
 * этого шага четыре вкладки из пяти отчитывались «все зоны проглочены» —
 * то есть тест мерил не экран, а подложку чужого окна.
 */
async function hideStuckDialogs(page: Page) {
  return page.evaluate(() => {
    const stuck: string[] = [];
    for (const dialog of document.querySelectorAll('[role="dialog"]')) {
      const shell = dialog.parentElement;
      if (!shell || getComputedStyle(dialog).display === 'none') continue;
      stuck.push((dialog.textContent ?? '').trim().slice(0, 40));
      shell.style.visibility = 'hidden';
      shell.style.pointerEvents = 'none';
    }
    return stuck;
  });
}

async function openScreen(page: Page, route: string) {
  await page.goto(route, { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('app-shell')).toBeAttached({ timeout: 20_000 });
  await page.waitForTimeout(1500);
  await dismissAutoDialogs(page);
  await hideStuckDialogs(page);
  // Страховка от закрытого на месте ящика: если разбор очереди всё же уронил
  // Escape на маршрут `(out-tabs)`, ящик стоит закрытым с `inert` на всём
  // содержимом, URL при этом не меняется — и любой замер ниже потерял бы все
  // точки у каждого контроля. Открываем экран заново, один раз.
  if (await page.evaluate(() => !!document.querySelector('[inert] .tap-target'))) {
    await page.goto(route, { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('app-shell')).toBeAttached({ timeout: 20_000 });
    await page.waitForTimeout(1500);
    await hideStuckDialogs(page);
  }
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
    // Вызов на дуэль в моке приезжает опросом — секундами позже прочих, уже
    // после разбора очереди. Ещё один взгляд прямо перед замером снимает эту
    // гонку.
    await hideStuckDialogs(page);

    const short = await page.evaluate(async () => {
      // 44/2 minus a pixel, so every sample sits inside the required square.
      const REACH = 21;
      const owns = (el: Element, hit: Element | null) =>
        // An ancestor swallowing the point is NOT the control owning it.
        !!hit && (hit === el || el.contains(hit));

      // Кто именно проглотил точку — без этого падение на CI нечитаемо: «5 из 5
      // потеряно» у каждого контроля экрана говорит о слое сверху или об
      // `inert` на предке, а не о зоне, и отличить их можно только по узлу,
      // который вернул `elementFromPoint`.
      const describe = (hit: Element | null) => {
        if (!hit) return 'nothing — the point is outside the viewport';
        const inert = hit.closest('[inert]') ? ' [inside inert]' : '';
        const id = hit.getAttribute('data-testid');
        return `<${hit.tagName.toLowerCase()}${id ? ` data-testid=${id}` : ''} class="${String(hit.className).slice(0, 60)}">${inert}`;
      };
      const results: Array<{ who: string; missed: number; by: string }> = [];

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
        const lost = points
          .map(([x, y]) => document.elementFromPoint(x, y))
          .filter(hit => !owns(el, hit));
        results.push({
          who: el.getAttribute('aria-label') ?? (el.textContent ?? '').trim().slice(0, 20),
          missed: lost.length,
          by: lost.length ? describe(lost[0]) : '',
        });
      }

      return results
        .filter(result => result.missed > 0)
        .map(result => `${result.who} (${result.missed} of 5 sample points lost to ${result.by})`);
    });

    expect(short, `tap-target hit zones swallowed on ${route}`).toEqual([]);
  });
}
