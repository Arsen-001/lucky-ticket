import { expect, test, type Page } from '@playwright/test';
import { appDialogs } from './helpers';

/**
 * Тур первого запуска: он обязан ПОДСВЕЧИВАТЬ цель на каждом шаге.
 *
 * Когда цели нет, тур не падает — он рисует карточку по центру и идёт дальше,
 * а на шаге с `realAction` (забрать первый билет, войти в первый турнир)
 * молча не нажимает ничего: в движке стоит `if (step.realAction && targetEl)`.
 * Ровно это и случилось, когда главную занял Тикки: куб с кнопкой «Забрать»
 * уехал на второй экран, тур остался ждать его на первом, и два шага из десяти
 * перестали показывать хоть что-то. Ни один тест этого не заметил — тура не
 * касался ни один из них.
 *
 * Поэтому проверка тут не «тур открылся», а «ни один шаг не ушёл в запасной
 * вид»: подсветка есть — значит якорь найден, значит настоящее нажатие
 * произойдёт. Плюс последний шаг: он входит в турнир, и после него обязано
 * открыться окно ставки — это доказательство, что `realAction` сработал.
 */

const SLOW = 45_000;

/** Очередь окон мока (ежедневный подарок и прочее) закрывается Escape. */
async function quietDialogs(page: Page) {
  for (let i = 0; i < 6 && (await appDialogs(page).count()) > 0; i += 1) {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  }
}

test('тур подсвечивает цель на каждом шаге и доводит до входа в турнир', async ({ page }) => {
  // У мок-аккаунта `hasSeenTour: true`, поэтому тур запускается из настроек —
  // той же кнопкой, что и у живого игрока, который хочет пройти его заново.
  await page.goto('/settings', { waitUntil: 'domcontentloaded' });
  const start = page.getByText('Take the tour', { exact: true });
  await expect(start).toBeVisible({ timeout: SLOW });
  await quietDialogs(page);
  // Событием, а не курсором: ящик настроек въезжает анимацией, и мышь теряет
  // клик по движущемуся узлу.
  await start.dispatchEvent('click');

  const overlay = page.locator('[role="dialog"][aria-modal="true"]');
  const walked: string[] = [];
  const blind: string[] = [];

  for (let i = 0; i < 15; i += 1) {
    const title = overlay.locator('h3').first();
    await expect(title, `шаг ${i} не показал карточку`).toBeVisible({ timeout: SLOW });
    const label = (await title.innerText()).trim();
    walked.push(label);

    // Подсветка = прозрачная кнопка над найденным якорем. Нет её — шаг слепой.
    const spotlight = overlay.getByRole('button', { name: 'Next step' });
    if ((await spotlight.count()) === 0) blind.push(label);

    const finish = overlay.getByRole('button', { name: 'Finish' });
    const isLast = (await finish.count()) > 0;

    if (isLast) {
      // Escape тут звать нельзя — им тур выходит; окна мока просто переживём.
      // Окно ставки открывает только настоящее нажатие по «Присоединиться»,
      // поэтому его текст и есть доказательство, что `realAction` сработал.
      await spotlight.first().dispatchEvent('click');
      await expect(
        appDialogs(page).getByText('Chance to finish top 3').first(),
        'вход в турнир не открыл окно ставки — значит настоящее нажатие не дошло'
      ).toBeVisible({ timeout: SLOW });
      break;
    }

    if ((await spotlight.count()) > 0) await spotlight.first().dispatchEvent('click');
    else await overlay.getByRole('button', { name: 'Got it' }).dispatchEvent('click');
    await page.waitForTimeout(700);
  }

  expect(blind, `шаги без подсветки: ${blind.join(' · ')}`).toEqual([]);
  expect(walked.length, `пройдено шагов: ${walked.join(' → ')}`).toBeGreaterThanOrEqual(10);
});
