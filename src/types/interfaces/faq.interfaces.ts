import type { LocaleType } from '@/types/types/locale.types';

/** A string available in every supported app language (en / hy / ru / de). */
export type LocalizedText = Record<LocaleType, string>;

export interface FaqSection {
  id: string;
  title: LocalizedText;
  articles: FaqArticleMeta[];
}

export interface FaqArticleMeta {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
}

export interface FaqArticle extends FaqArticleMeta {
  sectionId: string;
  content: LocalizedText;
}
