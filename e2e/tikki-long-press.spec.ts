import { expect, test } from '@playwright/test';
import { appDialogs } from './helpers';

/**
 * Долгое нажатие на Тикки не должно предлагать «Скачать · Открыть в браузере».
 *
 * Меню рисует сам клиент Telegram на Android: он вешает длинный тап на WebView
 * и спрашивает движок, что лежит под пальцем. В страницу событие не приходит,
 * поэтому `ContentProtectionProvider` его не отменяет — единственная защита в
 * том, чтобы верхним узлом под пальцем была НЕ картинка (`LongPressShield`).
 *
 * Живого замера в Telegram на Android нет, и этот тест его не заменяет: он
 * стережёт ровно то, на чём держится починка, — что над артвортом лежит
 * накладка, что она не съела нажатие и что DOM-слой защиты цел.
 */

const SLOW = 45_000;

test.describe('Тикки: долгое нажатие не находит картинку', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tikki', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('tikki-hero')).toBeVisible({ timeout: SLOW });
    for (let i = 0; i < 5 && (await appDialogs(page).count()) > 0; i += 1) {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    }
    await expect(appDialogs(page)).toHaveCount(0, { timeout: SLOW });
  });

  test('над персонажем лежит накладка, а не <img>', async ({ page }) => {
    const box = (await page.getByTestId('tikki-hero').boundingBox())!;

    // Не только центр: у персонажа поля прозрачные, и накладка обязана
    // накрывать всю кнопку, иначе палец найдёт картинку с краю.
    const hits = await page.evaluate(
      ([x, y, w, h]) =>
        [0.3, 0.5, 0.7].flatMap(fx =>
          [0.3, 0.5, 0.7].map(fy => {
            const el = document.elementFromPoint(x + w * fx, y + h * fy);
            return `${el?.tagName ?? 'null'}:${(el as HTMLElement)?.dataset?.testid ?? ''}`;
          })
        ),
      [box.x, box.y, box.width, box.height]
    );

    expect(
      hits.filter(hit => hit.startsWith('IMG')),
      'картинка под пальцем'
    ).toEqual([]);
    expect(new Set(hits)).toEqual(new Set(['SPAN:long-press-shield']));
  });

  test('накладка не съела нажатие: тап по ней даёт цифру', async ({ page }) => {
    const shield = page.getByTestId('tikki-hero').getByTestId('long-press-shield');

    await shield.dispatchEvent('pointerdown', {
      button: 0,
      pointerId: 1,
      isPrimary: true,
      clientX: 195,
      clientY: 400,
    });

    await expect(page.locator('.animate-tikki-pop').first(), 'цифра над Тикки').toBeVisible({
      timeout: 4_000,
    });
  });

  test('меню браузера тоже закрыто: contextmenu отменяется', async ({ page }) => {
    const prevented = await page.getByTestId('tikki-hero').evaluate(el => {
      const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
      el.dispatchEvent(event);
      return event.defaultPrevented;
    });

    expect(prevented, 'ContentProtectionProvider на месте').toBe(true);
  });

  test('мелкий артворт сцены накрыт так же', async ({ page }) => {
    for (const testId of ['tikki-goal', 'tikki-ghost']) {
      const node = page.getByTestId(testId).first();
      if (!(await node.count())) continue;

      const box = (await node.boundingBox())!;
      const hit = await page.evaluate(
        ([x, y]) => {
          const el = document.elementFromPoint(x, y);
          return `${el?.tagName ?? 'null'}:${(el as HTMLElement)?.dataset?.testid ?? ''}`;
        },
        [box.x + box.width / 2, box.y + box.height / 2]
      );

      expect(hit, `${testId} под пальцем`).toBe('SPAN:long-press-shield');
    }
  });
});
