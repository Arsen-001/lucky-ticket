/**
 * Builds the LuckyTicket365 lockup from the REAL ticket artwork
 * (public/assets/icons/tickets/*.webp) instead of the drawn vector tickets.
 *
 *   node public/assets/images/logo/generate-logo-real.mjs
 *
 * Needs wordmark.json (emitted by generate-logo.py) for the outlined wordmark.
 * Ticket art is downscaled + re-encoded to webp in Chromium and inlined as
 * data URIs, so every *-real.svg is self-contained.
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TICKETS = path.resolve(HERE, '../../icons/tickets');

// --- fan geometry -----------------------------------------------------------
const CX = 370;          // fan centre
const CY = 150;
const PIVOT = 340;       // rotation pivot below the fan
const H = 216;           // upright ticket height
const W = +(H * (879 / 1695)).toFixed(1); // → width, native ticket aspect
const CANVAS_W = 740;
const CANVAS_H = 500;
const WORDMARK_W = 560;

const TIERS = [
  { key: 'bronze', file: 'bronze-ticket.webp', angle: -36, lift: 0 },
  { key: 'silver', file: 'silver-ticket.webp', angle: -18, lift: 0 },
  { key: 'gold', file: 'golden-ticket.webp', angle: 0, lift: 0 },
  { key: 'platinum', file: 'platinum-ticket.webp', angle: 18, lift: 0 },
  { key: 'diamond', file: 'diamond-ticket.webp', angle: 36, lift: 0 },
];
const ORDER = ['bronze', 'silver', 'diamond', 'platinum', 'gold']; // gold on top

const ENCODE_WIDTH = 780; // px of source art kept per ticket
const ENCODE_QUALITY = 0.88;

const browser = await chromium.launch();

// --- 1. downscale + inline the ticket art -----------------------------------
const rawArt = Object.fromEntries(
  TIERS.map(t => [
    t.key,
    'data:image/webp;base64,' + fs.readFileSync(path.join(TICKETS, t.file)).toString('base64'),
  ])
);

const encodePage = await browser.newPage();
await encodePage.setContent('<body></body>');
const art = await encodePage.evaluate(
  async ({ rawArt, w, q }) => {
    const res = {};
    for (const [key, src] of Object.entries(rawArt)) {
      const img = new Image();
      img.src = src;
      await img.decode();
      const c = document.createElement('canvas');
      c.width = w;
      c.height = Math.round((w * img.naturalHeight) / img.naturalWidth);
      const ctx = c.getContext('2d');
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, c.width, c.height);
      res[key] = c.toDataURL('image/webp', q);
    }
    return res;
  },
  { rawArt, w: ENCODE_WIDTH, q: ENCODE_QUALITY }
);
await encodePage.close();

// --- 2. compose the SVGs ----------------------------------------------------
const SHADOW = `  <filter id="ticket-shadow" x="-40%" y="-40%" width="180%" height="180%">
    <feDropShadow dx="0" dy="6" stdDeviation="7" flood-color="#0B0918" flood-opacity="0.38"/>
  </filter>`;

// project palette (src/styles/global/theme.css)
const GOLD = '#F8BD3E';
const ELECTRIC_PINK = '#DE009B';
const ELECTRIC_PURPLE = '#743DF5';
const BACKGROUND = '#1B192A';

const wmFile = JSON.parse(fs.readFileSync(path.join(HERE, 'wordmark.json'), 'utf8'));
const wm = wmFile.real;

// wordmark palette copied from the landing header (Wordmark.tsx + theme.css)
const BRAND_TEXT = [[0,'#DE009B'],[45,'#A32183'],[100,'#743DF5']];
const GOLD_TEXT = [[0,'#F8BD3E'],[50,'#FFE6A3'],[100,'#F8BD3E']];
const BRAND_TEXT_DEEP = [[0,'#B0007B'],[45,'#7C1863'],[100,'#4B21B4']];
const GOLD_TEXT_DEEP = [[0,'#A9700A'],[50,'#C99A41'],[100,'#A9700A']];
const DEG100 = [0.985, 0.174]; // 100deg from CSS, in objectBoundingBox space

const ramp = (id, stops) =>
  `  <linearGradient id="${id}" x1="0" y1="0" x2="${DEG100[0]}" y2="${DEG100[1]}">\n` +
  stops.map(([o, c]) => `    <stop offset="${o}%" stop-color="${c}"/>`).join('\n') +
  `\n  </linearGradient>`;

const wideRamp = (id, stops) =>
  `  <linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${CX - WORDMARK_W / 2}" y1="${wmFile.capTop}" x2="${CX + WORDMARK_W / 2}" y2="${wmFile.capTop + 40}">\n` +
  stops.map(([o, c]) => `    <stop offset="${o}%" stop-color="${c}"/>`).join('\n') +
  `\n  </linearGradient>`;

const ACCENT = [
  wideRamp('g-gold-wide', GOLD_TEXT),
  wideRamp('g-gold-wide-deep', GOLD_TEXT_DEEP),
  ramp('g-ticket', BRAND_TEXT),
  ramp('g-ticket-deep', BRAND_TEXT_DEEP),
  ramp('g-gold-text', GOLD_TEXT),
  ramp('g-gold-text-deep', GOLD_TEXT_DEEP),
].join('\n');

// background: violet core + every project accent, dark corners
const BG_LAYERS = [
  ['bg-core', 0.5, 0.34, 0.85, [[0,'#5B2E88',1],[45,'#2E2049',1],[100,'#12101E',1]]],
  ['bg-ep', 0.16, 0.12, 0.62, [[0,'#743DF5',0.42],[100,'#743DF5',0]]],
  ['bg-pk', 0.12, 0.78, 0.62, [[0,'#DE009B',0.34],[100,'#DE009B',0]]],
  ['bg-tl', 0.9, 0.82, 0.6, [[0,'#178D88',0.34],[100,'#178D88',0]]],
  ['bg-gd', 0.5, 0.3, 0.42, [[0,'#F8BD3E',0.18],[100,'#F8BD3E',0]]],
  ['bg-vg', 0.5, 0.45, 0.78, [[55,'#0E0C18',0],[100,'#0E0C18',0.6]]],
];
const BG = BG_LAYERS.map(([id, cx, cy, r, stops]) =>
  `  <radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">\n` +
  stops.map(([o, c, a]) => `    <stop offset="${o}%" stop-color="${c}" stop-opacity="${a}"/>`).join('\n') +
  `\n  </radialGradient>`
).join('\n');
const bgRects = (w, h) =>
  BG_LAYERS.map(([id]) => `  <rect width="${w}" height="${h}" fill="url(#${id})"/>`).join('\n');

const fan = () =>
  ORDER.map(key => {
    const t = TIERS.find(x => x.key === key);
    return (
      `  <g transform="translate(${CX} ${CY + t.lift}) rotate(${t.angle} 0 ${PIVOT})" filter="url(#ticket-shadow)">\n` +
      `    <g transform="rotate(-90)">\n` +
      `      <image x="${-H / 2}" y="${-W / 2}" width="${H}" height="${W}" href="${art[key]}"/>\n` +
      `    </g>\n` +
      `  </g>`
    );
  }).join('\n');



const RUNS_LIGHT = ['url(#g-gold-wide)', 'url(#g-gold-wide)', 'url(#g-gold-wide)'];
const RUNS_DARK = ['url(#g-gold-wide-deep)', 'url(#g-gold-wide-deep)', 'url(#g-gold-wide-deep)'];

const runPaths = ([a, b, c]) =>
  `  <path fill="${a}" d="${wm.lucky}"/>\n` +
  `  <path fill="${b}" d="${wm.ticket}"/>\n` +
  `  <path fill="${c}" d="${wm.accent}"/>`;

const lockup = (runs, { background = false, w = CANVAS_W, h = CANVAS_H, inner = null } = {}) => {
  const content = `${fan()}\n${runPaths(runs)}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="LuckyTicket365">
<title>LuckyTicket365</title>
<defs>
${SHADOW}
${ACCENT}${background ? '\n' + BG : ''}
</defs>
${background ? bgRects(w, h) + '\n' : ''}${inner ? `  <g transform="${inner}">\n${content}\n  </g>` : content}
</svg>
`;
};

const mark = () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="51 32 638 313" width="638" height="313" role="img" aria-label="LuckyTicket365">
<title>LuckyTicket365 mark</title>
<defs>
${SHADOW}
</defs>
${fan()}
</svg>
`;

const icon = () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024" role="img" aria-label="LuckyTicket365">
<title>LuckyTicket365 icon</title>
<defs>
${SHADOW}
${BG}
</defs>
  <rect width="1024" height="1024" fill="url(#g-bg)"/>
  <g transform="translate(33.2 268.1) scale(1.294)">
${fan()}
  </g>
</svg>
`;

const lockupOnBg = (textFill, accentFill, w, h, inner) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="LuckyTicket365">
<title>LuckyTicket365</title>
<defs>
${SHADOW}
${ACCENT}
${BG}
</defs>
  <rect width="${w}" height="${h}" fill="url(#g-bg)"/>
  <g transform="${inner}">
${fan()}
    <path fill="${textFill}" d="${wm.text}"/>
    <path fill="${accentFill}" d="${wm.accent}"/>
  </g>
</svg>
`;

const files = {
  // 1:1 — ink box is x 61…679, y 42…462 (618×420 around (370, 252));
  // scaled to 88% of the square width and centred on that box, not on the canvas
  'luckyticket365-logo.svg': lockup(RUNS_LIGHT, {
    background: true,
    w: 1200,
    h: 1200,
    inner: 'translate(-32.3 169.3) scale(1.709)',
  }),
  'luckyticket365-logo-transparent.svg': lockup(RUNS_LIGHT),
  'luckyticket365-logo-dark-text.svg': lockup(RUNS_DARK),
  'luckyticket365-mark.svg': mark(),
  'luckyticket365-icon.svg': icon(),
  'luckyticket365-cover.svg': lockup(RUNS_LIGHT, {
    background: true,
    w: 1200,
    h: 630,
    inner: 'translate(211.5 52.5) scale(1.05)',
  }),
};

for (const [name, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(HERE, name), content);
}

// --- 3. PNG exports ---------------------------------------------------------
const jobs = [
  { svg: 'luckyticket365-logo.svg', png: 'luckyticket365-logo.png', w: 2000, h: 2000, transparent: false },
  { svg: 'luckyticket365-logo-transparent.svg', png: 'luckyticket365-logo-transparent.png', w: 2220, h: 1500, transparent: true },
  { svg: 'luckyticket365-logo-dark-text.svg', png: 'luckyticket365-logo-dark-text.png', w: 2220, h: 1500, transparent: true },
  { svg: 'luckyticket365-mark.svg', png: 'luckyticket365-mark.png', w: 1914, h: 939, transparent: true },
  { svg: 'luckyticket365-icon.svg', png: 'luckyticket365-icon.png', w: 1024, h: 1024, transparent: false },
  { svg: 'luckyticket365-cover.svg', png: 'luckyticket365-cover.png', w: 2400, h: 1260, transparent: false },
];

for (const j of jobs) {
  const svg = fs
    .readFileSync(path.join(HERE, j.svg), 'utf8')
    .replace(/width="\d+" height="\d+"/, `width="${j.w}" height="${j.h}"`);
  const page = await browser.newPage({ viewport: { width: j.w, height: j.h } });
  await page.setContent(`<body style="margin:0">${svg}</body>`);
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(HERE, j.png), omitBackground: j.transparent });
  await page.close();
}

await browser.close();
console.log(
  [...Object.keys(files), ...jobs.map(j => j.png)]
    .map(n => `${n}  ${(fs.statSync(path.join(HERE, n)).size / 1024).toFixed(0)}KB`)
    .join('\n')
);
