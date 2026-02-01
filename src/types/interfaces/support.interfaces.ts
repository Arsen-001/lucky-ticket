export interface SupportSection {
  id: string;
  title: string;
  articles: SupportArticleMeta[];
}

export interface SupportArticleMeta {
  id: string;
  title: string;
  description: string;
}

export interface SupportArticle extends SupportArticleMeta {
  sectionId: string;
  content: string;
}
