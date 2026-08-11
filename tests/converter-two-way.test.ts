import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { lcToTon, tonToLc } from '@/utils/global/lc.utils';
import { starsToTon, tonToStars } from '@/utils/pages/wallet.utils';

const root = process.cwd();
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');

/**
 * Both wallet converters take input on EITHER side: type the LC you have or the
 * TON you want, the TON you have or the Lucky Stars you want. That only works
 * while the two directions are one quote read two ways — the moment the inverse
 * drifts from the forward formula, a player types 1 TON, gets an LC figure, and
 * the field they typed into rewrites itself to 0.999.
 */
describe('two-way converter fields', () => {
  const rates = [
    { lcUsd: 0.000001, tonUsd: 1.5 },
    { lcUsd: 0.000001, tonUsd: 1.33 },
    { lcUsd: 0.0000005, tonUsd: 7.42 },
  ];

  it('LC quoted from a TON target always buys at least that TON', () => {
    for (const { lcUsd, tonUsd } of rates) {
      for (const ton of [0.001, 0.1, 0.5, 1, 3.7, 10, 137.25]) {
        const lc = tonToLc(ton, lcUsd, tonUsd);
        expect(Number.isInteger(lc)).toBe(true);
        // Never short: the quote must deliver what was asked for...
        expect(lcToTon(lc, lcUsd, tonUsd)).toBeGreaterThanOrEqual(ton - 1e-12);
        // ...and never generous: the overshoot is the rounding of one whole LC
        // and nothing more, so the field cannot quietly inflate the price.
        expect(lcToTon(lc, lcUsd, tonUsd) - ton).toBeLessThan(lcToTon(1, lcUsd, tonUsd) + 1e-12);
      }
    }
  });

  /**
   * The stars side is NOT a clean round trip, and the modal is built around
   * that: whichever count the player types is what the purchase sends, while
   * the TON box shows `starsToTon` — the exact charge. Feeding that TON back
   * through `tonToStars` can land a single star low (the charge is rounded up
   * to the milli-TON, then floored back into whole stars, on floating point),
   * which is why the typed side stays the authority instead of being re-derived
   * from its own quote.
   */
  it('TON quoted from a stars target stays within a star of it', () => {
    for (const tonUsd of [1.5, 1.33, 7.42]) {
      for (const stars of [1, 50, 500, 1_000, 12_345]) {
        const ton = starsToTon(stars, tonUsd);
        expect(Math.abs(tonToStars(ton, tonUsd) - stars)).toBeLessThanOrEqual(1);
      }
    }
  });

  /**
   * The hook keeps ONE typed string plus which side it came from. Two stored
   * strings is how a converter starts drifting: the derived value is printed
   * into the other field, the next keystroke re-derives from that print, and
   * 5 becomes 4.999 becomes 4.998. This pins the shape, not the arithmetic.
   */
  it('keeps a single source of truth in useConverterAmount', () => {
    const source = read('src/hooks/useConverterAmount.ts');
    const stateCalls = source.match(/useState[(<]/g) ?? [];
    expect(stateCalls).toHaveLength(2); // the raw string + which side it belongs to
    expect(source).not.toMatch(/useEffect/); // no cross-writing between fields
  });

  it('wires both wallet converters through the hook', () => {
    for (const path of [
      'src/components/pages/out-tabs/drawer/lc/LcConvertTonModal.tsx',
      'src/components/pages/out-tabs/drawer/wallet/ExchangeTonStarsModal.tsx',
    ]) {
      const source = read(path);
      expect(source).toMatch(/useConverterAmount/);
      // Both boxes are inputs — a converter with one editable side is the bug
      // this replaced.
      expect(source.match(/<input/g) ?? []).toHaveLength(2);
    }
  });
});
