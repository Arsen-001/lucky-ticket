export interface TermsSection {
  id: string;
  title: string;
  body: string;
}

export interface TermsOfUse {
  /** ISO date the terms were last updated. */
  updatedAt: string;
  sections: TermsSection[];
}
