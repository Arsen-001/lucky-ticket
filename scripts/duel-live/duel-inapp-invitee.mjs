// Приглашённый «внутри приложения»: настоящий прод-фронт в headless Chromium под тестовым аккаунтом
// (initData подписан ботовым токеном и отдан через #tgWebAppData, как это делает Telegram).
// Сидит на главной, ждёт модалку вызова, принимает, жмёт «готов», ходит жетонами до конца матча.
import { chromium } from '/Users/arsen/WebstormProjects/lucky-ticket/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { createHmac } from 'node:crypto';

const OUT = path.resolve(new URL('.', import.meta.url).pathname, 'duel-inapp');
fs.mkdirSync(OUT, { recursive: true });
const ts = () => new Date().toISOString().slice(11, 23);
const log = (...a) => console.log(ts(), ...a);

const env = fs.readFileSync('/Users/arsen/WebstormProjects/lucky-ticket-backend/.env', 'utf8');
const bot = (env.match(/^TELEGRAM_BOT_TOKEN=["']?([^"'\n]+)/m) || [])[1];
const p = new URLSearchParams();
p.set('user', JSON.stringify({ id: 6709953752, username: 'AK00001KA', first_name: '.', is_premium: false, language_code: 'ru' }));
p.set('auth_date', String(Math.floor(Date.now() / 1000)));
p.set('query_id', 'inapp_' + Math.random().toString(36).slice(2, 10));
const dcs = [...p.entries()].sort(([a], [b]) => (a < b ? -1 : 1)).map(([k, v]) => `${k}=${v}`).join('\n');
const secret = createHmac('sha256', 'WebAppData').update(bot).digest();
p.set('hash', createHmac('sha256', secret).update(dcs).digest('hex'));
const initData = p.toString();
const URL_ = `https://lucky-ticket-nu.vercel.app/#tgWebAppData=${encodeURIComponent(initData)}&tgWebAppVersion=8.0&tgWebAppPlatform=android&tgWebAppThemeParams=%7B%7D`;

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: 'ru-RU', recordVideo: { dir: OUT, size: { width: 390, height: 844 } } });
const page = await ctx.newPage();
page.setDefaultTimeout(8000);
page.on('pageerror', e => log('PAGEERROR', e.message));
let shotN = 0;
const shot = async (n) => { shotN++; const f = path.join(OUT, `${String(shotN).padStart(2, '0')}-${n}.png`); await page.screenshot({ path: f }); log('📸', path.basename(f)); };
const body = async () => (await page.locator('body').innerText().catch(() => '')).replace(/\s+/g, ' ');
const dialogs = page.locator(':light([role="dialog"])');

await page.goto(URL_, { waitUntil: 'domcontentloaded' });
const shell = page.getByTestId('app-shell');
await shell.waitFor({ state: 'attached', timeout: 30000 }).catch(() => log('app-shell не появился за 30 с'));
await page.waitForTimeout(3000);
await shot('home');
log('url:', page.url(), '| text:', (await body()).slice(0, 160));
// гасим автомодалки, кроме вызова
for (let i = 0; i < 8; i++) {
  let acted = false;
  for (const d of await dialogs.all()) {
    const t = (await d.innerText().catch(() => '')).replace(/\s+/g, ' ');
    if (/challenges you|зовёт на дуэль|вызывает/i.test(t)) continue;
    const b = d.getByRole('button').filter({ hasText: /continue|продолжить|ok|got it|close|закрыть|later|позже|not now|не сейчас/i }).first();
    if (await b.isVisible().catch(() => false)) { await b.click({ timeout: 2000 }).catch(() => {}); acted = true; log('dismissed dialog:', t.slice(0, 60)); await page.waitForTimeout(500); break; }
  }
  if (!acted) break;
}
await shot('home-ready');
log('ЖДУ ВЫЗОВ на главной (до 12 мин)…');

// ── ждём модалку вызова ───────────────────────────────────────────────
const t0 = Date.now();
let inv = null;
while (Date.now() - t0 < 12 * 60_000) {
  const d = dialogs.filter({ hasText: /challenges you|зовёт на дуэль|вызывает/i }).first();
  if (await d.isVisible().catch(() => false)) { inv = d; break; }
  if ((Date.now() - t0) % 30_000 < 1000) log('…жду', Math.round((Date.now() - t0) / 1000), 'с');
  await page.waitForTimeout(700);
}
if (!inv) { log('вызов не пришёл'); await ctx.close(); await browser.close(); process.exit(3); }
const tModal = Date.now();
log('МОДАЛКА ВЫЗОВА ПОЯВИЛАСЬ:', (await inv.innerText()).replace(/\s+/g, ' ').slice(0, 160));
await shot('challenge-modal');
await inv.getByRole('button').filter({ hasText: /accept|принять/i }).first().click();
log('нажал «принять»');
await page.waitForTimeout(2500);
await shot('after-accept');
log('url:', page.url(), '| text:', (await body()).slice(0, 200));

// ── готовность ───────────────────────────────────────────────────────
const readyBtn = page.getByRole('button').filter({ hasText: /i'm ready|я готов/i }).first();
await readyBtn.waitFor({ state: 'visible', timeout: 15000 }).catch(async () => log('кнопки «готов» нет; text:', (await body()).slice(0, 200)));
await shot('ready-phase');
if (await readyBtn.isVisible().catch(() => false)) { await readyBtn.click(); log('нажал «готов» через', ((Date.now() - tModal) / 1000).toFixed(1), 'с после модалки'); }

// ── матч ─────────────────────────────────────────────────────────────
const tokenRe = /^(rock|ticket|scissors|камень|билет|ножницы)$/i;
const tStart = Date.now();
let lastText = '';
while (Date.now() - tStart < 6 * 60_000) {
  const t = await body();
  if (t !== lastText) { lastText = t; const i = t.search(/RPS|КНБ/); log('screen:', t.slice(i >= 0 ? i : 0, (i >= 0 ? i : 0) + 150)); }
  if (/you won the match|match lost|победа в матче|матч проигран/i.test(t)) { log('МАТЧ ОКОНЧЕН'); await shot('finished'); break; }
  const btns = page.getByRole('button').filter({ hasText: tokenRe });
  const n = await btns.count();
  for (let i = 0; i < n; i++) {
    const b = btns.nth(i);
    if (await b.isVisible().catch(() => false) && !(await b.isDisabled().catch(() => true))) {
      const name = (await b.innerText()).trim();
      await b.click({ timeout: 1500 }).catch(() => {});
      log('ход:', name);
      await page.waitForTimeout(300);
      await shot('moved');
      break;
    }
  }
  if (/draw|ничья|beats|бьёт|your round|ваш раунд|opponent takes|раунд соперника/i.test(t) && !/pick a token|выберите жетон/i.test(t)) { await shot('reveal'); await page.waitForTimeout(1200); }
  await page.waitForTimeout(600);
}
await page.waitForTimeout(1500);
await shot('end');
await ctx.close(); await browser.close();
const vids = fs.readdirSync(OUT).filter(f => f.endsWith('.webm')); if (vids[0]) fs.renameSync(path.join(OUT, vids[0]), path.join(OUT, 'inapp.webm'));
log('DONE');
