/**
 * Renders PNGs for the vector (*-flat) set. Run after generate-logo.py.
 *   node public/assets/images/logo/export-flat-png.mjs
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const OUT = path.dirname(fileURLToPath(import.meta.url));
const jobs = [
  { svg: 'luckyticket365-logo-flat.svg', png: 'luckyticket365-logo-flat.png', w: 1480, h: 1000, transparent: false },
  { svg: 'luckyticket365-logo-flat-transparent.svg', png: 'luckyticket365-logo-flat-transparent.png', w: 1480, h: 1000, transparent: true },
  { svg: 'luckyticket365-logo-flat-dark-text.svg', png: 'luckyticket365-logo-flat-dark-text.png', w: 1480, h: 1000, transparent: true },
  { svg: 'luckyticket365-mark-flat.svg', png: 'luckyticket365-mark-flat.png', w: 1276, h: 626, transparent: true },
  { svg: 'luckyticket365-icon-flat.svg', png: 'luckyticket365-icon-flat.png', w: 1024, h: 1024, transparent: false },
];
const browser = await chromium.launch();
for (const j of jobs) {
  const svg = fs.readFileSync(`${OUT}/${j.svg}`, 'utf8').replace(/width="\d+" height="\d+"/, `width="${j.w}" height="${j.h}"`);
  const page = await browser.newPage({ viewport: { width: j.w, height: j.h } });
  await page.setContent(`<body style="margin:0">${svg}</body>`);
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${OUT}/${j.png}`, omitBackground: j.transparent });
  await page.close();
}
await browser.close();
console.log('flat pngs done');
