import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { appConfig } from '@/config/app.config';
import { GlobalConstants } from '@/constants/global.constants';
import { getJackpotWholePotSplit } from '@/utils/global/jackpot.utils';

const docs = readFileSync(resolve(process.cwd(), 'DOCS/DOCS.md'), 'utf8');

describe('DOCS ↔ constants (no drift)', () => {
  it('documents the jackpot accrual percent from config', () => {
    expect(docs).toContain(`${appConfig.jackpot.accrualPercent}% of every tournament's prize pool`);
  });

  it('jackpot whole-pot split matches the documented §20.3 table', () => {
    const split = getJackpotWholePotSplit();
    expect(split).toEqual({ participants: 0, first: 50, second: 30, third: 20 });
    // The table prints each whole-pot share in bold (e.g. "**40%**").
    for (const value of [split.participants, split.first, split.second, split.third]) {
      expect(docs, `whole-pot ${value}% in DOCS`).toContain(`**${value}%**`);
    }
  });

  it('documents the bronze free-stake count from config', () => {
    expect(docs).toContain(`first ${appConfig.stakes.bronzeFreeStartCount} Bronze stakes`);
  });

  it('documents the §14.2 engine price ladder from config', () => {
    for (const price of Object.values(appConfig.economy.engineBasePriceLcByTier)) {
      expect(docs).toContain(price.toLocaleString('en-US'));
    }
    expect(docs).toContain(`base × ${appConfig.economy.engineRepeatPriceGrowth}^(n−1)`);
    expect(docs).toContain(`${appConfig.economy.tournamentHouseEdgeMultiplier} × prizeLcPerSeat`);
  });

  it('documents the stake APR band from config', () => {
    expect(docs).toContain(
      `${appConfig.stakes.aprMinPercent}% at 1 month → ${appConfig.stakes.aprMaxPercent}% at 12 months`
    );
  });

  it('documents the Diamond AP threshold from constants', () => {
    expect(docs).toContain(GlobalConstants.apTierThresholds.diamond.toLocaleString('en-US'));
  });

  it('documents the LC→TON conversion guards from config', () => {
    expect(docs).toContain(`${appConfig.economy.lcConversion.feePercent}% conversion fee`);
    expect(docs).toContain(`$${appConfig.economy.lcConversion.dailyCapUsd}/day`);
  });
});
