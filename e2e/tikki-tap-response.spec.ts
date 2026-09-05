import { expect, test } from '@playwright/test';
import { appDialogs } from './helpers';

/**
 * Тикки: отклик на КАЖДОЕ нажатие серии, и под пальцем он «расходится».
 *
 * До 06.09.2026 серия из восьми тапов давала одно приседание: класс анимации
 * ставился первым тапом и не менялся, а CSS перезапускает анимацию только от
 * смены класса — 860 мс персонаж стоял неподвижно, пока по нему стучали
 * (замер в Chromium и WebKit). Теперь приседание перезапускается сбросом
 * анимации на каждом нажатии, а на время серии Тикки поднимает обе руки и
 * качается, как набитый доверху кликер, — ещё круг после последнего тапа.
 *
 * 🪤 События шлются прямо в узел, а не мышью Playwright'а: герой приседает
 * на каждое нажатие, и клик мышью в анимацию терял три касания из двенадцати
 * (см. `tikki-tap.spec.ts`). Герой слушает `pointerdown` — его и достаточно.
 *
 * 🪤 Первый бронзовый на моке выдаётся с полным кликером, поэтому «руки вверх»
 * до серии ничего не доказывает; проверяется, что после серии и круга
 * покачивания он успокоился — к тому моменту кликер уже не полный.
 */

const SLOW = 45_000;
const TAPS = 8;
const TAP_GAP_MS = 120;

declare global {
  interface Window {
    __squashStarts?: number;
    __bubbleStarts?: number;
  }
}

test('серия тапов: приседание на каждом, обе руки и покачивание, пока стучат', async ({ page }) => {
  await page.goto('/tikki', { waitUntil: 'domcontentloaded' });

  const hero = page.getByTestId('tikki-hero');
  await expect(hero).toBeVisible({ timeout: SLOW });
  for (let i = 0; i < 5 && (await appDialogs(page).count()) > 0; i += 1) {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  }
  await expect(appDialogs(page)).toHaveCount(0, { timeout: SLOW });

  const body = page.getByTestId('tikki-hero-body');
  const img = hero.locator('img').first();

  // Считаем запуски приседания самим браузером: `animationstart` с именем
  // `tikki-squash`. Смена класса даёт один запуск на серию; сброс — по одному
  // на каждое нажатие.
  await img.evaluate(el => {
    window.__squashStarts = 0;
    el.addEventListener('animationstart', event => {
      if ((event as AnimationEvent).animationName === 'tikki-squash') {
        window.__squashStarts = (window.__squashStarts ?? 0) + 1;
      }
    });
  });
  // Облако реплики за серию не должно проигрывать появление ни разу. До
  // 06.09.2026 контейнерный запрос прятал его через `display: none`, и в
  // Chromium это перезапускало `fade-in` на каждом перерисовывании — облако
  // моргало раз в секунду в покое и было невидимо всю серию тапов.
  const bubble = hero.locator('.tikki-speech');
  await expect(bubble, 'реплика над головой есть').toHaveCount(1);
  await bubble.evaluate(el => {
    window.__bubbleStarts = 0;
    el.addEventListener('animationstart', () => {
      window.__bubbleStarts = (window.__bubbleStarts ?? 0) + 1;
    });
  });

  for (let i = 0; i < TAPS; i += 1) {
    await hero.dispatchEvent('pointerdown', {
      button: 0,
      pointerId: 1,
      isPrimary: true,
      clientX: 195,
      clientY: 400,
    });
    await page.waitForTimeout(TAP_GAP_MS);
  }

  // Посреди серии: обе руки вверх и покачивание полного кликера.
  await expect(body, 'покачивание во время серии').toHaveClass(/animate-tikki-ready/);
  await expect(img, 'кадр с обеими руками во время серии').toHaveAttribute('src', /-jump\./);
  // Не ровно TAPS: на медленном раннере два тапа ложатся в один кадр, и у
  // отменённого до кадра перезапуска `animationstart` не бывает — CI насчитал
  // 5 из 8 (06.09.2026). Регрессия, от которой страж, даёт РОВНО одно
  // приседание на любую серию, поэтому граница — «больше одного».
  expect(await page.evaluate(() => window.__squashStarts), 'приседаний за серию').toBeGreaterThan(
    1
  );
  expect(await page.evaluate(() => window.__bubbleStarts), 'перезапусков облака за серию').toBe(0);
  await expect(bubble, 'облако не погасло под пальцем').toHaveCSS('opacity', '1');

  // Круг покачивания после последнего нажатия — и Тикки снова спокоен.
  await expect(body, 'успокоился после серии').not.toHaveClass(/animate-tikki-ready/, {
    timeout: 4_000,
  });
  await expect(img, 'кадр покоя после серии').toHaveAttribute('src', /-idle\./);
});
