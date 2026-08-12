import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/**
 * The app must not decide "is this player signed in?" by looking at a token.
 *
 * The two auth cookies are on their way to `httpOnly`: the day the server
 * starts issuing them, `document.cookie` stops showing a session at all. Every
 * check written as "is there an accessToken?" flips to false that day — and on
 * the web that is a redirect to the login page for someone who is signed in,
 * plus a refresh call that never fires because it bailed on a token it can no
 * longer see. Nothing throws; the app simply logs everyone out.
 *
 * So the rule this guards: the question goes through `hasSessionCk()`, which
 * reads a flag that is not a credential, and the refresh request goes out even
 * with no token in JavaScript — the browser attaches the cookie itself.
 */
const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

describe('session detection survives httpOnly tokens', () => {
  it('the Telegram provider asks the flag, never the tokens', () => {
    const source = read('src/providers/TelegramProvider.tsx');

    expect(source).toContain('hasSessionCk');
    // Reading a token here is exactly the pattern that breaks on the flip.
    expect(source).not.toMatch(/getAccessTokenCk|getRefreshTokenCk/);
  });

  it('the refresh call is not abandoned when the token is invisible', () => {
    const source = read('src/api/index.api.ts');

    // The old guard — `if (!refreshToken) return false;` — is the log-everyone-out
    // line. It must be qualified by the session flag.
    expect(source).not.toMatch(/if \(!refreshToken\) return false;/);
    expect(source).toContain('if (!refreshToken && !hasSessionCk()) return false;');
    // And the request must be allowed to carry no token at all.
    expect(source).toMatch(/body: refreshToken \? \{ refreshToken \} : \{\}/);
  });

  it('the flag rises with the tokens and falls with the session', () => {
    const auth = read('src/api/auth.api.ts');
    const base = read('src/api/index.api.ts');

    // Written wherever tokens are persisted…
    expect(auth).toMatch(/setSessionFlagCk\(\)/);
    expect(base).toMatch(/setSessionFlagCk\(\)/);
    // …and cleared wherever the session is dropped, or the app would keep
    // insisting on a session that the server has already revoked.
    expect(auth).toMatch(/removeSessionFlagCk\(\)/);
    expect(base).toMatch(/removeSessionFlagCk\(\)/);
  });

  it('the flag carries no credential', () => {
    const service = read('src/services/cookie.service.ts');

    // It is a presence marker: the literal '1'. If someone ever makes it hold a
    // token, it becomes exactly the readable secret this migration removes.
    expect(service).toMatch(/Cookies\.set\(sessionFlagKey, '1'/);
  });
});
