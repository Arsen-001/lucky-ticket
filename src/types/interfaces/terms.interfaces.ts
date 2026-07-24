import type { LocalizedText } from '@/types/interfaces/faq.interfaces';

export interface TermsSection {
  id: string;
  title: LocalizedText;
  body: LocalizedText;
}

export interface TermsOfUse {
  /** ISO date the terms were last updated. */
  updatedAt: string;
  sections: TermsSection[];
}
