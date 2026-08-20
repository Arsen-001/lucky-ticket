import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { appConfig } from '@/config/app.config';

/**
 * Telegram-Stars top-up packages — the app promises the bonus, the webhook pays
 * it, and only one of the two is authoritative.
 *
 * The live table is served by `GET /config`; what is pinned here is the bundled
 * fallback the sheet quotes while that query is in flight, plus the rule the
 * bonus is applied by. The rule matters more than the numbers: the sheet also
 * takes a free-typed amount, and an exact-match bonus would make 210⭐ credit
 * less in total than 200⭐ — an inversion a player would rightly call a bug.
 */
const packages = appConfig.wallet.xtrPackages;

/** Mirrors `useStarPackages().bonusFor` and the backend's `starsPurchaseBonus`. */
const bonusFor = (stars: number) =>
  packages.reduce((bonus, pkg) => (stars >= pkg.stars ? Math.max(bonus, pkg.bonus) : bonus), 0);

describe('Telegram Stars packages', () => {
  it('offers the four packages the product decision named', () => {
    expect(packages.map(p => [p.stars, p.bonus])).toEqual([
      [50, 10],
      [100, 20],
      [200, 50],
      [500, 100],
    ]);
    // Buying the whole ladder once (850⭐) hands over 180 LS on top.
    expect(packages.reduce((sum, p) => sum + p.bonus, 0)).toBe(180);
  });

  it('pays the bonus by amount paid, never by which button was tapped', () => {
    expect(bonusFor(49)).toBe(0);
    expect(bonusFor(50)).toBe(10);
    expect(bonusFor(199)).toBe(20);
    expect(bonusFor(210)).toBe(50);
    expect(bonusFor(5000)).toBe(100);
  });

  it('never credits less in total for paying more', () => {
    let prev = 0;
    for (let paid = 0; paid <= 600; paid += 1) {
      const total = paid + bonusFor(paid);
      expect(total).toBeGreaterThanOrEqual(prev);
      prev = total;
    }
  });
});

const backendPath = resolve(
  process.cwd(),
  '../lucky-ticket-backend/src/common/economy.constants.ts'
);
const hasBackend = existsSync(backendPath);

describe.skipIf(!hasBackend)('backend ↔ frontend package parity', () => {
  it('economy.constants.ts holds the same four rows', () => {
    const source = readFileSync(backendPath, 'utf8');
    const block = source.slice(source.indexOf('xtrPackages: ['));
    for (const pkg of packages) {
      expect(block.slice(0, block.indexOf(']'))).toContain(
        `{ stars: ${pkg.stars}, bonus: ${pkg.bonus}`
      );
    }
  });
});
