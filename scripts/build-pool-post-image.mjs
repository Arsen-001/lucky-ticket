/**
 * Renders the picture for the channel post that announces the bigger Bronze
 * Arena prize pool (100 000 → 110 000 LC, and it climbs with the crowd).
 *
 *   node scripts/build-pool-post-image.mjs
 *
 * A script rather than a hand-cut file, for the same reason as
 * `build-gift-post-image.mjs`: the number in it is a live setting, so the
 * banner has to be re-cuttable when the pool moves again. Output goes to
 * `public/` because Telegram fetches the image by URL and the Mini App is
 * already a public origin.
 *
 * The layout is banner **F** from the variant sheet the copy was picked on —
 * ticket stack, two coins, one number, no painted CTA (Telegram draws the real
 * button under the post, and a second, dead one is worse than none).
 */
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, 'public/assets/images/pool-post-plus10.png');

/** 16:9 — the ratio Telegram gives a photo post the most height at. */
const WIDTH = 1280;
const HEIGHT = 720;

const dataUri = (path, mime) =>
  `data:${mime};base64,${readFileSync(resolve(ROOT, path)).toString('base64')}`;

/**
 * Four faces, not six. Weight 600 in the type below intentionally falls back to
 * Bold — that is what the approved mock rendered, and shipping SemiBold here
 * would quietly redraw two lines of the banner.
 */
const FACES = [
  [900, 'src/fonts/gilroy/Gilroy-Black.woff2'],
  [800, 'src/fonts/gilroy/Gilroy-ExtraBold.woff2'],
  [700, 'src/fonts/gilroy/Gilroy-Bold.woff2'],
  [500, 'src/fonts/gilroy/Gilroy-Medium.woff2'],
]
  .map(
    ([weight, file]) =>
      `@font-face { font-family: 'Gilroy'; src: url(${dataUri(file, 'font/woff2')}) format('woff2'); font-weight: ${weight}; }`
  )
  .join('\n  ');

/** The objects are the game's own art, not stand-ins drawn for the poster. */
const COIN = dataUri('public/assets/icons/currencies/lc-coin.webp', 'image/webp');
const TICKETS = dataUri('public/assets/icons/tickets/bronze-ticket-overlap.webp', 'image/webp');

const HTML = `<!doctype html>
<html><head><meta charset="utf-8"><style>
  ${FACES}

  :root {
    --gold: #f8bd3e;
    --brand-grad: linear-gradient(100deg, #de009b 0%, #a32183 45%, #743df5 100%);
    --gold-grad: linear-gradient(100deg, #f8bd3e 0%, #ffe6a3 50%, #f8bd3e 100%);
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { width: ${WIDTH}px; height: ${HEIGHT}px; overflow: hidden;
         font-family: 'Gilroy', ui-sans-serif, system-ui, sans-serif; font-weight: 500;
         line-height: 1.5; -webkit-font-smoothing: antialiased; }

  .board { width: ${WIDTH}px; height: ${HEIGHT}px; position: relative;
           background: #1b1930; color: #fff; overflow: hidden; }
  .board::before, .board::after { content: ''; position: absolute; border-radius: 50%; filter: blur(90px); }
  .board::before { width: 780px; height: 780px; left: -240px; top: -320px;
                   background: radial-gradient(circle, rgba(222,0,155,.42), transparent 68%); }
  .board::after { width: 900px; height: 900px; right: -300px; bottom: -420px;
                  background: radial-gradient(circle, rgba(116,61,245,.42), transparent 68%); }
  .b-inner { position: relative; z-index: 2; height: 100%; padding: 62px 72px; display: flex; flex-direction: column; }
  .b-top { display: flex; align-items: center; justify-content: space-between; }

  /* Brand gradients copied verbatim from the admin panel's globals.css.
     background-image, never the background shorthand — the shorthand resets
     background-clip and the word paints as a solid rectangle. */
  .b-mark { font-weight: 800; font-size: 36px; letter-spacing: -.01em; white-space: nowrap; }
  .b-mark .l { color: #fff; }
  .b-mark .t { background-image: var(--brand-grad); -webkit-background-clip: text; background-clip: text; color: transparent; }
  .b-mark .n { background-image: var(--gold-grad); -webkit-background-clip: text; background-clip: text; color: transparent; }
  .b-tag { font-size: 21px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: var(--gold); }

  .b-foot { display: flex; align-items: center; justify-content: flex-end; }
  .b-note { font-size: 24px; font-weight: 600; color: #cfc9e6; }

  .coin { background-image: url(${COIN}); background-size: contain; background-repeat: no-repeat; }
  .tickets { background-image: url(${TICKETS}); background-size: contain; background-repeat: no-repeat; }

  .f-mid { flex: 1; display: flex; align-items: center; gap: 40px; }
  .f-stage { flex: 1.05; position: relative; height: 100%; }
  .f-glow { position: absolute; inset: 8% -6% 8% -6%;
            background: radial-gradient(ellipse at 45% 50%, rgba(222,0,155,.34), transparent 66%); }
  .f-tickets { position: absolute; width: 470px; height: 323px; left: -30px; top: 50%;
               transform: translateY(-50%) rotate(-7deg); filter: drop-shadow(0 30px 40px rgba(0,0,0,.55)); }
  .f-coin1 { position: absolute; width: 132px; height: 142px; right: 34px; top: 24px; transform: rotate(12deg);
             filter: drop-shadow(0 14px 20px rgba(0,0,0,.5)); }
  .f-coin2 { position: absolute; width: 96px; height: 103px; right: 118px; bottom: 8px; transform: rotate(-16deg);
             filter: drop-shadow(0 14px 20px rgba(0,0,0,.5)); }
  .f-right { flex: 1; }
  .f-num { font-size: 96px; font-weight: 900; line-height: .96; letter-spacing: -.03em; }
  .f-num em { font-style: normal; display: block; font-size: 34px; font-weight: 800; letter-spacing: .12em;
              text-transform: uppercase; color: var(--gold); margin-bottom: 12px; }
  .f-num small { display: block; font-size: 30px; font-weight: 700; color: #cfc9e6; letter-spacing: 0; margin-top: 10px; }
  .f-list { margin-top: 26px; display: flex; flex-direction: column; gap: 12px; font-size: 25px; font-weight: 600; color: #cfc9e6; }
  .f-list div { display: flex; align-items: center; gap: 14px; }
  .f-list div::before { content: ''; width: 10px; height: 10px; border-radius: 50%; background-image: var(--gold-grad); flex: none; }
  .f-list b { color: #fff; font-weight: 800; }
</style></head>
<body>
  <div class="board">
    <div class="b-inner">
      <div class="b-top">
        <div class="b-mark"><span class="l">Lucky</span><span class="t">Ticket</span><span class="n">365</span></div>
        <div class="b-tag">Bronze Arena</div>
      </div>
      <div class="f-mid">
        <div class="f-stage">
          <div class="f-glow"></div>
          <div class="tickets f-tickets"></div>
          <div class="coin f-coin1"></div>
          <div class="coin f-coin2"></div>
        </div>
        <div class="f-right">
          <div class="f-num">
            <em>Prize pool +10%</em>
            110,000 LC
            <small>every tournament, four a day</small>
          </div>
          <div class="f-list">
            <div>Free bronze tickets from your engine</div>
            <div><b>More players, bigger pool</b></div>
          </div>
        </div>
      </div>
      <div class="b-foot">
        <div class="b-note">t.me/luckyticket365_bot</div>
      </div>
    </div>
  </div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: WIDTH, height: HEIGHT },
  deviceScaleFactor: 1,
});
await page.setContent(HTML, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: OUT });
await browser.close();
console.log(`pool post image → ${OUT}`);
