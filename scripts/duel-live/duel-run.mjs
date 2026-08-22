// Прогон дуэли на localhost (мок): весь игровой цикл со скриншотами каждой фазы.
import { chromium } from '/Users/arsen/WebstormProjects/lucky-ticket/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.resolve(new URL('.', import.meta.url).pathname, 'duel-shots');
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const BASE = process.env.BASE ?? 'http://localhost:3000';
const log = (...a) => console.log(new Date().toISOString().slice(11, 23), ...a);
const findings = [];
const note = (s) => { findings.push(s); log('⚠️ ', s); };

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  recordVideo: { dir: OUT, size: { width: 390, height: 844 } },
  locale: 'ru-RU',
});
const page = await ctx.newPage();
page.setDefaultTimeout(8000);
const pageErrors = [];
page.on('pageerror', e => pageErrors.push(e.message));
const consoleErrors = [];
page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });

let shotN = 0;
const shot = async (name) => {
  shotN += 1;
  const file = path.join(OUT, `${String(shotN).padStart(2, '0')}-${name}.png`);
  await page.screenshot({ path: file });
  log('📸', path.basename(file));
  return file;
};

const bodyText = async () => (await page.locator('body').innerText()).replace(/\s+/g, ' ').trim();

// Известные авто-оверлеи: онбординг (язык → подарки → тур) и вызов на дуэль из мока.
async function settle(maxRounds = 14) {
  const dialogs = page.locator(':light([role="dialog"])');
  for (let i = 0; i < maxRounds; i++) {
    let acted = false;
    const lang = dialogs.filter({ hasText: /choose your language|выбери(те)? язык/i }).first();
    if (await lang.isVisible().catch(() => false)) {
      await lang.getByRole('button', { name: /^(continue|продолжить)$/i }).first().click({ timeout: 3000 }).catch(e => note('language continue click failed: ' + e.message.split('\n')[0]));
      acted = true; log('onboarding: language → continue'); await page.waitForTimeout(500);
    }
    const gifts = dialogs.filter({ hasText: /claim gifts|забрать подарки/i }).first();
    if (await gifts.isVisible().catch(() => false)) {
      await gifts.getByRole('button', { name: /claim gifts|забрать подарки/i }).first().click({ timeout: 3000 }).catch(e => note('claim gifts click failed: ' + e.message.split('\n')[0]));
      acted = true; log('onboarding: claim gifts'); await page.waitForTimeout(700);
      await page.keyboard.press('Escape'); await page.waitForTimeout(500); log('tour: escape; url=', page.url());
    }
    const inv = dialogs.filter({ hasText: /challenges you|вызывает/i }).first();
    if (await inv.isVisible().catch(() => false)) {
      await inv.getByRole('button', { name: /^(not now|не сейчас)$/i }).first().click({ timeout: 3000 }).catch(e => note('not-now click failed: ' + e.message.split('\n')[0]));
      acted = true; log('duel invite modal: not now'); await page.waitForTimeout(300);
    }
    const res = dialogs.filter({ hasText: /your result|ваш результат/i }).first();
    if (await res.isVisible().catch(() => false)) {
      await res.getByRole('button', { name: /^(continue|продолжить)$/i }).first().click({ timeout: 3000 }).catch(e => note('tournament result continue failed: ' + e.message.split('\n')[0]));
      acted = true; log('tournament result modal: continue'); await page.waitForTimeout(400);
    }
    if (!acted) {
      const n = await dialogs.count();
      if (n) {
        const t = (await dialogs.last().innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 160);
        log('other dialog open:', n, t);
        const generic = dialogs.last().getByRole('button', { name: /^(continue|продолжить|ok|got it|close|закрыть)$/i }).first();
        if (await generic.isVisible().catch(() => false)) { await generic.click({ timeout: 3000 }).catch(() => {}); acted = true; log('generic dialog: continue'); await page.waitForTimeout(400); }
      }
      if (!acted) break;
    }
  }
}

async function ensureDuelRoute() {
  if (!page.url().includes('/games/duel')) {
    log('url is', page.url(), '→ client push /games/duel');
    const ok = await page.evaluate(() => {
      const r = window.next?.router;
      if (r && typeof r.push === 'function') { r.push('/games/duel'); return true; }
      return false;
    });
    if (!ok) { await page.goto(`${BASE}/games/duel`, { waitUntil: 'domcontentloaded' }); }
    await page.waitForTimeout(800);
    await settle();
  }
}

const state = async () => {
  const txt = await bodyText();
  return txt;
};

const waitText = async (re, timeout = 20_000, label = String(re)) => {
  const t0 = Date.now();
  while (Date.now() - t0 < timeout) {
    const txt = await bodyText();
    if (re.test(txt)) return txt;
    await page.waitForTimeout(150);
  }
  const txt = await bodyText();
  note(`не дождался «${label}» за ${timeout}ms. Текст экрана: ${txt.slice(0, 400)}`);
  return txt;
};

// ────────────────────────────────────────────────────────────────────
log('open', `${BASE}/games/duel`);
await page.goto(`${BASE}/games/duel`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(1500);
await shot('boot');
await settle();
await ensureDuelRoute();
await page.waitForTimeout(1200);
await settle();
await shot('lobbies');
let txt = await bodyText();
log('lobbies text:', txt.slice(0, 300));

// ── 1. Создать лобби ─────────────────────────────────────────────────
const createBtn = page.getByRole('button', { name: /create lobby|создать лобби/i });
await createBtn.waitFor({ state: 'visible', timeout: 10_000 });
const createDisabled = await createBtn.isDisabled();
log('create disabled?', createDisabled);
await createBtn.click();
await page.waitForTimeout(500);
await shot('stake-picker');
// выбрать ставку 2
await page.getByRole('button', { name: /^2\s/ }).first().click().catch(async () => {
  const btns = page.locator('button[aria-pressed]');
  await btns.nth(1).click();
});
await page.waitForTimeout(200);
await shot('stake-2-picked');
await page.getByRole('button', { name: /^(open lobby|открыть лобби)$/i }).click();
await page.waitForTimeout(700);
await settle();
await shot('waiting');
const tWaitingStart = Date.now();

// ── 2. Модалка приглашений ──────────────────────────────────────────
await page.getByRole('button', { name: /invite players|позвать игроков/i }).click();
await page.waitForTimeout(600);
await shot('invite-modal');
// выбрать двоих и отправить
const inviteDialog = page.locator(':light([role="dialog"])').last();
const candidateBtns = inviteDialog.locator('button, [role="checkbox"], label');
log('invite dialog controls:', await candidateBtns.count());
txt = await inviteDialog.innerText().catch(() => '');
log('invite dialog text:', txt.replace(/\s+/g, ' ').slice(0, 300));
// Тапаем по именам
for (const n of ['Aram', 'Nare']) {
  const el = inviteDialog.getByText(n, { exact: true }).first();
  if (await el.isVisible().catch(() => false)) await el.click();
}
await page.waitForTimeout(300);
await shot('invite-picked');
const sendBtn = inviteDialog.getByRole('button', { name: /call \d|позвать \d/i });
if (await sendBtn.isVisible().catch(() => false)) {
  await sendBtn.click();
  await page.waitForTimeout(700);
  await shot('invite-sent-toast');
} else {
  note('кнопка «Call N» в модалке приглашений не найдена');
  await page.keyboard.press('Escape');
}
await page.waitForTimeout(400);
// закрыть модалку, если ещё открыта
if (await inviteDialog.isVisible().catch(() => false)) {
  const closeBtn = inviteDialog.getByRole('button', { name: /close|закрыть|back|назад/i }).first();
  if (await closeBtn.isVisible().catch(() => false)) await closeBtn.click(); else await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
}

// ── 3. Ждём массовку (мок: 8 с) ─────────────────────────────────────
await waitText(/i'm ready|я готов/i, 15_000, 'фаза готовности');
await shot('ready-phase');
txt = await bodyText();
log('ready text:', txt.slice(0, 300));
const msToReady = Date.now() - tWaitingStart;
log('массовка подсела через', msToReady, 'ms');
// Смотрим отсчёт: ждём 3 секунды и снимем ещё раз (полоса + число)
await page.waitForTimeout(3000);
await shot('ready-phase-countdown');
await page.getByRole('button', { name: /i'm ready|я готов/i }).click();
await page.waitForTimeout(600);
await shot('playing-round-start');

// ── 4. Играем раунды до конца ───────────────────────────────────────
const moves = ['rock', 'ticket', 'scissors'];
let draws = 0;
for (let round = 0; round < 8; round++) {
  const txtNow = await bodyText();
  if (/you won the match|match lost|вы выиграли|матч проигран/i.test(txtNow)) break;
  // кнопки жетонов — три кнопки с подписями
  const pickBtn = page.getByRole('button', { name: new RegExp(`^${moves[round % 3]}$`, 'i') });
  const visible = await pickBtn.isVisible().catch(() => false);
  if (!visible) {
    // Может быть, идёт вскрытие — подождём следующего раунда
    await page.waitForTimeout(800);
    const again = await pickBtn.isVisible().catch(() => false);
    if (!again) { note(`раунд ${round}: кнопки хода не видны. Текст: ${(await bodyText()).slice(0, 300)}`); await shot(`round${round}-no-picks`); break; }
  }
  const secondsShown = (await bodyText()).match(/\b(\d)\b\s*(pick a token|выбери)/i)?.[1];
  log(`round ${round}: таймер показывает`, secondsShown);
  await pickBtn.click();
  await page.waitForTimeout(120);
  await shot(`round${round}-moved`);
  const txtMoved = await bodyText();
  if (!/move accepted|ход принят/i.test(txtMoved) && !/beats|бьёт|draw|ничья|your round|opponent takes/i.test(txtMoved)) {
    note(`раунд ${round}: через 120мс после тапа нет «ход принят» — текст: ${txtMoved.slice(0, 300)}`);
  } else log(`round ${round}: отклик на тап есть через 120мс`);
  // ждём вскрытия
  await waitText(/beats|бьёт|draw|ничья|your round|opponent takes|you won the match|match lost/i, 9000, `вскрытие раунда ${round}`);
  await page.waitForTimeout(350); // дать «падению жетона» лечь
  await shot(`round${round}-reveal`);
  const rv = await bodyText();
  log(`round ${round} reveal:`, rv.slice(0, 220));
  if (/draw|ничья/i.test(rv)) { draws += 1; log(`round ${round}: НИЧЬЯ показана как ничья ✓`); }
  // пауза: следующий раунд приходит через 1.4 с в моке
  await page.waitForTimeout(1800);
}
await shot('finished');
txt = await bodyText();
log('final:', txt.slice(0, 300));
const won = /you won the match|вы выиграли/i.test(txt);
const lost = /match lost|матч проигран/i.test(txt);
if (!won && !lost) note('финал не наступил за 8 раундов');

// ── 5. Назад в лобби; билеты ─────────────────────────────────────────
const back = page.getByRole('button', { name: /back to lobbies|к лобби/i });
if (await back.isVisible().catch(() => false)) { await back.click(); await page.waitForTimeout(800); }
await shot('back-to-lobbies');
txt = await bodyText();
log('after match lobbies:', txt.slice(0, 200));
if (/your lobby|ваше лобби/i.test(txt)) note('после матча список показывает протухшее «Your lobby»');
const ticketsAfter = txt.match(/(\d+)\s*TICKETS/i)?.[1];
log('tickets in header after match:', ticketsAfter, won ? '(ожидаю 7)' : '(ожидаю 3)');
if (won && ticketsAfter !== '7') note(`после победы в шапке ${ticketsAfter} билетов, а не 7 (протухший кадр)`);
if (lost && ticketsAfter !== '3') note(`после поражения в шапке ${ticketsAfter} билетов, а не 3`);

// ── 6. Вход в чужое лобби (гость) + таймаут готовности ───────────────
const joinBtn = page.getByRole('button', { name: /^(join|войти)$/i }).first();
if (await joinBtn.isVisible().catch(() => false)) {
  await joinBtn.click();
  await page.waitForTimeout(700);
  await shot('guest-ready-phase');
  txt = await bodyText();
  log('guest ready text:', txt.slice(0, 250));
  // НЕ жмём «готов» — ждём 10 с, должны вылететь с тостом host_not_ready
  await page.waitForTimeout(11_000);
  await shot('guest-timeout');
  txt = await bodyText();
  log('after guest timeout:', txt.slice(0, 250));
  if (!/did not confirm|не подтвердил/i.test(txt) && !/open lobbies|открытые лобби/i.test(txt)) note('после 10 с без «готов» экран не вернулся в список и тоста нет');
} else {
  note('кнопка Join не найдена в списке лобби');
}
await settle();

// ── 7. Создать лобби и отменить ожидание ────────────────────────────
const createBtn2 = page.getByRole('button', { name: /create lobby|создать лобби/i });
if (await createBtn2.isVisible().catch(() => false)) {
  await createBtn2.click();
  await page.waitForTimeout(300);
  await page.getByRole('button', { name: /^(open lobby|открыть лобби)$/i }).click();
  await page.waitForTimeout(600);
  await page.getByRole('button', { name: /cancel waiting|отменить ожидание/i }).click();
  await page.waitForTimeout(150);
  const spinning = await page.getByRole('button', { name: /cancel waiting|отменить ожидание/i }).locator('svg, [class*=spin], [class*=loader]').count().catch(() => 0);
  log('cancel waiting: spinner elements after 150ms =', spinning);
  await shot('cancel-waiting-pressed');
  await page.waitForTimeout(1400);
  await shot('after-cancel-waiting');
  txt = await bodyText();
  log('after cancel:', txt.slice(0, 200));
}

// ── итоги ───────────────────────────────────────────────────────────
const leak = (await bodyText()).match(/\{[a-zA-Z]+\}/g);
if (leak) note('утечка плейсхолдеров i18n: ' + leak.join(', '));
log('pageErrors:', pageErrors);
log('consoleErrors:', consoleErrors.slice(0, 10));
await ctx.close();
await browser.close();
// переименовать видео
const vids = fs.readdirSync(OUT).filter(f => f.endsWith('.webm'));
if (vids[0]) fs.renameSync(path.join(OUT, vids[0]), path.join(OUT, 'duel-run.webm'));
fs.writeFileSync(path.join(OUT, 'findings.json'), JSON.stringify({ findings, pageErrors, consoleErrors }, null, 2));
log('draws seen:', draws); log('DONE. findings:', findings.length);
