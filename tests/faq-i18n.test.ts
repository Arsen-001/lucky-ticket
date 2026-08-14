import { describe, expect, it } from 'vitest';
import { faqMock } from '@/mock/faq.mock';
import { locales } from '@/i18n/config';
import { getLocalizedText } from '@/utils/pages/faq.utils';

/**
 * The FAQ is the one screen where the app speaks in paragraphs, and its copy
 * does NOT come from `messages/*.json` — so none of the dictionary guards cover
 * it. It sat in four languages while the interface around it spoke eighteen: a
 * Turkish player read Turkish buttons and English help articles.
 *
 * These check what a reader of a language nobody here speaks cannot: that every
 * article exists in every live language, that the figures a support article
 * exists to state survived translation, and that the product's own names came
 * through untranslated.
 *
 * What they cannot check is whether the prose is any good. No native speaker
 * has read the fifteen generated languages.
 */
describe('FAQ knowledge base', () => {
  const FIELDS = ['title', 'description', 'content'] as const;

  it('has every article in every language the app ships', () => {
    const missing: string[] = [];
    for (const article of faqMock.articles) {
      for (const field of FIELDS) {
        for (const locale of locales) {
          if (!article[field]?.[locale]) missing.push(`${article.id}.${field}/${locale}`);
        }
      }
    }
    expect(missing).toEqual([]);
  });

  it('has every section title in every language', () => {
    const missing: string[] = [];
    for (const section of faqMock.sections) {
      for (const locale of locales) {
        if (!section.title?.[locale]) missing.push(`${section.id}/${locale}`);
      }
    }
    expect(missing).toEqual([]);
  });

  /**
   * A support article that states "4% of that prize" must not say 40% in
   * another language. One-directional: a language may write a numeral where
   * English spells the word ("a third" → 第3), but it may not drop a figure the
   * English states.
   */
  it('keeps every figure the English states', () => {
    const numbersOf = (text: string): string[] =>
      text
        .replace(/(?<=\d)[\s  ](?=\d{3}\b)/g, '')
        .replace(/(?<=\d)[.,](?=\d{3}\b)/g, '')
        .replace(/(?<=\d),(?=\d)/g, '.')
        .match(/\d+(?:\.\d+)?/g) ?? [];

    const lost: string[] = [];
    for (const article of faqMock.articles) {
      for (const field of FIELDS) {
        const english = article[field]?.en;
        if (!english) continue;
        const expected = numbersOf(english);
        if (expected.length === 0) continue;

        for (const locale of locales) {
          const text = article[field]?.[locale];
          if (!text) continue;
          const present = new Set(numbersOf(text));
          const gone = expected.filter(n => !present.has(n));
          if (gone.length) lost.push(`${article.id}.${field}/${locale}: ${gone.join(',')}`);
        }
      }
    }
    expect(lost).toEqual([]);
  });

  /**
   * `LC` is the coin's name, `AP` the progression metric, `TON` the chain. A
   * reader who meets a translated version of any of them will not find it on a
   * single screen of the app.
   */
  it('carries the product names through untranslated', () => {
    const TOKENS = ['LuckyTicket365', 'Lucky Stars', 'Lucky Player', 'TON', 'VIP', 'LC', 'AP'];

    /**
     * The space inside a two-word name is allowed to become a hyphen: German
     * writes the compound `Lucky-Stars`, which is correct German and not a lost
     * token. Without this the check reported three of the existing German
     * articles as defects.
     */
    const holds = (text: string, token: string) =>
      new RegExp(`\\b${token.replace(/ /g, '[\\s-]')}\\b`).test(text);

    const lost: string[] = [];
    for (const article of faqMock.articles) {
      for (const field of FIELDS) {
        const english = article[field]?.en;
        if (!english) continue;
        for (const token of TOKENS) {
          if (!holds(english, token)) continue;
          for (const locale of locales) {
            const text = article[field]?.[locale];
            if (text && !holds(text, token))
              lost.push(`${article.id}.${field}/${locale}: ${token}`);
          }
        }
      }
    }
    expect(lost).toEqual([]);
  });

  /**
   * The defect that survives a careful read: a Latin letter welded inside a
   * word of another script. `растa` and `баптa` — a Kazakh word ending in a
   * Latin `a` — both got past review during the task-catalog work.
   */
  it('has no Latin letter welded inside a non-Latin word', () => {
    // Built at runtime: the `v` flag, which allows intersecting a script with
    // "is a letter", needs an es2024 target and this project compiles lower.
    const letter = '[[\\p{Script=Cyrillic}\\p{Script=Armenian}\\p{Script=Arabic}]&&[\\p{L}]]';
    const mixed = new RegExp(`(?:[a-zA-Z]${letter})|(?:${letter}[a-zA-Z])`, 'v');

    const bad: string[] = [];
    for (const article of faqMock.articles) {
      for (const field of FIELDS) {
        for (const locale of locales) {
          const text = article[field]?.[locale];
          if (text && mixed.test(text)) bad.push(`${article.id}.${field}/${locale}`);
        }
      }
    }
    expect(bad).toEqual([]);
  });

  it('renders the reader’s language, and falls back to English for one it lacks', () => {
    const article = faqMock.articles[0];
    expect(getLocalizedText(article.title, 'tr')).not.toBe(article.title.en);
    expect(getLocalizedText(article.title, 'xx' as never)).toBe(article.title.en);
  });
});
