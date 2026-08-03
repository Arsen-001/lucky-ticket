import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { rtkTags } from '@/constants/rtk-tags';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { type MockData, mockData } from '@/mock/index.mock';
import { isTelegramEnv } from '@/lib/telegram/telegram';
import { setBanned } from '@/lib/rtk/features/ban.slice';
import { setServerMaintenance } from '@/lib/rtk/features/maintenance.slice';
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

/**
 * Single-flight refresh. The backend rotates refresh tokens (one use each), so
 * when several queries 401 at once — the normal case after the 15-min access
 * token expires with a screen full of queries — they must all await ONE
 * refresh call. Without this mutex every 401 raced its own refresh: the first
 * won and rotated the token, the rest got "revoked" back and wiped the fresh
 * cookies, logging the user out on the web (Telegram re-auths via initData on
 * every open, which masked the bug there).
 */
let refreshInFlight: Promise<boolean> | null = null;

/**
 * The backend answers 403 with the literal 'BANNED' message (login, refresh
 * and every guarded route) when the account is banned — the contract that
 * triggers the blocking BannedOverlay.
 */
const isBannedError = (error: FetchBaseQueryError | undefined): boolean =>
  error?.status === 403 &&
  (error.data as { message?: string } | null | undefined)?.message === 'BANNED';

/**
 * A 503 is NOT enough to declare maintenance — match the guard's own message.
 *
 * Feature-level refusals also answer 503 (no treasury configured, no bot
 * token), and treating those as platform maintenance blanked the entire Mini
 * App into the full-screen overlay for one player tapping Withdraw — and for
 * anyone whose next poll happened to be that request. The guard sends this
 * exact literal (`MaintenanceGuard`), so it is a reliable discriminator.
 */
const isMaintenanceError = (error: FetchBaseQueryError | undefined): boolean =>
  error?.status === 503 &&
  (error.data as { message?: string } | null | undefined)?.message ===
    'Platform is under maintenance';

const refreshSession = async (
  store: Parameters<typeof rawBaseQuery>[1],
  extra: Parameters<typeof rawBaseQuery>[2]
): Promise<boolean> => {
  const refreshToken = getRefreshTokenCk();
  if (!refreshToken) return false;
  // Detach from the triggering query's abort signal: the refresh is shared by
  // every waiter, so one unmounting component must not cancel it (a cancelled
  // rotation may still reach the server and revoke the token we'd retry with).
  const refresh = await rawBaseQuery(
    { url: 'auth/refresh', method: 'POST', body: { refreshToken } },
    { ...store, signal: new AbortController().signal },
    extra
  );
  // A banned user whose access token already expired never reaches the
  // strategy's 403 — only the refresh endpoint reports the ban. Surface it
  // from here too, or the app would sit on silent 401s with no overlay.
  if (isBannedError(refresh.error)) store.dispatch(setBanned(true));
  const tokens = refresh.data as { accessToken?: string; refreshToken?: string } | undefined;
  if (tokens?.accessToken) {
    setAccessTokenCk(tokens.accessToken);
    if (tokens.refreshToken) setRefreshTokenCk(tokens.refreshToken);
    return true;
  }
  // Drop the session only when the backend definitively rejected the token.
  // A network hiccup / backend restart must NOT log the user out — the token
  // is still good and the next 401 will retry the refresh.
  if (refresh.error?.status === 401) {
    removeAccessTokenCk();
    removeRefreshTokenCk();
    // On the web the session is unrecoverable now — take the user to the login
    // page instead of leaving every screen stuck on "Couldn't load data".
    // Inside Telegram re-auth happens via initData, so never redirect there.
    if (typeof window !== 'undefined' && !isTelegramEnv()) {
      const authPages = ['/login', '/register', '/forgot-password', '/reset-password'];
      if (!authPages.some(p => window.location.pathname.startsWith(p))) {
        window.location.assign('/login');
      }
    }
  }
  return false;
};

const realBaseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  store,
  extra
) => {
  let result = await rawBaseQuery(args, store, extra);

  if (result.error?.status === 401) {
    refreshInFlight ??= refreshSession(store, extra).finally(() => {
      refreshInFlight = null;
    });
    if (await refreshInFlight) {
      result = await rawBaseQuery(args, store, extra); // retry original
    }
  }

  // Server-driven ban: any 403 'BANNED' (login included) raises the blocking
  // overlay. One-way — unlike maintenance it never resets on a later success;
  // an unban takes effect on the next app open.
  if (isBannedError(result.error)) {
    const banned = (store.getState() as { ban?: { banned: boolean } }).ban?.banned;
    if (!banned) store.dispatch(setBanned(true));
  }

  // Server-driven maintenance mode: the backend's MaintenanceGuard answers 503
  // on every player route while maintenance is on. Flip the blocking overlay
  // on the first 503 and back off on the first success — mounted polling
  // queries (jackpot, notifications) keep running under the overlay, so the
  // app recovers by itself when the backend comes back.
  const serverDown = (store.getState() as { maintenance?: { serverDown: boolean } }).maintenance
    ?.serverDown;
  if (isMaintenanceError(result.error)) {
    if (!serverDown) store.dispatch(setServerMaintenance(true));
  } else if (!result.error && serverDown) {
    store.dispatch(setServerMaintenance(false));
  }

  return result;
};

export const api = createApi({
  tagTypes: Object.values(rtkTags),
  reducerPath: 'api',
  baseQuery: API_URL ? realBaseQuery : mockBaseQuery<MockData>(mockData),
  endpoints: () => ({}),
});
