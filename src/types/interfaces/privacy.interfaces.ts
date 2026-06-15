export interface PrivacySection {
  id: string;
  title: string;
  body: string;
}

export interface PrivacyPolicy {
  /** ISO date the policy was last updated. */
  updatedAt: string;
  sections: PrivacySection[];
}
