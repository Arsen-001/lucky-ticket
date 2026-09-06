import { expect, test } from '@playwright/test';
import { dismissAutoDialogs } from './helpers';

/**
 * Ни на одном экране под пальцем не должно оказаться `<img>`.
 *
 * Меню «Скачать · Открыть в браузере» рисует сам клиент Telegram на Android:
 * он вешает длинный тап на WebView и спрашивает движок, что под пальцем. В
 * страницу событие не приходит, поэтому ни `-webkit-touch-callout`, ни отмена
 * `contextmenu` в `ContentProtectionProvider` до него не достают. Достаёт
 * только одно: чтобы верхним узлом была не картинка — глобальное
 * `img { pointer-events: none }` плюс накладка `LongPressShield` на крупном
 * артворте.
 *
 * `elementFromPoint` — тот же вопрос, который движок задаёт себе сам, поэтому
 * тест меряет ровно то, на чём держится починка. Живого замера в Telegram на
 * Android он не заменяет.
 *
 * Экраны не все: взяты самые богатые на артворт (замер 06.09.2026 — на них
 * было 150 из 220 открытых картинок). Полный обход стоил бы ещё пяти минут
 * CI и ловил бы то же самое: правило глобальное, а не на экран.
 */

const ROUTES = [
  '/',
  '/market',
  '/tickets',
  '/leaderboard',
  '/profile',
  '/profile/achievements',
  '/inventory',
  '/games',
  '/games/duel',
  '/languages',
  '/tikki',
];

test('под пальцем нигде не лежит картинка', async ({ page }) => {
  test.setTimeout(240_000);
  const offenders: string[] = [];

  for (const route of ROUTES) {
    await page.goto(route, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1_000);
    await dismissAutoDialogs(page).catch(() => {});

    const bad = await page.evaluate(() => {
      const found: string[] = [];
      for (const img of document.querySelectorAll('img')) {
        const rect = img.getBoundingClientRect();
        // Мельче 10 px пальцем не поймать, а за краем окна `elementFromPoint`
        // отвечает null всегда — такие точки ничего не говорят.
        if (rect.width < 10 || rect.height < 10) continue;
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        if (x < 0 || y < 0 || x >= window.innerWidth || y >= window.innerHeight) continue;

        const hit = document.elementFromPoint(x, y);
        if (hit?.tagName === 'IMG') {
          const src = (hit as HTMLImageElement).currentSrc || (hit as HTMLImageElement).src;
          found.push(`${Math.round(rect.width)}×${Math.round(rect.height)} ${src.slice(-40)}`);
        }
      }
      return found;
    });

    offenders.push(...bad.map(item => `${route}: ${item}`));
  }

  expect(offenders, 'картинка верхним узлом — клиент предложит её скачать').toEqual([]);
});
