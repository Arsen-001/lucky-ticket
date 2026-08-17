/**
 * The screen inventory both e2e suites walk — the dev smoke (`e2e/`) and the
 * production sweep (`e2e-prod/`). One list, so a new screen can't be covered by
 * one suite and missed by the other.
 */

/** Every param-less screen, derived from `src/constants/routes.ts`. */
export const STATIC_ROUTES = [
  '/',
  '/tournaments',
  '/market',
  '/tasks',
  '/tickets',
  '/jackpot',
  '/partners',
  '/partners/new',
  '/promo',
  '/wallet',
  '/lc',
  '/stars',
  '/stakes',
  '/stakes/new',
  '/stakes/history',
  '/inventory',
  '/leaderboard',
  '/invite-friends',
  '/activity',
  '/notifications',
  '/profile',
  '/profile/achievements',
  '/profile/stats',
  '/support',
  '/faq',
  '/privacy',
  '/terms-of-use',
  '/test-quest',
  '/settings',
  '/settings/username',
  // EMAIL OFF (2026-08-17) — the screen no longer routes (private folder), so a
  // sweep of it would only assert a redirect Home. Uncomment with the rest —
  // grep `EMAIL OFF`.
  // '/settings/email',
  '/settings/security',
  '/settings/lucky-player',
  '/settings/vip',
  '/languages',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/two-factor',
];

/**
 * Parameterized DETAIL screens, using stable ids from the mock fixtures
 * (`src/mock/**`). Tournament / profile / faq resolve to real data even on a
 * fresh account (global catalogs); stake / engine have no owned data on a fresh
 * account, so those URLs exercise the detail shell's not-found / empty state —
 * which must still render without crashing.
 */
export const DETAIL_PAGES = [
  // Tournament detail (carries the "X% to the Jackpot" note) — stable mock id.
  { name: 'tournament', url: '/tournaments/123e4567-e89b-12d3-a456-426655440010' },
  // Another player's profile — bound to the `otherProfile` fixture (user-2).
  { name: 'other-profile', url: '/profile/user-2' },
  // FAQ article — stable id from faq.mock.
  { name: 'faq-article', url: '/faq/1' },
  // Stake detail — `stake-mid` is populated on a demo account, empty-state on fresh.
  { name: 'stake', url: '/stakes/stake-mid' },
  // Engine detail — no stable owned-engine id on fresh; exercises the not-found shell.
  { name: 'engine', url: '/engines/eng-smoke' },
];

/**
 * Paths that must not render at all — a URL the app answers with a redirect.
 * `/engines` is a base for `/engines/:id`, never a screen, but the live task
 * catalog deep-links to it; an unmatched URL goes Home because a Mini App has no
 * address bar to escape a 404 with. Both redirects are configured (one in
 * `next.config.ts`, one in `global-not-found.ts`) and both are invisible to a
 * dev-server run — see `e2e-prod/`.
 */
export interface RedirectCase {
  from: string;
  to: string;
  /**
   * Status the FIRST response must carry. Omitted = anything below 400, which
   * is what a platform redirect answers once followed. Spell it out only where
   * an error status is the intended answer.
   */
  status?: number;
}

export const REDIRECTS: RedirectCase[] = [
  { from: '/engines', to: '/tickets' },
  // A truthful 404 is the product decision here, not a defect: the page keeps
  // the honest status and carries the player Home by meta refresh, because a
  // browser does not follow `Location:` on a 404. See `src/app/global-not-found.tsx`.
  { from: '/no-such-screen-abc123', to: '/', status: 404 },
];
