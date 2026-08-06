import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();

const set = vi.fn();
const get = vi.fn();
const remove = vi.fn();

vi.mock('js-cookie', () => ({ default: { set, get, remove } }));

const setProtocol = (protocol: string) => {
  vi.stubGlobal('location', { protocol } as Location);
};

const loadService = async () => {
  vi.resetModules();
  return import('@/services/cookie.service');
};

describe('auth cookies', () => {
  beforeEach(() => {
    set.mockClear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  /**
   * Both JWTs used to be written bare, so the browser fell back to its own
   * defaults on a page that also loads a third-party ad SDK.
   */
  it('marks the tokens Secure over https', async () => {
    setProtocol('https:');
    const { setAccessTokenCk, setRefreshTokenCk } = await loadService();
    setAccessTokenCk('a');
    setRefreshTokenCk('r');
    for (const call of set.mock.calls) expect(call[2]).toMatchObject({ secure: true });
  });

  /**
   * Telegram Web runs the Mini App inside a cross-site iframe. `Lax` — the
   * browser's default when the attribute is missing — is not sent there, so the
   * embedded app is exactly the case that needs `None`.
   */
  it('uses SameSite=None so the embedded app keeps its session', async () => {
    setProtocol('https:');
    const { setAccessTokenCk } = await loadService();
    setAccessTokenCk('a');
    expect(set.mock.calls[0][2]).toMatchObject({ sameSite: 'none' });
  });

  /**
   * A Secure cookie is silently discarded over plain http, so hardcoding the
   * flag would log every developer out on localhost while looking right.
   */
  it('sets no flags over plain http, or the local session would vanish', async () => {
    setProtocol('http:');
    const { setAccessTokenCk } = await loadService();
    setAccessTokenCk('a');
    expect(set.mock.calls[0][2]).toEqual({});
  });

  /**
   * `SameSite=None` is only legal alongside `Secure`; a cookie carrying one
   * without the other is rejected outright.
   */
  it('never sends SameSite=None without Secure', async () => {
    for (const protocol of ['http:', 'https:']) {
      setProtocol(protocol);
      set.mockClear();
      const { setRefreshTokenCk } = await loadService();
      setRefreshTokenCk('r');
      const options = set.mock.calls[0][2] as { sameSite?: string; secure?: boolean };
      if (options.sameSite === 'none') expect(options.secure).toBe(true);
      vi.unstubAllGlobals();
    }
  });

  /**
   * The API layer reads the access token to build the Authorization header, so
   * httpOnly cannot be switched on here — it needs the backend to move to
   * cookie auth first. Stated as a test so nobody "fixes" it in passing and
   * logs out the whole app.
   */
  it('keeps the tokens readable to the API layer', () => {
    const service = readFileSync(resolve(root, 'src/services/cookie.service.ts'), 'utf8');
    // The attribute, not the word — the comment above the options explains why
    // it is absent, and matching prose would make this test unfailable.
    expect(service).not.toMatch(/httpOnly\s*:/);
    const api = readFileSync(resolve(root, 'src/api/index.api.ts'), 'utf8');
    expect(api).toContain('getAccessTokenCk');
  });
});

describe('security headers', () => {
  const config = () => readFileSync(resolve(root, 'next.config.ts'), 'utf8');

  it('sends a policy for every route', () => {
    expect(config()).toContain('async headers()');
    expect(config()).toContain('X-Content-Type-Options');
    expect(config()).toContain('Referrer-Policy');
  });

  /**
   * Telegram Web embeds the Mini App in an iframe, so the reflexive
   * `X-Frame-Options: DENY` would black the app out for every desktop player.
   * `frame-ancestors` says the same thing in the form that can name Telegram.
   */
  it('never blanket-denies framing — Telegram is the frame', () => {
    // As a header key, not as the comment that explains its absence.
    expect(config()).not.toMatch(/key:\s*'X-Frame-Options'/);
    expect(config()).toContain('frame-ancestors');
    expect(config()).toContain('telegram.org');
  });

  /**
   * The ad SDKs are named sources: adding a network to the waterfall without
   * adding it here would have the CSP report (and later block) it.
   */
  it('names the ad SDK hosts the waterfall can load', () => {
    expect(config()).toContain('sad.adsgram.ai');
    expect(config()).toContain('libtl.com');
  });
});
