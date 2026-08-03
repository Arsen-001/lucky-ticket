import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { mockData } from '@/mock/index.mock';

const root = process.cwd();
const read = (p: string) => readFileSync(resolve(root, p), 'utf8');

const apiFiles = readdirSync(resolve(root, 'src/api')).filter(f => f.endsWith('.api.ts'));

const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * Every `{ url, method }` a file's query builders produce. `method` sits right
 * next to `url` in every endpoint, so the search window stops at whatever comes
 * first — the next `url:` or the next `builder.` — and never borrows the method
 * of the endpoint below.
 */
function extractRequests(source: string) {
  const requests: { url: string; method: string }[] = [];
  for (const match of source.matchAll(/url:\s*(['"`])([^'"`]+)\1/g)) {
    const from = match.index + match[0].length;
    const stops = [source.indexOf('url:', from), source.indexOf('builder.', from)].filter(
      i => i !== -1
    );
    const window = source.slice(from, stops.length ? Math.min(...stops) : source.length);
    requests.push({ url: match[2], method: window.match(/method:\s*'([A-Z]+)'/)?.[1] ?? 'GET' });
  }
  return requests;
}

/** `market/tickets/${ticketId}/buy` → ['market', 'tickets', '*', 'buy']. */
const toSegments = (url: string) =>
  url
    .split('?')[0]
    .replace(/^\/|\/$/g, '')
    .split('/')
    .filter(Boolean)
    .map(segment => (segment.includes('${') ? '*' : segment));

/**
 * Mirrors `mockBaseQuery`'s three-step lookup (method-prefixed key → exact path
 * key → segment traversal, finding array items by id), with a template hole
 * standing for any single segment.
 */
function hasMockHandler(url: string, method: string) {
  const segments = toSegments(url);
  const pathRe = segments
    .map(s => (s === '*' ? '[^/]+' : s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
    .join('/');
  const keyRe = new RegExp(`^(?:${method} )?${pathRe}$`);
  if (Object.keys(mockData).some(key => keyRe.test(key))) return true;

  let current: unknown = mockData;
  for (const segment of segments) {
    if (!current) return false;
    if (Array.isArray(current)) {
      current =
        segment === '*'
          ? current[0]
          : current.find(item => {
              const record = item as Record<string, unknown> | null;
              return !!record && (record.id === segment || record.uuid === segment);
            });
    } else if (typeof current === 'object') {
      const record = current as Record<string, unknown>;
      if (segment === '*') current = Object.values(record)[0];
      else if (segment in record) current = record[segment];
      else return false;
    } else return false;
  }
  return current !== undefined;
}

describe('RTK Query wiring (3-place rule)', () => {
  it('every src/mock/*.mock.ts is imported into index.mock.ts', () => {
    const indexMock = read('src/mock/index.mock.ts');
    const mockModules = readdirSync(resolve(root, 'src/mock'))
      .filter(f => f.endsWith('.mock.ts') && f !== 'index.mock.ts')
      .map(f => f.replace(/\.ts$/, '')); // e.g. "jackpot.mock"

    const notWired = mockModules.filter(name => !indexMock.includes(`@/mock/${name}`));
    expect(notWired, 'mock files missing from index.mock.ts').toEqual([]);
  });

  it('every rtkTags.X referenced in *.api.ts is registered in rtk-tags.ts', () => {
    const registered = new Set(
      [...read('src/constants/rtk-tags.ts').matchAll(/^\s*(\w+):/gm)].map(m => m[1])
    );

    const referenced = new Set<string>();
    for (const file of apiFiles) {
      for (const m of read(`src/api/${file}`).matchAll(/rtkTags\.(\w+)/g)) referenced.add(m[1]);
    }

    const orphaned = [...referenced].filter(tag => !registered.has(tag));
    expect(orphaned, 'rtkTags referenced but not registered').toEqual([]);
  });

  // A mutation whose URL no mock key matches fails on the dev layer with a 404
  // behind a "something went wrong" toast — invisible until someone clicks that
  // exact button. `market/tickets/:ticketId/buy` shipped that way: the mock was
  // registered on the static `market/tickets/buy`, so no ticket could be bought
  // in dev at all.
  it('every invalidated tag is provided by some query', () => {
    // `rtkTags.engines` was invalidated by all seven engine mutations and
    // provided by nobody: engines live inside the `getTickets` payload, so the
    // tag matched no cache entry and every one of those invalidations was a
    // no-op. Nothing broke — the mutations patch `getTickets` in place — but the
    // code claimed a refresh that never happened, which is worse than silence.
    const provided = new Set<string>();
    const invalidated = new Map<string, string[]>();

    for (const file of apiFiles) {
      const source = read(`src/api/${file}`);
      // Split per endpoint so a tag is attributed to the block that names it.
      for (const block of source.split(/\n    (?=[a-zA-Z]+: builder\.)/).slice(1)) {
        const name = block.match(/^([a-zA-Z]+): builder\./)?.[1] ?? '?';
        const body = block.split(/\n    [a-zA-Z]+: builder\./)[0];
        for (const [key, sink] of [
          ['providesTags', provided],
          ['invalidatesTags', invalidated],
        ] as const) {
          const at = body.indexOf(key);
          if (at === -1) continue;
          for (const tag of body.slice(at, at + 400).matchAll(/rtkTags\.(\w+)/g)) {
            if (sink instanceof Set) sink.add(tag[1]);
            else sink.set(tag[1], [...(sink.get(tag[1]) ?? []), `${file}:${name}`]);
          }
        }
      }
    }

    const dead = [...invalidated.keys()]
      .filter(tag => !provided.has(tag))
      .map(tag => `${tag} (invalidated by ${invalidated.get(tag)!.join(', ')})`);

    expect(dead).toEqual([]);
  });

  it('every mutation URL in *.api.ts resolves to a mock handler', () => {
    const unmocked: string[] = [];

    // index.api.ts is the base query itself, not an endpoint file: its lone
    // `auth/refresh` call is issued by the real base query, which never reaches
    // the mock map.
    for (const file of apiFiles.filter(f => f !== 'index.api.ts')) {
      for (const { url, method } of extractRequests(read(`src/api/${file}`))) {
        if (!MUTATION_METHODS.has(method)) continue;
        if (!hasMockHandler(url, method)) unmocked.push(`${method} ${url} (${file})`);
      }
    }

    expect(unmocked, 'mutations with no mock handler').toEqual([]);
  });
});
