import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Things that work in `next dev` and break in the build users actually get.
 *
 * The e2e suite runs against `npm run dev`, so it is structurally blind to this
 * whole family — every trap below shipped green. Each one is pinned here because
 * the failure is silent: no error, no warning, just a screen that behaves
 * differently in production than on the machine it was written on.
 */

const root = process.cwd();
const read = (p: string) => readFileSync(resolve(root, p), 'utf8');

describe('production-only traps', () => {
  it('the global 404 sends the player home without a server redirect', () => {
    // Two ways this page has already dead-ended production, both invisible in
    // `next dev`:
    //
    // 1. Prerendered, it cannot redirect per request — production served Next's
    //    bare `__next_error__` shell for every unknown URL. Hence force-dynamic.
    // 2. `redirect()` from a not-found render emits `Location:` on a *404*, and
    //    browsers only follow `Location` on a 3xx. Production answered
    //    404 + `location: /` and the player sat on a blank page for seconds
    //    (measured 2026-08-05). A meta refresh works ON a 404 and needs no JS.
    //
    // Inside a Mini App there is no address bar to escape a dead end with.
    const source = read('src/app/global-not-found.tsx');
    expect(source).toMatch(/export const dynamic = 'force-dynamic'/);
    expect(source).toMatch(/httpEquiv="refresh"/);
    expect(source).not.toMatch(/import \{[^}]*\bredirect\b[^}]*\} from 'next\/navigation'/);
  });

  it('dev-only routes cannot exist in a production build', () => {
    // The front-end deploys from the working tree, so a scratch page WOULD
    // ship. A runtime guard is not enough: `notFound()` inside the page runs
    // after the response is committed, so `/lab` still answered 200. The route
    // has to be absent from the build — `page.dev.tsx` is only a route while
    // `pageExtensions` accepts that extension, and it may accept it in dev only.
    const config = read('next.config.ts');
    expect(config, 'pageExtensions must be declared').toMatch(/pageExtensions: \[/);
    expect(config).toMatch(/NODE_ENV === 'development' \? \['dev\.tsx'\] : \[\]/);
  });

  it('scrollbar utilities do not decide whether an element scrolls', () => {
    // `main-scrollbar` declared `overflow: scroll` — both axes, always — while
    // painting the track. The call site's `overflow-y-auto` overrode one axis,
    // so the other kept a track it could never scroll: a purple bar under the
    // onboarding language list. Whether something scrolls belongs to the call
    // site; these utilities only say what the bar looks like.
    const css = read('src/styles/global/utilities.css');
    const scrollbarUtilities = [
      ...css.matchAll(/@utility ([\w-]*scrollbar[\w-]*) \{([\s\S]*?)\n\}/g),
    ];
    expect(scrollbarUtilities.length).toBeGreaterThan(0);

    const offenders = scrollbarUtilities
      .filter(([, , body]) => /^\s*overflow(-[xy])?:/m.test(body))
      .map(([, name]) => name);
    expect(offenders).toEqual([]);
  });

  it('every task deeplink resolves to a real destination', () => {
    // The live task catalog deep-links to `/engines`, which is only a base for
    // `/engines/:id` — the engine list itself lives on the Tickets tab. In
    // production that tap landed on the blank 404 above; in dev it redirected
    // home, so it looked merely odd rather than broken.
    const deeplinks = [
      ...new Set(
        [...read('src/mock/tasks.mock.ts').matchAll(/deeplink:\s*'([^']+)'/g)].map(m => m[1])
      ),
    ];
    expect(deeplinks.length).toBeGreaterThan(0);

    // Route patterns from the filesystem: `(groups)` and `@slots` don't appear
    // in URLs, and a `[param]` segment matches anything.
    const routePatterns = new Set<string>();
    const walk = (dir: string, url: string) => {
      for (const entry of readdirSync(resolve(root, dir), { withFileTypes: true })) {
        if (entry.isDirectory()) {
          const segment = /^[(@]/.test(entry.name)
            ? ''
            : `/${entry.name.startsWith('[') ? '*' : entry.name}`;
          walk(`${dir}/${entry.name}`, url + segment);
        } else if (entry.name === 'page.tsx') {
          routePatterns.add(url || '/');
        }
      }
    };
    walk('src/app', '');

    // A platform redirect is a real destination too.
    const redirected = new Set(
      [...read('next.config.ts').matchAll(/source:\s*'([^']+)'/g)].map(m => m[1])
    );

    const dead = deeplinks.filter(link => {
      const path = link.split('?')[0].replace(/\/$/, '') || '/';
      if (redirected.has(path)) return false;
      const segments = path.split('/');
      return ![...routePatterns].some(pattern => {
        const parts = pattern.split('/');
        return (
          parts.length === segments.length &&
          parts.every((part, i) => part === '*' || part === segments[i])
        );
      });
    });

    expect(dead).toEqual([]);
  });
});
