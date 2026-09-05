import { expect, test, type Page } from '@playwright/test';

/**
 * Экран Тикки помещается в прокрутку на коротких телефонах, а на длинных
 * персонаж стоит в свой макетный рост.
 *
 * До 05.09.2026 сцена держала пол в рост персонажа (356 px), и на 360×740
 * экран был длиннее прокрутки на 39 px: лента коллекции и пилюли уходили под
 * сгиб, а палец их не видел. Теперь сцена берёт остаток экрана, персонаж —
 * не выше сцены (контейнерные единицы), пол 216 = 360×640. Обе стороны
 * проверяются: короткий экран — без прокрутки, длинный — без ужатия.
 */

const SLOW = 45_000;

async function openTikki(page: Page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('tikki-balance')).toBeVisible({ timeout: SLOW });
  // Сцена и картинка встают за один кадр, но опрос мока ещё может подвинуть
  // ряд счёта — даём раскладке дойти до покоя.
  await page.waitForTimeout(1200);
}

const fit = (page: Page) =>
  page.evaluate(() => {
    const box = document.querySelector('main [class*="overflow-auto"]');
    const main = document.querySelector('main');
    const stage = document.querySelector('.tikki-stage');
    const img = document.querySelector('[data-testid="tikki-hero"] img');
    const row = document.querySelector('[data-testid="home-pill-row"]');
    if (!box || !main || !stage || !img || !row) return null;
    const edge = Math.round(
      main.getBoundingClientRect().bottom - parseFloat(getComputedStyle(main).paddingBottom)
    );
    return {
      overflow: box.scrollHeight - box.clientHeight,
      stage: Math.round(stage.getBoundingClientRect().height),
      image: Math.round(img.getBoundingClientRect().height),
      rowGap: Math.round(row.getBoundingClientRect().bottom) - edge,
    };
  });

for (const [width, height] of [
  [360, 740],
  [375, 667],
  [360, 640],
] as const) {
  test.describe(`${width}×${height}`, () => {
    test.use({ viewport: { width, height }, isMobile: true, hasTouch: true });

    test('экран Тикки без прокрутки, ряд на таб-баре, персонаж не выше сцены', async ({ page }) => {
      await openTikki(page);
      const m = await fit(page);
      expect(m).not.toBeNull();
      expect(m!.overflow).toBe(0);
      expect(Math.abs(m!.rowGap)).toBeLessThanOrEqual(1);
      expect(m!.stage).toBeGreaterThanOrEqual(216);
      expect(m!.image).toBeLessThanOrEqual(m!.stage);
    });
  });
}

test.describe('390×844', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test('где место есть, персонаж стоит в макетный рост 356', async ({ page }) => {
    await openTikki(page);
    const m = await fit(page);
    expect(m).not.toBeNull();
    expect(m!.overflow).toBe(0);
    expect(m!.image).toBe(356);
    expect(m!.stage).toBeGreaterThan(356);
  });
});
