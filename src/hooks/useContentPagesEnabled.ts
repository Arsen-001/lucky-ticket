import { useGetPublicConfigQuery } from '@/api/config.api';
import { CONTENT_PAGES_FALLBACK, type ContentPagesEnabled } from '@/config/content-pages.config';

/**
 * Which informational pages (FAQ / privacy / terms) the app may show — the
 * admin switches from `GET /config` → `pages`, merged over the bundled
 * fallback so a missing field (older backend) reads as "shown" rather than as
 * "hidden".
 *
 * A page that is off disappears from the drawer instead of rendering the
 * "coming soon" lock the leaderboard and the partners cabinet use: those two
 * are unreleased features, this is a document that was taken down, and a
 * padlock promising it soon would say something the admin did not.
 */
export function useContentPagesEnabled(): ContentPagesEnabled {
  const { data } = useGetPublicConfigQuery();
  return { ...CONTENT_PAGES_FALLBACK, ...data?.pages };
}
