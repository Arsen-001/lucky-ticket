import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { appConfig } from '@/config/app.config';
import { getJackpotWholePotSplit } from '@/utils/global/jackpot.utils';

const docs = readFileSync(resolve(process.cwd(), 'DOCS/DOCS.md'), 'utf8');

describe('DOCS ↔ constants (no drift)', () => {
  it('documents the jackpot accrual percent from config', () => {
    expect(docs).toContain(`${appConfig.jackpot.accrualPercent}% of every tournament's prize pool`);
  });

  it('jackpot whole-pot split matches the documented §20.3 table', () => {
    const split = getJackpotWholePotSplit();
    expect(split).toEqual({ participants: 20, first: 40, second: 24, third: 16 });
    // The table prints each whole-pot share in bold (e.g. "**40%**").
    for (const value of [split.participants, split.first, split.second, split.third]) {
      expect(docs, `whole-pot ${value}% in DOCS`).toContain(`**${value}%**`);
    }
  });

  it('documents the bronze free-stake count from config', () => {
    expect(docs).toContain(`first ${appConfig.stakes.bronzeFreeStartCount} Bronze stakes`);
  });
});
