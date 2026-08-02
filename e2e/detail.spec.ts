import { test } from '@playwright/test';
import { assertScreenRenders } from './helpers';
import { DETAIL_PAGES } from './routes';

/**
 * Smoke over parameterized DETAIL screens. The inventory and the reasoning
 * behind each id live in `./routes`, shared with the production sweep.
 */
for (const { name, url } of DETAIL_PAGES) {
  test(`detail screen renders without errors: ${name}`, async ({ page }) => {
    await assertScreenRenders(page, `${name} (${url})`, url);
  });
}
