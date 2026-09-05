/**
 * Баннер поста про Тикки: 1280×720, снимается в 2×.
 *
 *   node scripts/build-tikki-post-image.mjs
 *
 * Тот же приём, что и у остальных постов канала: разметка рядом
 * (`tikki-post-banner.html`), боевой Gilroy и настоящие ассеты игры вшиты
 * data-URI, поэтому снимок не зависит от сети и повторяется байт в байт.
 * Персонаж и движок — те же файлы, что в рекламном креативе Adsgram, чтобы
 * пост и объявление читались как одна кампания.
 *
 * Результат: `public/assets/images/tikki-post.png`. Композер панели умеет и
 * URL, и файл с компьютера — по URL картинка заработает только после деплоя
 * фронта, файлом её можно приложить сразу.
 */
import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync, rmSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

const dataUri = (rel, mime) =>
  `data:${mime};base64,${readFileSync(resolve(root, rel)).toString('base64')}`;

const FONTS = [
  ['gilroy-black', 'src/fonts/gilroy/Gilroy-Black.woff2'],
  ['gilroy-extrabold', 'src/fonts/gilroy/Gilroy-ExtraBold.woff2'],
  ['gilroy-medium', 'src/fonts/gilroy/Gilroy-Medium.woff2'],
];
const ART = [
  ['tikki', 'public/assets/images/tikki/gold-idle.webp'],
  ['engine', 'public/assets/icons/engines/gold-engine.webp'],
  ['coin', 'public/assets/icons/currencies/lc-coin.webp'],
];

let html = readFileSync(resolve(here, 'tikki-post-banner.html'), 'utf8');
for (const [key, rel] of FONTS) html = html.replaceAll(`{{${key}}}`, dataUri(rel, 'font/woff2'));
for (const [key, rel] of ART) html = html.replaceAll(`{{${key}}}`, dataUri(rel, 'image/webp'));

const tmp = resolve(here, '.tikki-post-banner.built.html');
writeFileSync(tmp, html);

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1280, height: 720 },
  deviceScaleFactor: 2,
});
await page.goto(`file://${tmp}`);
// Шрифт вшит, но растеризуется не мгновенно: без этого снимок ловит фолбэк.
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(300);

const out = resolve(root, 'public/assets/images/tikki-post.png');
await page.locator('.board').screenshot({ path: out });
await browser.close();
rmSync(tmp, { force: true });

console.log(`tikki-post.png готов: ${out} · ${(statSync(out).size / 1024).toFixed(0)} Кб`);
