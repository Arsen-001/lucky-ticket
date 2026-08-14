import { describe, expect, it } from 'vitest';
import { faqMock } from '@/mock/faq.mock';
import { locales } from '@/i18n/config';
import { getLocalizedText } from '@/utils/pages/faq.utils';

/**
 * The FAQ is English only, and that is a decision rather than an omission.
 *
 * It briefly was not: on 14.08.2026 the knowledge base was translated into all
 * eighteen app languages and shipped, then pulled back the same day. This file
 * is what keeps it from creeping back one language at a time — a half-populated
 * knowledge base is the bad state, because `getLocalizedText` falls back
 * silently and nobody notices which articles are covered and which are not.
 *
 * The English text still has to hold together: it states thresholds,
 * percentages and refund windows that a reader will act on.
 */
describe('FAQ knowledge base', () => {
  const FIELDS = ['title', 'description', 'content'] as const;

  it('carries English and nothing else', () => {
    const extra: string[] = [];

    for (const article of faqMock.articles) {
      for (const field of FIELDS) {
        const keys = Object.keys(article[field] ?? {});
        if (keys.length !== 1 || keys[0] !== 'en')
          extra.push(`${article.id}.${field}: ${keys.join(',')}`);
      }
    }
    for (const section of faqMock.sections) {
      const keys = Object.keys(section.title ?? {});
      if (keys.length !== 1 || keys[0] !== 'en') extra.push(`s${section.id}: ${keys.join(',')}`);
    }

    expect(extra).toEqual([]);
  });

  it('gives every reader the English article, whatever language they picked', () => {
    const article = faqMock.articles[0];
    for (const locale of locales) {
      expect(getLocalizedText(article.title, locale)).toBe(article.title.en);
    }
  });

  it('has no empty article or section', () => {
    const blank: string[] = [];
    for (const article of faqMock.articles) {
      for (const field of FIELDS) {
        if (!article[field]?.en?.trim()) blank.push(`${article.id}.${field}`);
      }
    }
    for (const section of faqMock.sections) {
      if (!section.title?.en?.trim()) blank.push(`s${section.id}`);
    }
    expect(blank).toEqual([]);
  });

  /**
   * Every article belongs to a section that exists, and every section has at
   * least one article — otherwise the page renders a heading with nothing under
   * it, or an article no navigation reaches.
   */
  it('has no orphan article and no empty section', () => {
    const sectionIds = new Set(faqMock.sections.map(s => s.id));
    const orphans = faqMock.articles.filter(a => !sectionIds.has(a.sectionId)).map(a => a.id);
    expect(orphans).toEqual([]);

    const empty = faqMock.sections.filter(s => s.articles.length === 0).map(s => s.id);
    expect(empty).toEqual([]);
  });
});
