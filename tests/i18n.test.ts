import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

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
