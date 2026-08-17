/**
 * The three informational pages an admin can switch off from the panel: the
 * FAQ, the privacy policy and the terms of use.
 *
 * The live answer comes from `GET /config` → `pages`; the values here are the
 * bundled fallback used while that request is in flight or when it fails, and
 * they are all `true` on purpose. Guessing "off" would blink the menu entries
 * out for everybody on every cold start — the failure mode of guessing "on" is
 * one tap that lands on the page's own "switched off" stub, and the backend
 * refuses to serve the text either way.
 */
export type ContentPageKey = 'faq' | 'privacy' | 'terms';

export type ContentPagesEnabled = Record<ContentPageKey, boolean>;

export const CONTENT_PAGES_FALLBACK: ContentPagesEnabled = {
  faq: true,
  privacy: true,
  terms: true,
};
