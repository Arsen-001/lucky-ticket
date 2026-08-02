import { test } from '@playwright/test';
import { assertScreenRenders } from './helpers';
import { STATIC_ROUTES } from './routes';

/**
 * Smoke test over every static (param-less) screen in the app — the inventory
 * lives in `./routes`, shared with the production sweep. Each screen must load
 * without an HTTP error, render without a runtime crash, show real content, and
 * not leak an i18n placeholder. Parameterized detail pages are covered in
 * `detail.spec.ts`; defects that appear only in a production build (blank
 * images, stray scrollbar tracks, the global 404 redirect) are covered by
 * `e2e-prod/`, which this suite cannot see — it runs `next dev`.
 */
for (const route of STATIC_ROUTES) {
  test(`screen renders without errors: ${route}`, async ({ page }) => {
    await assertScreenRenders(page, route, route);
  });
}
