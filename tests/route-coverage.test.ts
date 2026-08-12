import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { STATIC_ROUTES, DETAIL_PAGES, REDIRECTS } from '#/e2e/routes';

/**
 * A new screen must not be able to slip past both e2e suites.
 *
 * `e2e/routes.ts` already exists so that one suite cannot cover a screen the
 * other misses. What nothing checked is the step before that: whether the list
 * still matches the app. Add a route to `constants/routes.ts`, forget to add it
 * here, and every sweep stays green while the screen is untested — which is the
 * exact shape of the two defects the production suite was built for
 * (`global-not-found` serving a blank shell, the optimizer 400ing on SVG flags:
 * both lived on screens nobody walked).
 *
 * Read from the source text rather than from the `routes` object because the
 * object mixes literals with builders (`getById`), and only the literals name a
 * screen that can be visited without an id.
 */
const ROUTES_SOURCE = readFileSync(new URL('../src/constants/routes.ts', import.meta.url), 'utf8');

/**
 * Paths spelled out in full in `routes.ts`.
 *
 * Trailing-slash matches are dropped: `'/profile/' + userId` is a builder, and
 * counting its prefix as a screen reports a route that does not exist.
 */
const declaredPaths = [...new Set([...ROUTES_SOURCE.matchAll(/'(\/[a-z0-9/-]*)'/g)].map(m => m[1]))]
  .filter(path => path === '/' || !path.endsWith('/'))
  .filter(path => !path.includes('['));

describe('every screen the app can name is walked by e2e', () => {
  it('has no route missing from the sweep', () => {
    const walked = new Set<string>(STATIC_ROUTES);
    // A base that only exists to carry an id is covered by its detail page.
    for (const page of DETAIL_PAGES) {
      walked.add(page.url);
      walked.add(page.url.slice(0, page.url.lastIndexOf('/')));
    }
    // `/engines` is the documented case: a base that is not a screen at all, so
    // it is covered as a redirect rather than as a page.
    for (const redirect of REDIRECTS) walked.add(redirect.from);

    const missing = declaredPaths.filter(path => !walked.has(path));

    expect(missing).toEqual([]);
  });
});
