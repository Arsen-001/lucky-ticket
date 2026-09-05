import { expect, test, type Locator, type Page } from '@playwright/test';
import { appDialogs } from './helpers';

/**
 * Главная: нижний ряд пилюль стоит на таб-баре на ОБОИХ экранах, и вход в
 * игры на втором экране один.
 *
 * До 05.09.2026 пилюля «Тикки» на экране движков висела на 85 px выше
 * таб-бара: она была `fixed` внутри контейнера, которому входная анимация
 * оставляет `transform`, и отсчитывала низ от него, а не от окна. На глаз это
 * читалось как «кнопка в воздухе», в коде стояло «5 px над таб-баром», и ни
 * один тест не сравнивал одно с другим. Этот сравнивает: кромка, которую
 * раскладка отдаёт таб-бару, — низ `main` без его нижнего поля — и низ ряда
 * обязаны совпасть на обоих экранах и не разойтись после прокрутки до конца.
 */

const SLOW = 45_000;

/** Кромка таб-бара глазами раскладки: низ `main` минус поле, отданное бару. */
const barEdge = (page: Page) =>
  page.evaluate(() => {
    const main = document.querySelector('main');
    if (!main) return NaN;
    const { bottom } = main.getBoundingClientRect();
    return Math.round(bottom - parseFloat(getComputedStyle(main).paddingBottom));
  });

const bottomOf = (target: Locator) =>
  target.evaluate(el => Math.round(el.getBoundingClientRect().bottom));

async function quietDialogs(page: Page) {
  for (let i = 0; i < 6 && (await appDialogs(page).count()) > 0; i += 1) {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  }
}

test('ряд пилюль стоит на таб-баре у Тикки и у движков, вход в игры на движках один', async ({
  page,
}) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('tikki-balance')).toBeVisible({ timeout: SLOW });
  await quietDialogs(page);

  const edge = await barEdge(page);
  expect(edge).toBeGreaterThan(0);

  const tikkiRow = page.getByTestId('home-pill-row');
  await expect(tikkiRow).toBeVisible();
  await expect(tikkiRow.getByRole('link', { name: /games/i })).toBeVisible();
  expect(Math.abs((await bottomOf(tikkiRow)) - edge)).toBeLessThanOrEqual(1);

  // Событием, а не курсором: очередь попапов мока может ещё висеть поверх, а
  // сцена Тикки перерисовывается раз в секунду и уводит узел из-под клика.
  await tikkiRow.getByRole('button', { name: /engines/i }).dispatchEvent('click');
  const back = page.getByRole('button', { name: /^tikki$/i });
  await expect(back).toBeVisible({ timeout: SLOW });

  const enginesRow = page.getByTestId('home-pill-row');
  await expect(enginesRow.getByRole('link', { name: /games/i })).toBeVisible();
  expect(Math.abs((await bottomOf(enginesRow)) - edge)).toBeLessThanOrEqual(1);

  // Один вход в игры на весь экран — пилюля; плашки в верхнем ряду больше нет.
  await expect(page.locator('main a[href*="/games"]')).toHaveCount(1);

  // Экран длинный: у самого конца ряд обязан стоять там же, где стоял.
  await page.evaluate(() => {
    const box = document.querySelector('main [class*="overflow-auto"]');
    box?.scrollTo(0, box.scrollHeight);
  });
  await page.waitForTimeout(400);
  expect(Math.abs((await bottomOf(enginesRow)) - edge)).toBeLessThanOrEqual(1);
});
