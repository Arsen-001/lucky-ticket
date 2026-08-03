/**
 * Renders the picture the channel posts when a pre-launch gift goes out.
 *
 * A script rather than a hand-made file so the card can be re-cut when the copy
 * or the palette moves: run it, commit the PNG. The output lives in `public/`
 * because Telegram fetches the image by URL — it has to be reachable from the
 * outside, and the Mini App is already a public origin.
 *
 *   node scripts/build-gift-post-image.mjs
 *
 * The bear is the system emoji glyph: it is what the mock was approved on, and
 * it is a placeholder for real artwork — the URL is admin-editable, so swapping
 * it later is a field edit, not a deploy.
 */
import { chromium } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const OUT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../public/assets/images/gift-post.png'
);

/** 5:4 — the crop the mock settled on: mostly bear, little sky. */
const WIDTH = 1000;
const HEIGHT = 800;

/** Confetti: generated from a fixed seed so every run cuts the same picture. */
const CONFETTI = String.raw`
  const PALETTE = ['#de009b', '#743df5', '#f8bd3e', '#ffe6a3', '#ef6ba4', '#ffffff'];
  const c = document.getElementById('confetti');
  const ctx = c.getContext('2d');
  c.width = ${WIDTH};
  c.height = ${HEIGHT};
  let seed = 20260804;
  const rnd = () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = 0; i < 260; i++) {
    const x = rnd() * ${WIDTH};
    const y = rnd() * ${HEIGHT};
    const dx = (x - ${WIDTH} / 2) / (${WIDTH} / 2);
    const dy = (y - ${HEIGHT} / 2) / (${HEIGHT} / 2);
    const edge = Math.min(1, Math.hypot(dx, dy));
    // The middle belongs to the bear and the lockup; confetti behind type is noise.
    if (rnd() > edge * 0.95 + 0.08) continue;
    const size = 10 + rnd() * 22;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rnd() * Math.PI);
    ctx.globalAlpha = (0.25 + rnd() * 0.5) * (0.45 + edge * 0.55);
    ctx.fillStyle = PALETTE[Math.floor(rnd() * PALETTE.length)];
    const shape = rnd();
    if (shape < 0.62) ctx.fillRect(-size / 2, -size / 4, size, size / 2);
    else if (shape < 0.85) ctx.fillRect(-size / 8, -size, size / 4, size * 2);
    else { ctx.beginPath(); ctx.arc(0, 0, size / 3, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  }
`;

const HTML = `<!doctype html>
<html><head><meta charset="utf-8"><style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { width: ${WIDTH}px; height: ${HEIGHT}px; overflow: hidden; }
  .card {
    position: relative; width: ${WIDTH}px; height: ${HEIGHT}px;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    background:
      radial-gradient(100% 85% at 50% 40%, rgba(239,107,164,0.5), transparent 68%),
      linear-gradient(155deg, #2d1d50, #120e1c);
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  }
  #confetti { position: absolute; inset: 0; }
  .bear { position: relative; font-size: 340px; line-height: 0.92;
          filter: drop-shadow(0 22px 40px rgba(0,0,0,0.55)); }
  .foot { position: relative; display: flex; flex-direction: column;
          align-items: center; gap: 14px; margin-top: 46px; }
  .label { font-size: 27px; letter-spacing: 0.2em; text-transform: uppercase;
           font-weight: 700; color: #f6ddec; }
  .wordmark { font-size: 40px; font-weight: 700; letter-spacing: -0.01em; line-height: 1; }
  .lucky { color: #fff; }
  .ticket, .n365 { -webkit-background-clip: text; background-clip: text; color: transparent; }
  /* Brand gradients copied verbatim from the admin panel's globals.css. */
  .ticket { background-image: linear-gradient(100deg, #de009b 0%, #a32183 45%, #743df5 100%); }
  .n365 { background-image: linear-gradient(100deg, #f8bd3e 0%, #ffe6a3 50%, #f8bd3e 100%); }
</style></head>
<body>
  <div class="card">
    <canvas id="confetti"></canvas>
    <span class="bear">🧸</span>
    <div class="foot">
      <span class="label">Подарок за пятерых друзей</span>
      <span class="wordmark"><span class="lucky">Lucky</span><span class="ticket">Ticket</span><span class="n365">365</span></span>
    </div>
  </div>
  <script>${CONFETTI}</script>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: WIDTH, height: HEIGHT },
  deviceScaleFactor: 1,
});
await page.setContent(HTML, { waitUntil: 'load' });
await page.screenshot({ path: OUT });
await browser.close();
console.log(`gift post image → ${OUT}`);
