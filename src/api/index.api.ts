import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { rtkTags } from '@/constants/rtk-tags';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { type MockData, mockData } from '@/mock/index.mock';
import {
  getAccessTokenCk,
  getRefreshTokenCk,
  removeAccessTokenCk,
  removeRefreshTokenCk,
  setAccessTokenCk,
  setRefreshTokenCk,
} from '@/services/cookie.service';

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
      console.error(`[MockBaseQuery] Execution error:`, error);
      return {
        error: {
          status: 500,
          data: error instanceof Error ? error.message : 'Internal Mock Error',
        } as FetchBaseQueryError,
      };
    }
  };

/**
 * Real backend base query — used when `NEXT_PUBLIC_API_URL` is set. Injects the
 * JWT bearer from cookies and transparently refreshes it once on a 401.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL;

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_URL ? `${API_URL.replace(/\/$/, '')}/` : '/',
  prepareHeaders: headers => {
    const token = getAccessTokenCk();
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

const realBaseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  store,
  extra
) => {
  let result = await rawBaseQuery(args, store, extra);

  if (result.error?.status === 401) {
    const refreshToken = getRefreshTokenCk();
    if (refreshToken) {
      const refresh = await rawBaseQuery(
        { url: 'auth/refresh', method: 'POST', body: { refreshToken } },
        store,
        extra
      );
      const tokens = refresh.data as { accessToken?: string; refreshToken?: string } | undefined;
      if (tokens?.accessToken) {
        setAccessTokenCk(tokens.accessToken);
        if (tokens.refreshToken) setRefreshTokenCk(tokens.refreshToken);
        result = await rawBaseQuery(args, store, extra); // retry original
      } else {
        removeAccessTokenCk();
        removeRefreshTokenCk();
      }
    }
  }

  return result;
};

export const api = createApi({
  tagTypes: Object.values(rtkTags),
  reducerPath: 'api',
  baseQuery: API_URL ? realBaseQuery : mockBaseQuery<MockData>(mockData),
  endpoints: () => ({}),
});
