import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { type MockData, mockData } from '@/mock/index.mock';

/**
 * The mock API layer, in its own module so it can be code-split away.
 *
 * It used to live in `index.api.ts` with a TOP-LEVEL `import … mockData`, and
 * the mock modules call `faker.seed(...)` at module scope — that side effect
 * makes them unshakeable, so the whole fixture corpus AND @faker-js/faker (a
 * devDependency) shipped to players: one 949 KB / 320 KB-gzip chunk referenced
 * by 82 of 84 pages, carrying FAQ/terms copy in four languages including
 * Armenian, which is not even a live locale.
 *
 * Nothing here is imported statically any more — `index.api.ts` reaches it
 * through `await import()`, which only runs when NEXT_PUBLIC_API_URL is unset.
 */

export { mockData };
export type { MockData };

/**
 * A robust mock base query that simulates network latency and resolves data from a mock map.
 * Supports:
 * - Simple key matching (e.g., 'me')
 * - Path traversal with ID matching in arrays (e.g., 'tournaments/123')
 * - Method-specific mocks (e.g., 'GET tournaments')
 * - Functional mocks for dynamic responses
 * - Simulated random delay and error handling
 */
export const mockBaseQuery =
  <TMockMap extends Record<string, unknown>>(
    mockMap: TMockMap,
    { minDelay = 400, maxDelay = 1200 }: { minDelay?: number; maxDelay?: number } = {}
  ): BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> =>
  async args => {
    const fetchArgs = typeof args === 'string' ? { url: args } : args;
    const { url, method = 'GET' } = fetchArgs;

    // Simulate network delay for a more realistic feel
    const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
    await new Promise(resolve => setTimeout(resolve, delay));

    // Normalize path: remove query params and leading/trailing slashes
    const cleanPath = url.split('?')[0].replace(/^\/|\/$/g, '');
    const segments = cleanPath.split('/').filter(Boolean);

    const resolveMockValue = () => {
      // 1. Try method-prefixed path first (e.g., "POST auth/login")
      const methodKey = `${method.toUpperCase()} ${cleanPath}`;
      if (mockMap[methodKey] !== undefined) return mockMap[methodKey];

      // 2. Try exact path match (e.g., "tournaments/top")
      if (mockMap[cleanPath] !== undefined) return mockMap[cleanPath];

      // 3. Fallback to segment-by-segment traversal (supports finding by id/uuid in arrays)
      let current: unknown = mockMap;
      for (const segment of segments) {
        if (!current) return undefined;

        // A collection mid-path may be a thunk, so a fixture that carries
        // session state (a created tournament, a dismissed result) can hand out
        // a fresh array per request instead of a shared — and, once served,
        // frozen — one. `tournaments/{id}` traverses through exactly that.
        if (typeof current === 'function') current = (current as () => unknown)();
        if (!current) return undefined;

        if (Array.isArray(current)) {
          // If we encounter an array, we assume the segment is an ID
          current = current.find(item => {
            const record = item as Record<string, unknown> | null;
            return !!record && (record.id === segment || record.uuid === segment);
          });
        } else if (typeof current === 'object' && segment in current) {
          current = (current as Record<string, unknown>)[segment];
        } else {
          return undefined;
        }
      }
      return current;
    };

    try {
      let result = resolveMockValue();

      // If the result is a function, execute it to get dynamic mock data
      if (typeof result === 'function') {
        result = await result(fetchArgs);
      }

      if (result === undefined) {
        console.warn(`[MockBaseQuery] 404 Not Found: ${method} ${url}`);
        return {
          error: {
            status: 404,
            data: `No mock for "${url}"`,
          } as FetchBaseQueryError,
        };
      }

      // If mock already returns an RTK-Query compatible result object, return it directly
      if (result && typeof result === 'object' && ('data' in result || 'error' in result)) {
        return result as { data: unknown } | { error: FetchBaseQueryError };
      }

      return { data: result };
    } catch (error) {
      // The endpoint belongs in the message: without it a fixture bug reads as
      // an anonymous `TypeError` repeated across every screen, and finding the
      // handler behind it costs an afternoon.
      console.error(`[MockBaseQuery] Execution error: ${method} ${url}`, error);
      return {
        error: {
          status: 500,
          data: error instanceof Error ? error.message : 'Internal Mock Error',
        } as FetchBaseQueryError,
      };
    }
  };
