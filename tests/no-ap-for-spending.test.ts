import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { GlobalConstants } from '@/constants/global.constants';
import { AP_SOURCES } from '@/components/pages/out-tabs/drawer/activity/ap-sources';

const read = (file: string) => readFileSync(resolve(process.cwd(), file), 'utf8');

/**
 * Buying pays no AP — in either currency (DOCS §5.3, product call 10.08.2026).
 *
 * This one was a lie the UI told for months: DOCS promised «1 AP per 10 LS» and
 * «1 AP per 2,500 LC», the AP dashboard listed both as earnable sources, and the
 * market's purchase confirmation previewed «+N AP for this purchase» — while the
 * backend granted a point for a purchase exactly nowhere. The fix was to delete
 * the promise, not to build it (tiers are earned by playing, not by paying), so
 * what has to be guarded is the promise coming back on the client alone: nothing
 * here fails a build, and a rate re-added in constants would go straight to a
 * player as a number they can never collect.
 */
describe('spending grants no activity points', () => {
  it('keeps no LC-per-AP or LS-per-AP rate in the constants', () => {
    const rates = Object.keys(GlobalConstants.apRewards).filter(key => /perAp$/i.test(key));
    expect(rates).toEqual([]);
  });

  it('recognises the shape it forbids', () => {
    // Otherwise this passes whether the constant is gone or the pattern is.
    expect(/perAp$/i.test('purchaseLsPerAp')).toBe(true);
  });

  it('lists no purchase or spend row among the AP sources', () => {
    // The stake stays: it pays for locking coins away for months, not for
    // handing them over, and the backend really does credit it (stakes.service).
    const spendSources = AP_SOURCES.filter(source => source.category === 'spend').map(s => s.id);
    expect(spendSources).toEqual(['stake']);
  });

  it('previews no AP in the market purchase modal', () => {
    const modal = read('src/components/pages/tabs/market/MarketPurchaseModal.tsx');
    expect(modal).not.toMatch(/\bap\b/i);
  });
});
