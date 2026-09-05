import { expect, test } from '@playwright/test';
import { appDialogs } from './helpers';

/**
 * Тикки: число под пальцем не откатывается назад, пока пачки нажатий летят.
 *
 * Нажатия уходят на сервер пачками раз в полсекунды, ответ идёт ещё столько
 * же, а игрок в это время продолжает тапать. До 06.09.2026 ответ на пачку
 * стирал с экрана ВСЕ неподтверждённые нажатия, а не только отправленные —
 * счёт падал на два-три назад на каждый ответ, то есть при быстром тапе
 * дёргался постоянно. Юнит-тест держит арифметику (`tikki-taps.test.ts`);
 * здесь — что сам экран, с настоящими таймерами и задержкой мока в 400–1200 мс,
 * ни разу не показывает меньше, чем показывал только что.
 *
 * 🪤 Тапы идут с паузой в 150 мс НАРОЧНО: дюжина кликов подряд без пауз
 * укладывается в одну пачку, и ответ приходит, когда нажимать уже нечего —
 * тест проходил бы и на старом коде. Растянутые на две секунды, они
 * заставляют ответы приходить ПОД нажатиями, где глюк и жил.
 *
 * 🪤 Первый бронзовый на моке выдаётся с полным кликером — иначе тапать
 * нечего, и тест «нажал и не изменилось» проходил бы всегда (см. сид мока).
 */

const SLOW = 45_000;
const TAPS = 12;
const TAP_GAP_MS = 150;

/** «1 600 000» → 1600000: пробелы здесь неразрывные, обычным trim их не взять. */
const toNumber = (text: string) => Number(text.replace(/[^\d]/g, ''));

test('счёт под пальцем никогда не показывает меньше, чем только что', async ({ page }) => {
  await page.goto('/tikki', { waitUntil: 'domcontentloaded' });

  const balance = page.getByTestId('tikki-balance');
  await expect(balance).toBeVisible({ timeout: SLOW });

  for (let i = 0; i < 5 && (await appDialogs(page).count()) > 0; i += 1) {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  }
  await expect(appDialogs(page)).toHaveCount(0, { timeout: SLOW });

  const hero = page.getByTestId('tikki-hero');
  await expect(hero).toBeVisible({ timeout: SLOW });
  const before = toNumber(await balance.innerText());

  // Счёт читается каждые 40 мс всё время, пока нажатия и ответы идут, —
  // откат назад живёт сотни миллисекунд, и «проверить в конце» его не увидит.
  const seen: number[] = [];
  const watching = (async () => {
    const until = Date.now() + TAPS * TAP_GAP_MS + 3_000;
    while (Date.now() < until) {
      seen.push(toNumber(await balance.innerText()));
      await page.waitForTimeout(40);
    }
  })();

  for (let i = 0; i < TAPS; i += 1) {
    // Событие шлётся прямо в узел, а не мышью Playwright'а: герой приседает
    // на каждое нажатие, и клик мышью в анимацию терял три касания из
    // двенадцати (замерено 06.09.2026 — 9 `pointerdown` на 12 кликов). Тест
    // здесь про арифметику экрана, а не про меткость курсора; герой слушает
    // именно `pointerdown`, поэтому этого события достаточно.
    await hero.dispatchEvent('pointerdown', {
      button: 0,
      pointerId: 1,
      isPrimary: true,
      clientX: 195,
      clientY: 400,
    });
    await page.waitForTimeout(TAP_GAP_MS);
  }
  await watching;

  for (let i = 1; i < seen.length; i += 1)
    expect(seen[i], `откат на отсчёте #${i}: ${seen.join(' → ')}`).toBeGreaterThanOrEqual(
      seen[i - 1]
    );

  // Бронза: сила нажатия 1, кликер полный (100) — дюжина нажатий это ровно +12.
  expect(seen.at(-1), 'итог после дюжины нажатий').toBe(before + TAPS);
});
