import { test } from '@playwright/test';
import { assertScreenRenders } from './helpers';

/**
 * Smoke test over every static (param-less) screen in the app — derived from
 * `src/constants/routes.ts`. Each screen must load without an HTTP error, render
 * without a runtime crash, show real content, and not leak an i18n placeholder.
 * Parameterized detail pages are covered in `detail.spec.ts`.
 */
const ROUTES = [
  '/',
  '/tournaments',
  '/market',
  '/tasks',
  '/tickets',
  '/engines',
  '/jackpot',
  '/promo',
  '/wallet',
  '/lc',
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
  '/support',
  '/settings',
  '/settings/username',
  '/settings/email',
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

for (const route of ROUTES) {
  test(`screen renders without errors: ${route}`, async ({ page }) => {
    await assertScreenRenders(page, route, route);
  });
}
