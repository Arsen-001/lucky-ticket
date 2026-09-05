import { expect, test } from '@playwright/test';
import { appDialogs } from './helpers';

/**
 * Тикки: с одним персонажем сцена показывает цель, а не пустоту.
 *
 * До 06.09.2026 над героем было пустое небо на треть экрана, а лента — одна
 * карточка и две кнопки через дыру. Теперь под счётом стоит карточка цели
 * «1 из 4», в ленте — три призрачных места, над головой — реплика. Тест
 * проверяет, что все трое читают одну запись и что призрак ведёт в покупку.
 */

const SLOW = 45_000;

test('один Тикки: карточка цели, три призрака, реплика, призрак открывает покупку', async ({
  page,
}) => {
  await page.goto('/tikki', { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('tikki-balance')).toBeVisible({ timeout: SLOW });

  for (let i = 0; i < 5 && (await appDialogs(page).count()) > 0; i += 1) {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  }
  await expect(appDialogs(page)).toHaveCount(0, { timeout: SLOW });

  const goal = page.getByTestId('tikki-goal');
  await expect(goal).toBeVisible();
  await expect(goal).toContainText(/1 of 4/i);
  await expect(goal).toContainText(/silver/i);

  await expect(page.getByTestId('tikki-ghost')).toHaveCount(3);

  // На моке кликер выдаётся полным — реплика просит забрать.
  await expect(page.getByTestId('tikki-hero')).toContainText(/tap me/i);

  // Сцена пересчитывается раз в секунду, узел переезжает под проверкой
  // стабильности — отсюда `force`, кнопка видима и включена и без того.
  await page.getByTestId('tikki-ghost').first().click({ force: true });
  await expect(page.getByRole('dialog')).toContainText(/buy a tikki/i, { timeout: SLOW });
});
