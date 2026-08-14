import { describe, expect, it } from 'vitest';
import {
  formatCompact,
  formatCompactPrice,
  formatNumber,
  formatTicketRate,
  setNumberLocale,
} from '@/utils/global/number.utils';
import { locales } from '@/i18n/config';

/**
 * Numbers were hardcoded to `en-US` everywhere, so a German reader saw
 * `1,234.56` where their language writes `1.234,56`. Fixing that opened a
 * second question the fix must not answer wrongly: `Intl` defaults Arabic to
 * Arabic-Indic digits, which would show a balance of 1234 LC as `١٢٣٤`.
 *
 * The decision was: separators follow the language, digits never do.
 */
describe('number formatting follows the language', () => {
  it('uses each language’s own separators', () => {
    setNumberLocale('en');
    expect(formatNumber(1234567)).toBe('1,234,567');

    setNumberLocale('de');
    expect(formatNumber(1234567)).toBe('1.234.567');

    setNumberLocale('ru');
    // Russian groups with a non-breaking space, not a comma.
    expect(formatNumber(1234567).replace(/ | /g, ' ')).toBe('1 234 567');
  });

  /**
   * The one that would have shipped silently: nothing throws, nothing looks
   * broken in review, and only an Arabic-reading player sees a balance they
   * cannot compare against the leaderboard beside it.
   */
  it('never switches away from Latin digits, in any language', () => {
    const arabicIndic = /[٠-٩۰-۹०-९]/;

    for (const locale of locales) {
      setNumberLocale(locale);
      for (const format of [formatNumber, formatCompact, formatCompactPrice, formatTicketRate]) {
        const rendered = format(1234567);
        expect({ locale, rendered, hasNonLatinDigits: arabicIndic.test(rendered) }).toEqual({
          locale,
          rendered,
          hasNonLatinDigits: false,
        });
      }
    }
  });

  it('falls back to the default language for a code that is not live', () => {
    setNumberLocale('en');
    const english = formatNumber(1234567);
    setNumberLocale('xx');
    expect(formatNumber(1234567)).toBe(english);
  });

  /**
   * Sub-1 production rates must keep their fraction: a base bronze engine mints
   * 0.5 tickets an hour, and rounding that to "1" doubles what the screen
   * promises. This survived the move to locale-aware formatting only because it
   * is asserted here.
   */
  it('keeps the fraction on sub-1 ticket rates', () => {
    setNumberLocale('en');
    expect(formatTicketRate(0.5)).toBe('0.5');
    expect(formatTicketRate(0.05)).toBe('0.05');
    expect(formatTicketRate(0)).toBe('0');
  });

  it('does not over-round market prices', () => {
    setNumberLocale('en');
    expect(formatCompactPrice(1250)).toBe('1.25K');
  });
});
