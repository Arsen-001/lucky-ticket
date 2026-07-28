import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { AchievementCategory, AchievementRarity } from '@/types/enums/achievement.enums';
import { LcTransactionFilter } from '@/types/enums/lc.enums';
import { StarsTransactionFilter } from '@/types/enums/stars.enums';
import { TicketsEnum } from '@/types/enums/ticket.enums';
import { WalletTransactionFilter, WalletTransactionStatus } from '@/types/enums/wallet.enums';
import { marketMock } from '@/mock/market.mock';

const LOCALES = ['en', 'ru', 'de'] as const;

const load = (locale: string): Record<string, string> =>
  JSON.parse(readFileSync(resolve(process.cwd(), `messages/${locale}.json`), 'utf8'));

const messages: Record<string, Record<string, string>> = {};
for (const locale of LOCALES) messages[locale] = load(locale);

describe('i18n message parity', () => {
  const enKeys = Object.keys(messages.en);

  it('every locale has the same number of keys', () => {
    for (const locale of LOCALES) {
      expect(Object.keys(messages[locale]).length, `${locale} key count`).toBe(enKeys.length);
    }
  });

  for (const locale of LOCALES) {
    it(`${locale} has exactly the en key set (no missing / extra)`, () => {
      const localeKeys = new Set(Object.keys(messages[locale]));
      const enKeySet = new Set(enKeys);
      const missing = enKeys.filter(k => !localeKeys.has(k));
      const extra = Object.keys(messages[locale]).filter(k => !enKeySet.has(k));
      expect({ missing, extra }).toEqual({ missing: [], extra: [] });
    });
  }

  for (const locale of LOCALES) {
    it(`${locale} has no empty values`, () => {
      const empties = Object.entries(messages[locale])
        .filter(([, v]) => typeof v !== 'string' || v.trim() === '')
        .map(([k]) => k);
      expect(empties).toEqual([]);
    });
  }
});

/**
 * Keys the UI builds at runtime (`t(\`${tier} ticket\`)`, `t(\`lc filter ${f}\`)`…)
 * are invisible to a grep over the source, so a dead-key sweep happily deletes
 * them and the app then renders a raw MISSING_MESSAGE at runtime — which is
 * exactly how the five `<tier> ticket` keys disappeared in `501fa9b`. Each family
 * is enumerated from the enum that feeds it, so adding a tier / filter value
 * without its copy fails here instead of in production.
 */
describe('i18n runtime-built keys', () => {
  const MONTHS = [
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december',
  ];

  const families: Record<string, string[]> = {
    '<tier> ticket': Object.values(TicketsEnum).map(tier => `${tier} ticket`),
    'lc filter <f>': Object.values(LcTransactionFilter).map(f => `lc filter ${f}`),
    'stars filter <f>': Object.values(StarsTransactionFilter).map(f => `stars filter ${f}`),
    'wallet filter <f>': Object.values(WalletTransactionFilter).map(f => `wallet filter ${f}`),
    'wallet status <s>': Object.values(WalletTransactionStatus).map(s => `wallet status ${s}`),
    'rarity <r>': Object.values(AchievementRarity).map(r => `rarity ${r}`),
    'category <c>': Object.values(AchievementCategory).map(c => `category ${c}`),
    // `dayjs().format('MMMM').toLowerCase()` — profile "member since", notifications
    '<month>': MONTHS,
    // Market cosmetics render `avatar boost ${type}`; the mock mirrors the
    // backend's avatars catalog, so a new boost type lands here first.
    'avatar boost <t>': [
      ...new Set(
        marketMock.cosmetics.flatMap(c =>
          c.avatarBoost ? [`avatar boost ${c.avatarBoost.type}`] : []
        )
      ),
    ],
    // Status perk rows call t(privilege) on raw strings the backend sends —
    // nothing type-checks these, so they need the same explicit guard.
    'status privilege': [...new Set(marketMock.statuses.flatMap(s => s.privileges ?? []))],
  };

  for (const [family, keys] of Object.entries(families)) {
    it(`en resolves every ${family} key`, () => {
      // A family that collapsed to [] would pass the membership check while
      // guarding nothing — the mock-derived ones can do exactly that.
      expect(keys.length).toBeGreaterThan(0);
      expect(keys.filter(k => !(k in messages.en))).toEqual([]);
    });
  }
});
