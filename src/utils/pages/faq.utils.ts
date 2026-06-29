import { stringIncludes } from '@/utils/global/string.utils';
import type { LocaleType } from '@/types/types/locale.types';
import type { FaqSection, LocalizedText } from '@/types/interfaces/faq.interfaces';

/** Pick the text for the active locale, falling back to English. */
export const getLocalizedText = (text: LocalizedText | undefined, locale: string): string =>
  text?.[locale as LocaleType] ?? text?.en ?? '';

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
