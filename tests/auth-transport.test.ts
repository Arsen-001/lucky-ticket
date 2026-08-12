import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * The last step of the `httpOnly` migration: the app stops keeping a readable
 * copy of the tokens. Taken on faith it is a way to sign everyone out at once —
 * "the server sets a cookie" and "the browser sends it back" are different
 * claims, and Telegram Web runs the Mini App in a cross-site iframe where a
 * browser may refuse the cookie outright.
 *
 * So the transport is proven first: one request to a guarded endpoint with the
 * Authorization header deliberately absent, which can only succeed if the
 * cookie travelled. These tests pin both halves of that — the tokens are
 * dropped when it works, and kept when anything at all goes wrong.
 */
const cookie = {
  getAccessTokenCk: vi.fn(),
  removeAccessTokenCk: vi.fn(),
  removeRefreshTokenCk: vi.fn(),
};

vi.mock('@/services/cookie.service', () => cookie);

const load = async () => {
  vi.resetModules();
  process.env.NEXT_PUBLIC_API_URL = '/api-proxy';
  return import('@/services/auth-transport.service');
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('window', {});
  cookie.getAccessTokenCk.mockReturnValue('a-readable-token');
});

describe('adoptCookieTransportIfProven', () => {
  it('drops the readable tokens once a header-less request authenticates', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);
    const { adoptCookieTransportIfProven } = await load();

    await expect(adoptCookieTransportIfProven()).resolves.toBe(true);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api-proxy/auth/me');
    // The whole proof rests on this: no Authorization header. If one were sent
    // the request would pass on the header and say nothing about cookies.
    expect(JSON.stringify(init.headers)).not.toMatch(/authorization/i);
    expect(init.credentials).toBe('same-origin');

    expect(cookie.removeAccessTokenCk).toHaveBeenCalled();
    expect(cookie.removeRefreshTokenCk).toHaveBeenCalled();
  });

  it('keeps them when the request is refused — the cookie did not travel', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401 }));
    const { adoptCookieTransportIfProven } = await load();

    await expect(adoptCookieTransportIfProven()).resolves.toBe(false);
    expect(cookie.removeAccessTokenCk).not.toHaveBeenCalled();
    expect(cookie.removeRefreshTokenCk).not.toHaveBeenCalled();
  });

  it('keeps them when the request never completes', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    const { adoptCookieTransportIfProven } = await load();

    await expect(adoptCookieTransportIfProven()).resolves.toBe(false);
    expect(cookie.removeAccessTokenCk).not.toHaveBeenCalled();
  });

  it('asks the server once per page load, not once per call', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);
    const { adoptCookieTransportIfProven } = await load();

    await adoptCookieTransportIfProven();
    await adoptCookieTransportIfProven();
    await adoptCookieTransportIfProven();

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('retries after a failed round trip, since that answer was not an answer', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);
    const { adoptCookieTransportIfProven } = await load();

    await expect(adoptCookieTransportIfProven()).resolves.toBe(false);
    await expect(adoptCookieTransportIfProven()).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('does nothing when there is no readable token left to give up', async () => {
    cookie.getAccessTokenCk.mockReturnValue(undefined);
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const { adoptCookieTransportIfProven } = await load();

    await expect(adoptCookieTransportIfProven()).resolves.toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('stays out of mock mode entirely', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    vi.resetModules();
    process.env.NEXT_PUBLIC_API_URL = '';
    const { adoptCookieTransportIfProven } = await import('@/services/auth-transport.service');

    await expect(adoptCookieTransportIfProven()).resolves.toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
