import type { LocaleType } from '@/types/types/locale.types';

/**
 * A string carried per language — English always, the rest where it exists.
 *
 * Partial by design, not by laziness. These maps are rows in the backend's
 * database (FAQ articles, legal pages, task copy, achievements), written at
 * whatever moment they were authored and holding whatever languages the
 * platform knew about then. Adding a language to the app does not reach back
 * and fill hundreds of existing rows, so a `de` key can simply be absent — and
 * `getLocalizedText` has always read them that way, `text[locale] ?? text.en`.
 *
 * Typing this as `Record<LocaleType, string>` claimed the opposite: that every
 * row holds every language. It survived only because there were four languages
 * and the fixtures listed all four; the first language added past that turned
 * every mock and every literal into a type error, which is the type complaining
 * about reality rather than reality being wrong.
 *
 * `en` stays required: it is the fallback the reader lands on, so a map without
 * it has no floor.
 */
export type LocalizedText = { en: string } & Partial<Record<LocaleType, string>>;

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
