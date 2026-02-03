import { stringIncludes } from '@/utils/global/string.utils';
import type { SupportSection } from '@/types/interfaces/support.interfaces';

export const filterSections = (sections: SupportSection[], searchValue: string) => {
  return sections
    .map(section => ({
      ...section,
      articles: section.articles.filter(
        article =>
          stringIncludes(article.title, searchValue) ||
          stringIncludes(article.description, searchValue)
      ),
    }))
    .filter(section => stringIncludes(section.title, searchValue) || section.articles.length > 0);
};

export const getSectionsSkeletonData = (sectionCount: number = 3, articleCount: number = 2) => {
  return Array.from({ length: sectionCount }, () => ({
    title: 'Loading...',
    articles: Array.from({ length: articleCount }, () => ({
      title: 'Loading...',
      description: 'Loading...',
    })),
  }));
};
