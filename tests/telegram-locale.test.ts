import { describe, it, expect } from 'vitest';
import { resolveTelegramLocale } from '@/utils/global/locale.utils';
import { defaultLocale, locales } from '@/i18n/config';

/**
 * Telegram hands every Mini App the player's client language, and the app read
 * it nowhere — so the first launch always rendered English and a Russian player
 * had to go find Settings → Languages. These pin the rules that decide whether
 * a launch adopts that language, because the hook around them only ever runs
 * inside a real Telegram client and cannot be exercised here.
 */
describe('resolveTelegramLocale', () => {
  it('adopts a supported Telegram language on a first launch', () => {
    expect(resolveTelegramLocale({ languageCode: 'ru' })).toBe('ru');
    expect(resolveTelegramLocale({ languageCode: 'de' })).toBe('de');
  });

  it('takes only the language subtag — Telegram also sends ru-RU, de-DE, pt-BR', () => {
    expect(resolveTelegramLocale({ languageCode: 'ru-RU' })).toBe('ru');
    expect(resolveTelegramLocale({ languageCode: 'de-AT' })).toBe('de');
    expect(resolveTelegramLocale({ languageCode: 'EN-GB' })).toBe('en');
  });

  /**
   * The rule that keeps this from being annoying: a cookie is a decision. A
   * player who deliberately picked English must not be flipped back to Russian
   * on every launch just because their phone is Russian.
   */
  it('never overrides an existing choice', () => {
    expect(resolveTelegramLocale({ cookieLocale: 'en', languageCode: 'ru' })).toBeNull();
    expect(resolveTelegramLocale({ cookieLocale: 'ru', languageCode: 'de' })).toBeNull();
  });

  it('leaves an unsupported language on the default rather than writing a bad cookie', () => {
    // Armenian is in the backend enum but is deliberately not a live app
    // language, so it must fall through like any other unsupported one.
    for (const code of ['hy', 'fr', 'zh-CN', 'pt-BR', '']) {
      expect(resolveTelegramLocale({ languageCode: code })).toBeNull();
    }
  });

  it('does nothing when Telegram declares no language at all', () => {
    expect(resolveTelegramLocale({})).toBeNull();
    expect(resolveTelegramLocale({ languageCode: undefined })).toBeNull();
  });

  it('only ever returns a locale the app actually ships', () => {
    const produced = ['ru', 'de', 'en', 'ru-RU', 'hy', 'fr']
      .map(languageCode => resolveTelegramLocale({ languageCode }))
      .filter((l): l is NonNullable<typeof l> => l !== null);

    expect(produced.length).toBeGreaterThan(0);
    for (const locale of produced) expect(locales).toContain(locale);
  });

  it('still seeds when the language equals the default, so later launches short-circuit', () => {
    // Writing the cookie is the point here: it records that the decision was
    // made, so we stop re-reading language_code on every launch.
    expect(resolveTelegramLocale({ languageCode: defaultLocale })).toBe(defaultLocale);
  });
});
