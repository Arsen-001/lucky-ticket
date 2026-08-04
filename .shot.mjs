import { chromium } from '@playwright/test';

const dir = process.argv[2];
const browser = await chromium.launch();

// Narrow-screen check with the longest locale (de).
const context = await browser.newContext({ viewport: { width: 320, height: 700 } });
await context.addCookies([{ name: 'locale', value: 'de', url: 'http://localhost:3000' }]);
const page = await context.newPage();
await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);

const digit = page
  .locator('main span')
  .filter({ hasText: /^\d\d$/ })
  .first();
console.log('DIGIT FONT:', await digit.evaluate(el => getComputedStyle(el).fontFamily));
console.log(
  'BODY OVERFLOWS X:',
  await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
);
const label = page.getByText('SEKUNDEN', { exact: false }).first();
console.log('LABEL CLIPPED:', await label.evaluate(el => el.scrollWidth > el.clientWidth + 1));
await page.screenshot({ path: `${dir}/coming-soon-320-de.png`, fullPage: true });

await browser.close();
