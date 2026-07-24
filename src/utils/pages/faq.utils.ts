import { stringIncludes } from '@/utils/global/string.utils';
import type { LocaleType } from '@/types/types/locale.types';
import type { FaqSection, LocalizedText } from '@/types/interfaces/faq.interfaces';

/**
 * Pick the text for the active locale, falling back to English.
 *
 * Resilient to a plain string: some backends (e.g. the legacy `/privacy`
 * endpoint) still serve unlocalized `string` fields instead of a
 * `LocalizedText` map. In that case the string is returned as-is rather than
 * rendering empty, so the screen degrades to unlocalized copy instead of blank.
 */
export const getLocalizedText = (
  text: LocalizedText | string | undefined,
  locale: string
): string => {
  if (text == null) return '';
  if (typeof text === 'string') return text;
  return text[locale as LocaleType] ?? text.en ?? '';
};

export const filterSections = (sections: FaqSection[], searchValue: string, locale: string) => {
  return sections
    .map(section => ({
      ...section,
      articles: section.articles.filter(
        article =>
          stringIncludes(getLocalizedText(article.title, locale), searchValue) ||
          stringIncludes(getLocalizedText(article.description, locale), searchValue)
      ),
    }))
    .filter(
      section =>
        stringIncludes(getLocalizedText(section.title, locale), searchValue) ||
        section.articles.length > 0
    );
};

const loadingText = (): LocalizedText => ({
  en: 'Loading...',
  ru: 'Loading...',
  hy: 'Loading...',
  de: 'Loading...',
});

export const getSectionsSkeletonData = (
  sectionCount: number = 3,
  articleCount: number = 2
): FaqSection[] => {
  return Array.from({ length: sectionCount }, (_, sectionIndex) => ({
    id: `s-${sectionIndex}`,
    title: loadingText(),
    articles: Array.from({ length: articleCount }, (_, articleIndex) => ({
      id: `s-${sectionIndex}-${articleIndex}`,
      title: loadingText(),
      description: loadingText(),
    })),
  }));
};
