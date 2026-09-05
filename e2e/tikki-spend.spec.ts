import { expect, test } from '@playwright/test';
import { appDialogs } from './helpers';

/**
 * Тикки: покупка ступени списывает ровно свою цену.
 *
 * До 05.09.2026 браузер по этой механике проверял ровно одно — что `/tikki`
 * открывается. Формулы закрыты юнитами с обеих сторон, мок — своим прогоном,
 * но между ними лежит вся середина: попадает ли нажатие в чип, открывается ли
 * окно с ценой, уходит ли мутация, доезжает ли новый баланс до строки счёта.
 * Любое звено ломается молча: экран остаётся красивым, а цифра стоит.
 *
 * 🪤 Проверяется ПОКУПКА, а не тап, и это не лень. Кликер наполняется временем,
 * на свежем моке в нём ноль, и нажатие честно уносит ничего — тест «тапнул и
 * не изменилось» проходил бы всегда. Перевод часов Playwright'ом не помогает:
 * мок считает наполнение на запросе, а запроса после перевода не случается.
 * Покупка же двигает баланс сразу и ровно на известную величину.
 *
 * 🪤 Очередь попапов гасится ПЕРВЫМ делом. На моке всегда висит приглашение на
 * дуэль, а `aria-modal` вынимает остальную страницу из дерева доступности —
 * `getByRole` перестаёт видеть даже те кнопки, которые прекрасно нарисованы.
 * Первый прогон этого теста упал именно так, и выглядело это как «чипа
 * прокачки нет».
 */

const SLOW = 45_000;

/** «1 600 000» → 1600000: пробелы здесь неразрывные, обычным trim их не взять. */
const toNumber = (text: string) => Number(text.replace(/[^\d]/g, ''));

test('ступень кликера списывает свою цену', async ({ page }) => {
  await page.goto('/tikki', { waitUntil: 'domcontentloaded' });

  const balance = page.getByTestId('tikki-balance');
  await expect(balance).toBeVisible({ timeout: SLOW });

  for (let i = 0; i < 5 && (await appDialogs(page).count()) > 0; i += 1) {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  }
  await expect(appDialogs(page)).toHaveCount(0, { timeout: SLOW });
  const before = toNumber(await balance.innerText());
  expect(before, 'на моке у игрока есть деньги').toBeGreaterThan(0);

  await page.getByRole('button', { name: /clicker level/i }).click();

  // Окно называет цену — с неё и сверяется списание. Своей арифметики у теста
  // нет нарочно: он проверяет, что экран и списание говорят одно и то же.
  const confirm = page.getByRole('button', { name: /^buy · [\d,\s]+$/i });
  await expect(confirm).toBeVisible({ timeout: SLOW });
  const price = toNumber(await confirm.innerText());
  expect(price, 'цена ступени на экране').toBeGreaterThan(0);

  // `force` — из-за самой сцены: она пересчитывает кликер раз в секунду, узел
  // кнопки переезжает под проверкой стабильности, и обычный клик крутится до
  // таймаута. Кнопка при этом видима и включена, что и проверено выше.
  await confirm.click({ force: true });

  await expect
    .poll(async () => toNumber(await balance.innerText()), {
      timeout: SLOW,
      message: 'счёт после покупки ступени',
    })
    .toBe(before - price);
});
