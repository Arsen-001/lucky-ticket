import { expect, test, type Page } from '@playwright/test';
import { appDialogs } from './helpers';

/**
 * Тикки: денег не хватает — список покупки говорит об этом словами.
 *
 * До 05.09.2026 строка тира при нехватке была `disabled`: пять тусклых строк
 * и мёртвый тап. На проде это прочли как «покупка не работает»: за шесть
 * часов сервер не увидел ни одного `POST /tikki/buy`, потому что нажать было
 * некуда (счёт 238 979 против цены 418 700). Теперь строка живая всегда,
 * пишет «не хватает N», а тап открывает «Недостаточно LC» с выходом в
 * турниры — ту же модалку, что и в маркете. Мок стартует с 1 600 000, три
 * бронзы по 418 700 оставляют 343 900 — меньше цены четвёртой.
 */

const SLOW = 60_000;

async function quietDialogs(page: Page) {
  for (let i = 0; i < 6 && (await appDialogs(page).count()) > 0; i += 1) {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  }
}

const balance = (page: Page) => page.getByTestId('tikki-balance');
const buyList = (page: Page) =>
  appDialogs(page)
    .filter({ hasText: /buy a tikki/i })
    .first();
const bronzeRow = (page: Page) =>
  buyList(page)
    .locator('button')
    .filter({ has: page.locator('img') })
    .first();

async function openList(page: Page) {
  // Синтетический клик: мышь Playwright упирается в очередь попапов мока.
  await page
    .locator('button', { has: page.locator('svg.lucide-plus') })
    .first()
    .dispatchEvent('click');
  await expect(buyList(page)).toBeVisible();
}

test('нет денег: строка тира живая, пишет недостачу, тап открывает «Недостаточно LC»', async ({
  page,
}) => {
  test.setTimeout(SLOW);
  await page.goto('/');
  await expect(balance(page)).toBeVisible({ timeout: 30_000 });
  await page.waitForTimeout(1200);
  await quietDialogs(page);

  for (let i = 0; i < 3; i += 1) {
    await openList(page);
    await bronzeRow(page).dispatchEvent('click');
    await expect(buyList(page)).toBeHidden();
  }
  await expect(balance(page)).toContainText('343,900');

  await openList(page);
  const row = bronzeRow(page);
  await expect(row).toBeEnabled();
  await expect(row).toContainText('Short by 74,800');

  await row.dispatchEvent('click');
  const modal = appDialogs(page)
    .filter({ hasText: /not enough lc/i })
    .first();
  await expect(modal).toBeVisible();
  await expect(modal.getByText(/343,900/)).toBeVisible();
  await expect(modal.getByText(/win lc/i)).toBeVisible();
  await expect(buyList(page)).toBeHidden();
  // Списания не было: сервер о тапе так и не узнал.
  await expect(balance(page)).toContainText('343,900');
});
