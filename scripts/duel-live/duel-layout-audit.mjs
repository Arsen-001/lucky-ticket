// Замер раскладки дуэли на нескольких размерах телефона.
//
// Смотреть на один снимок бесполезно: все дефекты, которые пользователь ловил
// глазом 24.08.2026, были меньше 10 px. Скрипт проходит экраны игры на 320×568,
// 390×844 и 430×932 и печатает: множитель макета, что вылезло за экран, высоты
// половин стола, зазоры до таблички, круглые ли жетоны.
//
//   BASE=http://localhost:3020 node scripts/duel-live/duel-layout-audit.mjs
//   DEVS=320x568,430x932 node scripts/duel-live/duel-layout-audit.mjs
//
// Ноль в «overflow» и одинаковые числа в «halves»/«toPlate» — единственный
// проходной результат. Снимки ложатся рядом со скриптом (shots/).
import { createRequire } from 'node:module';
import fs from 'node:fs';
const { chromium } = createRequire(new URL('../../', import.meta.url))('playwright');
const OUT = process.env.OUT ?? new URL('./shots/', import.meta.url).pathname;
const BASE = process.env.BASE ?? 'http://localhost:3020';
const DEVS = (process.env.DEVS ?? '320x568,390x844,430x932').split(',').map(x => x.split('x').map(Number));
fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ headless: true });
for (const [w, h] of DEVS) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, locale: 'ru-RU' });
  const p = await ctx.newPage();
  p.setDefaultTimeout(12000);
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  const dialogs = p.locator(':light([role="dialog"])');
  const clear = async () => { for (let i=0;i<10;i++){ if(!(await dialogs.count())) return; const d=dialogs.last(); const btn=d.getByRole('button',{name:/^(continue|продолжить|claim gifts|забрать подарки|next|далее|not now|не сейчас|close|закрыть|ok)$/i}).first(); if(await btn.isVisible().catch(()=>false)) await btn.click({force:true}).catch(()=>{}); else await p.keyboard.press('Escape'); await p.waitForTimeout(420);} };
  await p.goto(`${BASE}/games/duel`, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(2600); await clear();
  if (!p.url().includes('/games/duel')) { await p.goto(`${BASE}/games/duel`); await p.waitForTimeout(2000); await clear(); }
  await p.waitForTimeout(1300);
  const fitInfo = async () => p.evaluate(() => {
    const area = document.querySelector('.duel-fit-area');
    const box = document.querySelector('.duel-fit');
    if (!area || !box) return null;
    const f = x => Math.round(x*10)/10;
    const ar = area.getBoundingClientRect(), br = box.getBoundingClientRect();
    return { fit: getComputedStyle(box).getPropertyValue('--duel-fit').trim(), area: [f(ar.width), f(ar.height)], box: [f(br.width), f(br.height)] };
  });
  const overflow = async () => p.evaluate(() => {
    const f = x => Math.round(x*10)/10;
    const vp = { top: 0, left: 0, right: innerWidth, bottom: innerHeight };
    const bad = [];
    for (const el of document.querySelectorAll('.duel-fit *')) {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      if (r.right > vp.right + 0.5 || r.left < -0.5 || r.bottom > vp.bottom + 0.5 || r.top < -0.5)
        bad.push(`${el.tagName}.${(el.className||'').toString().slice(0,26)} [${f(r.left)},${f(r.top)},${f(r.right)},${f(r.bottom)}]`);
    }
    return bad.slice(0, 5);
  });
  console.log(`\n=== ${w}x${h}`);
  console.log('list', JSON.stringify(await fitInfo()), 'overflow:', JSON.stringify(await overflow()));
  await p.screenshot({ path: `${OUT}/app-list-${w}.png` });
  // экран ставки
  const openBtn = p.getByRole('button', { name: /^(open lobby|открыть лобби)$/i });
  for (let i=0;i<6;i++){ await p.getByRole('button',{name:/create lobby|создать лобби/i}).click({force:true}).catch(()=>{}); await p.waitForTimeout(900); if(await openBtn.isVisible().catch(()=>false)) break; await clear(); }
  await clear();
  await p.screenshot({ path: `${OUT}/app-stake-${w}.png` });
  console.log('stake overflow:', JSON.stringify(await overflow()));
  // ожидание → готовность → матч
  await openBtn.click({ force: true }); await p.waitForTimeout(1400); await clear();
  await p.screenshot({ path: `${OUT}/app-waiting-${w}.png` });
  console.log('waiting overflow:', JSON.stringify(await overflow()));
  const ready = p.getByRole('button', { name: /ready|готов/i }).first();
  await ready.waitFor({ state: 'visible', timeout: 40000 }).catch(()=>{});
  await p.waitForTimeout(300);
  await p.screenshot({ path: `${OUT}/app-ready-${w}.png` });
  console.log('ready overflow:', JSON.stringify(await overflow()));
  await ready.click({ force: true }).catch(()=>{});
  await p.waitForTimeout(2600);
  await p.screenshot({ path: `${OUT}/app-playing-${w}.png` });
  const sym = await p.evaluate(() => {
    const f = x => Math.round(x*10)/10;
    const stage = document.querySelector('.duel-stage');
    if (!stage) return 'нет стола';
    const kids = [...stage.children].map(c => c.getBoundingClientRect());
    const st = stage.getBoundingClientRect();
    const plate = document.querySelector('.duel-plate')?.getBoundingClientRect();
    const toks = [...document.querySelectorAll('.duel-pedestal')].map(e => e.getBoundingClientRect());
    const a = toks[0], c = toks[toks.length-1];
    return { halves: [f(kids[0].height), f(kids[2].height)], edges: [f(kids[0].top - st.top), f(st.bottom - kids[2].bottom)],
             toPlate: plate && a && c ? [f(plate.top - a.bottom), f(c.top - plate.bottom)] : null,
             round: toks.map(r => `${f(r.width)}×${f(r.height)}`) };
  });
  console.log('playing:', JSON.stringify(sym), 'overflow:', JSON.stringify(await overflow()), 'errs:', errs.slice(0,2));
  await ctx.close();
}
await b.close();
