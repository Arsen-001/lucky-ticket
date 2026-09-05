import { expect, type Page } from '@playwright/test';

// A literal ICU placeholder leaking into rendered text, e.g. "{n}" / "{percent}".
const PLACEHOLDER_LEAK = /\{[a-zA-Z]+\}/;

/**
 * The app's own modals — never Next's dev overlay.
 *
 * `next dev` renders its error overlay as `role="dialog"` too, inside the shadow
 * root of `<nextjs-portal>`, and Playwright pierces shadow DOM by default. So on
 * any screen with a dev-time runtime error, a bare `[role="dialog"]` quietly
 * resolves to the overlay: `.last()` clicked a hidden overlay button instead of
 * the app's sheet, and an Escape-until-quiet loop never went quiet (both cost a
 * red CI run on 2026-08-10). `:light()` matches light DOM only, which leaves the
 * overlay out while every app modal — a plain React portal into body — stays.
 */
export const appDialogs = (page: Page) => page.locator(':light([role="dialog"])');

// React's SSR→client fallback is recoverable — the screen still renders fine for
// the user — so it isn't a crash for smoke purposes. Everything else counts.
const RECOVERABLE = ['Switched to client rendering because the server rendering errored'];

/**
 * Shared smoke assertion: a screen must load without an HTTP error, render real
 * (non-skeleton) text, throw no uncaught runtime error, and not leak an
 * un-interpolated i18n placeholder. Polls for visible text instead of sleeping
 * a fixed amount — image/skeleton-heavy screens can be slow to fill under load.
 */
export async function assertScreenRenders(page: Page, label: string, url: string) {
  const errors: string[] = [];
  page.on('pageerror', error => {
    if (!RECOVERABLE.some(msg => error.message.includes(msg))) errors.push(error.message);
  });

  const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
  expect(response?.status() ?? 0, `HTTP status for ${label}`).toBeLessThan(400);

  // Wait for the mock data (≤1200ms latency, slower under load) to render text.
  await expect
    .poll(async () => (await page.locator('body').innerText()).trim().length, {
      timeout: 15_000,
      message: `${label} never rendered visible text`,
    })
    .toBeGreaterThan(0);

  // Positive identity: this has to be the APP, not one of the four screens that
  // render in its place. `PreLaunchGate` swaps the whole tree for the countdown,
  // the maintenance wall, the boot splash or open-on-your-phone — every one of
  // which loads fine, renders plenty of text and leaks no placeholder, so the
  // checks above pass on all of them. A run with the gate up scored a clean
  // sweep against the same countdown on every route.
  await expect(
    page.getByTestId('app-shell'),
    `${label} did not render the app itself`
  ).toBeAttached({ timeout: 15_000 });

  // Let any late async error surface, then assert no crash + no placeholder leak.
  await page.waitForTimeout(300);
  expect(errors, `uncaught runtime errors on ${label}`).toEqual([]);

  const body = (await page.locator('body').innerText()).trim();
  expect(PLACEHOLDER_LEAK.test(body), `raw i18n placeholder leaked on ${label}`).toBe(false);
}

/**
 * Главная открывается на Тикки (в моке стадия `tikkiClicker` — «всем»), а куб
 * движков, лента турниров и джекпот с 03.09.2026 живут на ВТОРОМ экране, за
 * пилюлей «Движки». Тесты, которые меряют главную такой, какой она была, идут
 * через этот шаг: если пилюля на экране — нажать; если Тикки закрыт, движки
 * уже стоят первыми, и ждать нечего. До этого шага `layout-invariants` и
 * `home-ticket-seam` 90 секунд ждали куб на экране, где его нет.
 *
 * Клик синтетический: пилюля стоит на сцене Тикки, которая перерисовывается
 * раз в секунду, и проверка «stable» у мыши Playwright'а крутится до таймаута.
 */
export async function openEnginesScreen(page: Page) {
  const pill = page.getByTestId('home-pill-engines');
  await page
    .locator('[data-testid="home-pill-engines"], .engine-cube-scaled')
    .first()
    .waitFor({ timeout: 45_000 });
  // Стадия фичи приезжает вместе с профилем, и пока его нет, флаг читается как
  // «закрыто»: главная на миг рисует движки, а потом переключается на Тикки.
  // Первый же куб на экране — ещё не ответ; если в ближайшие секунды встанет
  // пилюля, Тикки открыт, и идти надо через неё. Без этой паузы куб находился,
  // пилюля не нажималась, а через секунду куб исчезал вместе с экраном —
  // половина замеров куба падала «cube missing» (06.09.2026).
  await pill.waitFor({ timeout: 5_000 }).catch(() => {
    /* Тикки закрыт — движки уже на экране */
  });
  if (await pill.count()) await pill.first().dispatchEvent('click');
  await page.locator('.engine-cube-scaled').first().waitFor({ timeout: 45_000 });
}

/**
 * Разбирает очередь окон, с которой мок встречает почти каждый экран: язык →
 * подарки → шаги тура → два итога турнира → вызов на дуэль → ежедневный подарок.
 *
 * Очередь асинхронная — следующее окно встаёт уже после того, как предыдущее
 * ушло, — поэтому пустой экран не конец: конец — два пустых взгляда подряд (на
 * CI — три: там между окнами проходит больше времени). Кнопку выбираем по
 * смыслу, а не по месту: у выбора языка закрывает ПОСЛЕДНЯЯ («Продолжить»), а
 * первые двадцать — сами языки; у итога турнира закрывает ПЕРВАЯ, а последняя
 * («Все результаты») уводит со страницы — так `market-modal-art` терял
 * маркет и 90 секунд ждал карточку на чужом экране. Если кнопка всё же увела,
 * возвращаемся туда, где мерили, но не больше двух раз: онбординг в моке не
 * запоминается, и возврат поднимает очередь заново.
 *
 * Здесь только разбор; что делать с окнами, которые не закрываются, решает
 * вызывающий (см. `hideStuckDialogs` в a11y).
 */
export async function dismissAutoDialogs(page: Page) {
  const onCi = !!process.env.CI;
  const SETTLE_MS = 900;
  const STEP_MS = 100;
  const EMPTY_LOOKS = onCi ? 3 : 2;
  const DEADLINE = Date.now() + (onCi ? 25_000 : 12_000);

  // Верхний диалог, а не первый: на главной их встаёт трое разом, и тот, что
  // лежит в DOM первым, рисуется под остальными — его «Не сейчас» не нажать.
  const nextDialog = async () => {
    for (let waited = 0; waited < SETTLE_MS; waited += STEP_MS) {
      const dialog = appDialogs(page).last();
      if (await dialog.isVisible().catch(() => false)) return dialog;
      await page.waitForTimeout(STEP_MS);
    }
    return null;
  };

  const measuring = page.url();
  let returns = 0;
  let empty = 0;
  for (let i = 0; i < 24 && Date.now() < DEADLINE; i++) {
    const dialog = await nextDialog();
    if (!dialog) {
      if (++empty >= EMPTY_LOOKS) break;
      continue;
    }
    empty = 0;
    const buttons = dialog.locator('button');
    let count = await buttons.count();
    // Окно без единой кнопки — почти всегда окно, которое ещё монтируется:
    // Escape в этот момент уходит не ему, а тому, что под ним, и на маршруте
    // ящика это закрывает сам ящик — на месте, без навигации, с `inert` на
    // всём содержимом. Так a11y на CI мерил /faq, /test-quest и
    // /settings/username и терял все пять точек у каждого контроля
    // (06.09.2026). Даём кнопкам секунду появиться, Escape — последним.
    for (let waited = 0; count === 0 && waited < 1000; waited += 100) {
      await page.waitForTimeout(100);
      count = await buttons.count();
    }
    if (count === 0) {
      await page.keyboard.press('Escape');
    } else {
      // «Next» здесь обязателен: итоги турнира идут каруселью «Ты выиграл» →
      // «Твой результат» → «В следующий раз» с кнопками «Next | Full standings»,
      // и без него запасной выбор — ПОСЛЕДНЯЯ кнопка — уводил на страницу
      // турнира (замер 06.09.2026: три окна, три ухода с /market).
      const closer = dialog.getByRole('button', {
        name: /^(continue|claim|not now|close|ok|got it|done|next|skip tour|продолжить|забрать|не сейчас|закрыть|понятно|далее|дальше|пропустить)/i,
      });
      const target = (await closer.count()) > 0 ? closer.first() : buttons.nth(count - 1);
      await target.click({ timeout: 5000 }).catch(() => {});
    }
    await page.waitForTimeout(250);
    if (page.url() !== measuring) {
      if (++returns > 2) break;
      await page.goto(measuring, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(400);
    }
  }
}
