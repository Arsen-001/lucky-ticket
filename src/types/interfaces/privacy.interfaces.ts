import type { LocalizedText } from '@/types/interfaces/faq.interfaces';

export interface PrivacySection {
  id: string;
  title: LocalizedText;
  body: LocalizedText;
}

export interface PrivacyPolicy {
  /** ISO date the policy was last updated. */
  updatedAt: string;
  sections: PrivacySection[];
}
