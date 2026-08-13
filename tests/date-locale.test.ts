import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import dayjs from 'dayjs';
import { englishMonthKey, setDayjsLocale } from '@/lib/dayjs/locale';
import { formatLocalDate } from '@/utils/global/date.utils';
import { locales } from '@/i18n/config';

const root = process.cwd();

const sourceFiles = (dir: string): string[] =>
  readdirSync(resolve(root, dir), { withFileTypes: true }).flatMap(entry => {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(entry.name) ? [path] : [];
  });

const SAMPLE = '2026-08-06T10:30:00Z';

describe('localized dates', () => {
  /**
   * dayjs ships English only — every other locale is an opt-in import, and
   * nothing imported one. So a Russian or German reader saw English month
   * names everywhere the app prints a date.
   */
  it('prints month names in the reader’s language', () => {
    setDayjsLocale('ru');
    expect(dayjs(SAMPLE).format('MMMM')).toBe('август');
    setDayjsLocale('de');
    expect(dayjs(SAMPLE).format('MMMM')).toBe('August');
    setDayjsLocale('en');
    expect(dayjs(SAMPLE).format('MMMM')).toBe('August');
  });

  /**
   * `MMM D, YYYY` is the American order, not a neutral one: it put the month
   * first for German readers too, where the date reads `6. Aug. 2026`.
   */
  it('follows each language’s own date order', () => {
    setDayjsLocale('en');
    expect(formatLocalDate(SAMPLE)).toBe('Aug 6, 2026');
    setDayjsLocale('de');
    expect(formatLocalDate(SAMPLE)).toMatch(/^6\.\s*Aug\.?\s*2026$/);
    setDayjsLocale('ru');
    expect(formatLocalDate(SAMPLE)).toMatch(/^6 авг\.? 2026/);
  });

  it('returns an empty string rather than "Invalid Date" for a missing date', () => {
    expect(formatLocalDate(undefined)).toBe('');
    expect(formatLocalDate('')).toBe('');
  });

  it('falls back to the default language for an unknown locale', () => {
    setDayjsLocale('xx');
    expect(dayjs(SAMPLE).format('MMMM')).toBe('August');
  });

  /**
   * Every selectable language must actually have its dayjs locale imported.
   *
   * This is the one that would otherwise ship broken. dayjs locales are opt-in
   * imports, and `dayjs.locale('es')` with nothing imported does not throw and
   * does not fall back — it leaves the *previous* locale in place. So a missing
   * import shows up as dates in whatever language the last reader had, which
   * looks like a caching bug rather than a missing import.
   *
   * Asserting on the prefix rather than equality covers the three codes where
   * dayjs names the locale by region: `hy-am`, `pt-br`, `zh-cn`.
   */
  it('has a dayjs locale loaded for every selectable language', () => {
    const unloaded = locales.filter(code => {
      setDayjsLocale('en');
      setDayjsLocale(code);
      return !dayjs.locale().startsWith(code);
    });
    expect(unloaded).toEqual([]);
  });

  /**
   * Two screens build a TRANSLATION KEY out of the month name — `t('august')`.
   * Once the global locale moved they would have asked for `t('август')` and
   * rendered the raw key on screen. This is the guard on that.
   */
  it('keeps the month translation key English in every locale', () => {
    for (const locale of locales) {
      setDayjsLocale(locale);
      expect(englishMonthKey(dayjs(SAMPLE))).toBe('august');
    }
  });

  it('leaves the global locale untouched when reading the English key', () => {
    setDayjsLocale('ru');
    englishMonthKey(dayjs(SAMPLE));
    expect(dayjs(SAMPLE).format('MMMM')).toBe('август');
  });

  it('has both key-building screens reading through the helper', () => {
    for (const file of [
      'src/utils/pages/notification.utils.ts',
      'src/components/pages/out-tabs/drawer/profile/ProfileFooter.tsx',
    ]) {
      const source = readFileSync(resolve(root, file), 'utf8');
      expect(source).toContain('englishMonthKey');
      expect(source).not.toMatch(/format\('MMMM'\)\.toLowerCase\(\)/);
    }
  });

  it('has no American-ordered date pattern left in the app', () => {
    const offenders = sourceFiles('src').filter(file =>
      /format\(['"]MMM D,/.test(readFileSync(resolve(root, file), 'utf8'))
    );
    expect(offenders).toEqual([]);
  });

  /**
   * The locales only load if something imports them — an unmounted provider
   * would leave every date English again while all the tests above still pass.
   */
  it('mounts the locale provider in the root layout', () => {
    const layout = readFileSync(resolve(root, 'src/app/layout.tsx'), 'utf8');
    expect(layout).toContain('<DayjsLocaleProvider>');
  });
});
