// Прогон 2: приглашения, диплинк, авто-вызов, уход/возврат, настройки, профиль, меню.
import { chromium } from '/Users/arsen/WebstormProjects/lucky-ticket/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.resolve(new URL('.', import.meta.url).pathname, 'duel-shots-2');
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
const BASE = process.env.BASE ?? 'http://localhost:3000';
const log = (...a) => console.log(new Date().toISOString().slice(11, 23), ...a);
const findings = [];
const note = (s) => { findings.push(s); log('⚠️ ', s); };

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, recordVideo: { dir: OUT, size: { width: 390, height: 844 } } });
const page = await ctx.newPage();
page.setDefaultTimeout(8000);
const pageErrors = []; page.on('pageerror', e => pageErrors.push(e.message));
const consoleErrors = []; page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
let shotN = 0;
const shot = async (name) => { shotN += 1; const f = path.join(OUT, `${String(shotN).padStart(2, '0')}-${name}.png`); await page.screenshot({ path: f }); log('📸', path.basename(f)); };
const bodyText = async () => (await page.locator('body').innerText()).replace(/\s+/g, ' ').trim();
const dialogs = page.locator(':light([role="dialog"])');
const push = async (route) => { const ok = await page.evaluate(r => { const x = window.next?.router; if (x?.push) { x.push(r); return true; } return false; }, route); if (!ok) note('window.next.router.push недоступен'); await page.waitForTimeout(900); };

async function settle({ keepInvite = false } = {}) {
  for (let i = 0; i < 14; i++) {
    let acted = false;
    const lang = dialogs.filter({ hasText: /choose your language/i }).first();
    if (await lang.isVisible().catch(() => false)) { await lang.getByRole('button', { name: /^continue$/i }).first().click({ timeout: 3000 }).catch(() => {}); acted = true; log('onboarding: language'); await page.waitForTimeout(500); }
    const gifts = dialogs.filter({ hasText: /claim gifts/i }).first();
    if (await gifts.isVisible().catch(() => false)) { await gifts.getByRole('button', { name: /claim gifts/i }).first().click({ timeout: 3000 }).catch(() => {}); acted = true; log('onboarding: gifts'); await page.waitForTimeout(700); await page.keyboard.press('Escape'); await page.waitForTimeout(500); }
    const res = dialogs.filter({ hasText: /your result|better luck/i }).first();
    if (await res.isVisible().catch(() => false)) { await res.getByRole('button', { name: /^continue$/i }).first().click({ timeout: 3000 }).catch(() => {}); acted = true; log('tournament result: continue'); await page.waitForTimeout(400); }
    const inv = dialogs.filter({ hasText: /challenges you/i }).first();
    if (!keepInvite && await inv.isVisible().catch(() => false)) { await inv.getByRole('button', { name: /^not now$/i }).first().click({ timeout: 3000 }).catch(() => {}); acted = true; log('invite: not now'); await page.waitForTimeout(300); }
    if (!acted) break;
  }
}
const waitText = async (re, timeout = 15000, label = String(re)) => { const t0 = Date.now(); while (Date.now() - t0 < timeout) { const t = await bodyText(); if (re.test(t)) return t; await page.waitForTimeout(150); } const t = await bodyText(); note(`не дождался «${label}»: ${t.slice(0, 300)}`); return t; };

// ── 0. boot on home, keep the challenge modal ──────────────────────
await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(1500);
await settle({ keepInvite: true });
await page.waitForTimeout(800);
await settle({ keepInvite: true });
const inv = dialogs.filter({ hasText: /challenges you/i }).first();
if (await inv.isVisible().catch(() => false)) {
  await shot('home-challenge-modal');
  await inv.getByRole('button', { name: /accept the challenge/i }).click();
  await page.waitForTimeout(1500);
  await settle();
  await shot('after-accept');
  const t = await bodyText();
  log('after accept:', page.url(), t.slice(0, 200));
  if (!page.url().includes('/games/duel')) note('после «Принять вызов» не открылся экран дуэли');
  if (!/i'm ready/i.test(t)) note('после «Принять вызов» не открылась фаза готовности');
  // гость не подтверждает: через 10 с — его выбросило с текстом guest_dropped
  await page.waitForTimeout(11500);
  const t2 = await bodyText();
  await shot('guest-dropped');
  if (!/did not confirm in time|went back to the list/i.test(t2)) note(`выбывший гость не получил «guest_dropped»: ${t2.slice(0, 200)}`);
} else {
  note('модалка вызова на главной не появилась (мок всегда её шлёт)');
  await shot('home-no-modal');
}

// ── 1. play with a friend → invite modal auto-opens → send ─────────
await push('/games/duel');
await settle();
await page.getByRole('button', { name: /create lobby/i }).click();
await page.waitForTimeout(300);
await page.getByRole('button', { name: /play with a friend/i }).click();
await page.waitForTimeout(1800);
await settle();
const invDlg = dialogs.filter({ hasText: /invite players/i }).first();
if (!(await invDlg.isVisible().catch(() => false))) note('«Играть с другом»: модалка приглашений не открылась сама');
await waitText(/the bot can reach them/i, 6000, 'кандидаты в модалке');
await shot('friend-invite-modal');
await invDlg.getByText('Aram', { exact: true }).click();
await invDlg.getByText('Nare', { exact: true }).click();
const davit = invDlg.getByRole('button', { name: /Davit/ });
if (!(await davit.isDisabled().catch(() => true))) note('недостижимый Davit выбирается, а не серый');
await shot('friend-invite-picked');
await invDlg.getByRole('button', { name: /^call 2$/i }).click();
await page.waitForTimeout(900);
await shot('friend-invite-sent');
const t3 = await bodyText();
if (!/sent to 2/i.test(t3)) note(`после «Call 2» нет тоста «Sent to 2»: ${t3.slice(0, 200)}`);

// ── 2. back button while WAITING closes the lobby ──────────────────
const backBtn = page.locator('header button, [data-testid="back-button"], button[aria-label*="back" i]').first();
if (await backBtn.isVisible().catch(() => false)) { await backBtn.click(); } else { await page.evaluate(() => window.next?.router?.back()); }
await page.waitForTimeout(1200);
log('after back url:', page.url());
await shot('after-back');
await push('/games/duel');
await settle();
await page.waitForTimeout(1500);
const t4 = await bodyText();
if (/your lobby/i.test(t4)) note('уход «назад» с экрана ожидания не закрыл лобби — в списке осталось «Your lobby»');
else log('back закрыл лобби ✓');
await shot('list-after-back');

// ── 3. deep link ?lobby=… → auto-join → play → leave/return → match reopens ─
await push('/games/duel?lobby=lobby-milena');
await page.waitForTimeout(1500);
await settle();
await waitText(/i'm ready/i, 8000, 'готовность по диплинку');
await shot('deeplink-ready');
const t5 = await bodyText();
if (!/lobby Milena/i.test(t5)) note(`по диплинку не видно «lobby Milena»: ${t5.slice(0, 200)}`);
if (page.url().includes('lobby=')) note('после входа по диплинку параметр ?lobby= остался в адресе');
await page.getByRole('button', { name: /i'm ready/i }).click();
await waitText(/pick a token/i, 8000, 'старт матча');
await shot('deeplink-playing');
// уходим посреди матча и возвращаемся — матч обязан открыться сам
await push('/');
await page.waitForTimeout(800);
await shot('left-mid-match-home');
await push('/games/duel');
await page.waitForTimeout(1500);
await settle();
const t6 = await bodyText();
await shot('returned-mid-match');
if (!/pick a token|move accepted|round|draw|beats/i.test(t6)) note(`после возврата на экран матч не открылся сам: ${t6.slice(0, 200)}`);
else log('возврат в идущий матч ✓');
// доигрываем
for (let r = 0; r < 8; r++) {
  const t = await bodyText();
  if (/you won the match|match lost/i.test(t)) break;
  const btn = page.getByRole('button', { name: /^scissors$/i });
  if (await btn.isVisible().catch(() => false) && !(await btn.isDisabled().catch(() => true))) { await btn.click(); }
  await page.waitForTimeout(1500);
}
await shot('deeplink-match-end');

// ── 4. settings: policy row; profile: games card; drawer: games item ─
await push('/settings');
await page.waitForTimeout(1500);
await settle();
const t7 = await bodyText();
if (!/duel challenges/i.test(t7)) note('в настройках нет строки «Duel challenges»');
else {
  const row = page.getByText(/duel challenges/i).first();
  await row.scrollIntoViewIfNeeded().catch(() => {});
}
await shot('settings-policy');
// попробуем переключить
const policyBtn = page.getByRole('button', { name: /duel challenges|everyone|friends|nobody/i }).first();
if (await policyBtn.isVisible().catch(() => false)) { await policyBtn.click(); await page.waitForTimeout(600); await shot('settings-policy-open'); await page.keyboard.press('Escape'); }

await push('/profile');
await page.waitForTimeout(1500);
await settle();
const t8 = await bodyText();
if (!/matches/i.test(t8) || !/win rate/i.test(t8)) note(`в профиле нет карточки «Игры» (Matches / Win rate): ${t8.slice(0, 200)}`);
const card = page.getByText(/win rate/i).first();
await card.scrollIntoViewIfNeeded().catch(() => {});
await shot('profile-games-card');

await push('/');
await page.waitForTimeout(1000);
await settle();
const menuBtn = page.locator('header button').first();
await menuBtn.click().catch(() => note('кнопка меню в шапке не нажалась'));
await page.waitForTimeout(800);
const t9 = await bodyText();
if (!/games/i.test(t9)) note('в drawer нет пункта «Games»');
await shot('drawer-games');

// ── итоги ─────────────────────────────────────────────────────────
const leak = (await bodyText()).match(/\{[a-zA-Z]+\}/g);
if (leak) note('утечка плейсхолдеров: ' + leak.join(', '));
log('pageErrors:', pageErrors); log('consoleErrors:', consoleErrors.slice(0, 8));
await ctx.close(); await browser.close();
const vids = fs.readdirSync(OUT).filter(f => f.endsWith('.webm')); if (vids[0]) fs.renameSync(path.join(OUT, vids[0]), path.join(OUT, 'duel-run2.webm'));
fs.writeFileSync(path.join(OUT, 'findings.json'), JSON.stringify({ findings, pageErrors, consoleErrors }, null, 2));
log('DONE. findings:', findings.length, findings);
