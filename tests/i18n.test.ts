import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { locales } from '@/i18n/config';
import { AchievementCategory, AchievementRarity } from '@/types/enums/achievement.enums';
import { LcTransactionFilter } from '@/types/enums/lc.enums';
import { StarsTransactionFilter } from '@/types/enums/stars.enums';
import { TicketsEnum } from '@/types/enums/ticket.enums';
import { WalletTransactionFilter, WalletTransactionStatus } from '@/types/enums/wallet.enums';
import { marketMock } from '@/mock/market.mock';
import { buildStatusPerkRows } from '@/utils/global/status-perks.utils';
import type { Dictionary } from '@/types/types/i18n.types';

/**
 * Every dictionary that exists on disk — read, not listed.
 *
 * This was a hand-written `['en', 'ru', 'de']`, i.e. a third copy of the locale
 * list (after the enum and `i18n/config.ts`) that had to be remembered. Adding
 * a language and forgetting this line is silent in the worst way: the suite
 * goes green while the new dictionary is checked by nobody. Reading the folder
 * means a file cannot be added without also being verified.
 */
const LOCALES = readdirSync(resolve(process.cwd(), 'messages'))
  .filter(name => name.endsWith('.json'))
  .map(name => name.replace(/\.json$/, ''))
  .sort();

const load = (locale: string): Record<string, string> =>
  JSON.parse(readFileSync(resolve(process.cwd(), `messages/${locale}.json`), 'utf8'));

const messages: Record<string, Record<string, string>> = {};
for (const locale of LOCALES) messages[locale] = load(locale);

describe('i18n message parity', () => {
  const enKeys = Object.keys(messages.en);

  /**
   * The guard on promoting a language too early.
   *
   * next-intl renders the raw key when a message is missing, so a code listed
   * in `locales` without a complete dictionary behind it puts strings like
   * `min length is {num}` on screen in production. Nothing else catches that:
   * the enum, the switcher and the cookie all accept the code happily, and a
   * missing message is a runtime event, not a build error.
   *
   * Together with the parity assertions below this makes the rule mechanical —
   * a language reaches players only once its file has the full key set.
   */
  it('every selectable locale has a dictionary on disk', () => {
    expect(locales.filter(code => !LOCALES.includes(code))).toEqual([]);
  });

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
 * The two things about a translation that are checkable without knowing the
 * language — and the two that actually break the app rather than just reading
 * badly.
 *
 * This matters more the more languages ship: nobody here reads Kazakh or
 * Korean, so "is this right?" cannot be answered by looking. What CAN be
 * answered by looking is whether the machinery inside the string survived, and
 * that is where translation goes wrong destructively rather than cosmetically.
 */
describe('i18n translation integrity', () => {
  /**
   * The ARGUMENT NAMES a string interpolates — `num`, `days`, `count` — and
   * nothing else.
   *
   * Deliberately not "every `{…}` in the string": many of these are ICU plurals
   * (`{count, plural, one {# друг} other {# друзей}}`) whose inner braces hold
   * translated prose, and whose set of forms legitimately differs by language —
   * Russian has four categories where German has two. Comparing those would
   * fail every correct translation. What must match across languages is which
   * values the string asks the app to supply.
   */
  const placeholders = (value: string): string[] => {
    const names: string[] = [];
    let depth = 0;
    for (let i = 0; i < value.length; i += 1) {
      if (value[i] === '}') {
        depth -= 1;
        continue;
      }
      if (value[i] !== '{') continue;
      // Only a brace opened at the outermost level introduces an argument.
      // Braces inside a plural body wrap translated prose — `other {Geschafft}`
      // is a German word, not a value the app supplies.
      if (depth === 0) {
        const name = /^\{\s*([a-zA-Z0-9_]+)\s*(?:,|\})/.exec(value.slice(i))?.[1];
        if (name) names.push(name);
      }
      depth += 1;
    }
    return names.sort();
  };

  /**
   * `{num}`, `{days}`, `{from}` are interpolation slots, not words. A translator
   * — human or machine — who renders `{days}` as `{дней}` produces a string
   * next-intl cannot fill: the value never appears and the reader sees the
   * literal braces. Nothing else catches it; the file is valid JSON, the key
   * exists, parity passes.
   */
  for (const locale of LOCALES.filter(l => l !== 'en')) {
    it(`${locale} keeps every interpolation placeholder intact`, () => {
      const broken = Object.entries(messages.en)
        .filter(([key, english]) => {
          const translated = messages[locale][key];
          if (typeof translated !== 'string') return false;
          return placeholders(english).join() !== placeholders(translated).join();
        })
        .map(([key]) => ({
          key,
          en: placeholders(messages.en[key]),
          [locale]: placeholders(messages[locale][key]),
        }));
      expect(broken).toEqual([]);
    });
  }

  /**
   * Names that stay in Latin script in every language: the brand, the two
   * currencies, and the status tier. `LC` translated into Cyrillic as `ЛК` — or
   * worse, into a word — silently forks the currency's name across the app,
   * and the player has no way to tell it is the same thing as the balance on
   * the next screen.
   *
   * Only asserted where English actually uses the token, so a language is free
   * to phrase the sentence around it however it likes.
   */
  const VERBATIM = ['LuckyTicket365', 'LC', 'XTR', 'VIP', 'TON'];

  for (const locale of LOCALES.filter(l => l !== 'en')) {
    it(`${locale} leaves brand and currency names untranslated`, () => {
      const lost = Object.entries(messages.en).flatMap(([key, english]) => {
        const translated = messages[locale][key];
        if (typeof translated !== 'string') return [];
        return VERBATIM.filter(
          token => new RegExp(`\\b${token}\\b`).test(english) && !translated.includes(token)
        ).map(token => `${key} → lost "${token}"`);
      });
      expect(lost).toEqual([]);
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
    // The VIP / Lucky Player perk rows are built from the LIVE status config,
    // and two of their keys are runtime strings the backend picks (the ticket
    // tier a send row lists, the tier of the daily gift) — nothing type-checks
    // those. Running the real builder over the mock ladder records every key it
    // asks for, so a new perk row or a new tier fails here, not in production.
    'status perk row': (() => {
      const asked = new Set<string>();
      const record = ((key: string) => {
        asked.add(key);
        return key;
      }) as unknown as Dictionary;
      for (const status of marketMock.statuses) {
        if (status.perks)
          buildStatusPerkRows(status.perks, status.perkBase, record, status.dailyGift);
        for (const rung of status.levelPerks ?? [])
          buildStatusPerkRows(rung.perks, status.perkBase, record);
      }
      return [...asked];
    })(),
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
