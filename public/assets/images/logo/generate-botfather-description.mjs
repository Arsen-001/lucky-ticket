/**
 * Builds the 640×360 picture BotFather shows above the bot's description
 * (@BotFather → Edit Bot → Edit Description Picture — there is no Bot API for
 * it, so this is uploaded by hand).
 *
 *   node public/assets/images/logo/generate-botfather-description.mjs
 *
 * Composes the finished lockup (luckyticket365-logo-transparent.svg) over the
 * brand background, so the tickets and the wordmark stay byte-identical to the
 * rest of the kit — run generate-logo-real.mjs first if the lockup changed.
 * Rendered at 3× and downscaled, because 640×360 is small enough that text
 * aliasing shows.
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

const W = 640;
const H = 360;
const SCALE = 3;

const TAGLINE = 'Daily luck · Real rewards · Big jackpots';
const CHIPS = ['Free daily tickets', 'Tournaments', 'Telegram Stars'];

/**
 * The lockup SVG draws into a 740×500 canvas; its ink sits in this box, so the
 * transparent margin is cropped away instead of eating the layout.
 */
const INK = { x: 61, y: 42, w: 618, h: 420, canvasW: 740, canvasH: 500 };
const LOCKUP_W = 292; // on-canvas width of the cropped lockup

// Background layers — same stack as generate-logo-real.mjs (BG_LAYERS there),
// kept in project accents: violet core, electric purple, pink, teal, gold, vignette.
const BG_LAYERS = [
  ['bg-core', 0.5, 0.34, 0.85, [[0, '#5B2E88', 1], [45, '#2E2049', 1], [100, '#12101E', 1]]],
  ['bg-ep', 0.16, 0.12, 0.62, [[0, '#743DF5', 0.42], [100, '#743DF5', 0]]],
  ['bg-pk', 0.12, 0.78, 0.62, [[0, '#DE009B', 0.34], [100, '#DE009B', 0]]],
  ['bg-tl', 0.9, 0.82, 0.6, [[0, '#178D88', 0.34], [100, '#178D88', 0]]],
  ['bg-gd', 0.5, 0.3, 0.42, [[0, '#F8BD3E', 0.18], [100, '#F8BD3E', 0]]],
  ['bg-vg', 0.5, 0.45, 0.78, [[55, '#0E0C18', 0], [100, '#0E0C18', 0.6]]],
];

const background = `<svg class="bg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
<defs>
${BG_LAYERS.map(([id, cx, cy, r, stops]) =>
  `  <radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">\n` +
  stops.map(([o, c, a]) => `    <stop offset="${o}%" stop-color="${c}" stop-opacity="${a}"/>`).join('\n') +
  `\n  </radialGradient>`).join('\n')}
</defs>
${BG_LAYERS.map(([id]) => `  <rect width="${W}" height="${H}" fill="url(#${id})"/>`).join('\n')}
</svg>`;

const dataUri = (file, mime) =>
  `data:${mime};base64,` + fs.readFileSync(path.join(HERE, file)).toString('base64');

const lockup = dataUri('luckyticket365-logo-transparent.svg', 'image/svg+xml');
const font = dataUri('fonts/SpaceGrotesk-Bold.ttf', 'font/ttf');

const lockupH = (LOCKUP_W * INK.h) / INK.w;
const fullW = (LOCKUP_W * INK.canvasW) / INK.w;

const html = `<!doctype html><meta charset="utf-8">
<style>
  @font-face {
    font-family: 'Space Grotesk';
    src: url(${font}) format('truetype');
    font-weight: 700;
  }
  * { margin: 0; box-sizing: border-box; }
  body { width: ${W}px; height: ${H}px; overflow: hidden; }
  .card {
    position: relative; width: ${W}px; height: ${H}px;
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; font-family: 'Space Grotesk', sans-serif;
  }
  .bg { position: absolute; inset: 0; }
  .lockup { position: relative; width: ${LOCKUP_W}px; height: ${lockupH}px; overflow: hidden; }
  .lockup img {
    position: absolute;
    width: ${fullW}px;
    left: ${-(INK.x * LOCKUP_W) / INK.w}px;
    top: ${-(INK.y * LOCKUP_W) / INK.w}px;
  }
  .tagline {
    position: relative; margin-top: 16px;
    font-size: 17px; font-weight: 700; letter-spacing: 0.045em;
    color: #EFEAFB; text-shadow: 0 2px 10px rgba(11, 9, 24, 0.55);
  }
  .chips { position: relative; margin-top: 18px; display: flex; gap: 8px; }
  .chip {
    padding: 6px 13px; border-radius: 999px;
    font-size: 12.5px; font-weight: 700; letter-spacing: 0.02em;
    color: #D9D2EE;
    background: rgba(255, 255, 255, 0.055);
    border: 1px solid rgba(255, 255, 255, 0.13);
    backdrop-filter: blur(2px);
  }
</style>
<div class="card">
  ${background}
  <div class="lockup"><img src="${lockup}" alt=""></div>
  <div class="tagline">${TAGLINE}</div>
  <div class="chips">${CHIPS.map(c => `<span class="chip">${c}</span>`).join('')}</div>
</div>`;

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: W, height: H },
  deviceScaleFactor: SCALE,
});
await page.setContent(html);
await page.waitForTimeout(400);
const big = await page.screenshot();
await page.close();

// Downscale in the same browser rather than shelling out to an image tool, so
// the script needs nothing beyond playwright. BotFather takes the JPEG; the PNG
// is kept for further edits.
const shrinkPage = await browser.newPage();
await shrinkPage.setContent('<body></body>');
const out = await shrinkPage.evaluate(
  async ({ src, w, h }) => {
    const img = new Image();
    img.src = src;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, w, h);
    return { png: c.toDataURL('image/png'), jpg: c.toDataURL('image/jpeg', 0.92) };
  },
  { src: 'data:image/png;base64,' + big.toString('base64'), w: W, h: H },
);
await shrinkPage.close();
await browser.close();

const written = Object.entries({
  'botfather-description-640x360.png': out.png,
  'botfather-description-640x360.jpg': out.jpg,
}).map(([name, uri]) => {
  const file = path.join(HERE, name);
  fs.writeFileSync(file, Buffer.from(uri.split(',')[1], 'base64'));
  return `${name}  ${(fs.statSync(file).size / 1024).toFixed(0)}KB`;
});

console.log(written.join('\n'));
console.log('\nUpload: @BotFather → /mybots → bot → Edit Bot → Edit Description Picture');
