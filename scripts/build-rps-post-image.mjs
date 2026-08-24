/**
 * Рисует баннер поста про камень-билет-ножницы: 1280×720, снимается в 2×.
 *
 * Скриптом, а не руками, по той же причине, что и карточка подарка: текст и
 * палитра ещё поедут, а картинку Telegram тянет ПО URL и кэширует её — значит
 * пересобирать надо той же вёрсткой, из тех же файлов игры.
 *
 *   node scripts/build-rps-post-image.mjs
 *
 * Разметка лежит рядом (`rps-post-banner.html`) и подставляет боевой Gilroy и
 * настоящие фигуры игры (камень, бронзовый билет, ножницы) — они вшиваются в
 * страницу как data-URI, чтобы снимок не зависел от сети.
 *
 * Результат: `public/assets/images/rps-post.png` — публичный origin мини-аппа,
 * оттуда картинку и берёт панель при отправке в канал и в рассылку боту.
 */
import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

const dataUri = (rel, mime) =>
  `data:${mime};base64,${readFileSync(resolve(root, rel)).toString('base64')}`;

const FONTS = [
  ['gilroy-black', 'src/fonts/gilroy/Gilroy-Black.woff2'],
  ['gilroy-extrabold', 'src/fonts/gilroy/Gilroy-ExtraBold.woff2'],
  ['gilroy-semibold', 'src/fonts/gilroy/Gilroy-SemiBold.woff2'],
  ['gilroy-medium', 'src/fonts/gilroy/Gilroy-Medium.woff2'],
];
const ART = [
  ['rock', 'public/assets/icons/duel/rock.webp'],
  ['scissors', 'public/assets/icons/duel/scissors.webp'],
  ['ticket', 'public/assets/icons/tickets/bronze-ticket.webp'],
];

let html = readFileSync(resolve(here, 'rps-post-banner.html'), 'utf8');
for (const [key, rel] of FONTS) html = html.replaceAll(`{{${key}}}`, dataUri(rel, 'font/woff2'));
for (const [key, rel] of ART) html = html.replaceAll(`{{${key}}}`, dataUri(rel, 'image/webp'));

const tmp = resolve(here, '.rps-post-banner.built.html');
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

const out = resolve(root, 'public/assets/images/rps-post.png');
await page.locator('.board').screenshot({ path: out });
await browser.close();
rmSync(tmp, { force: true });

console.log(`rps-post.png готов: ${out}`);
