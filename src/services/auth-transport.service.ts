import { getAccessTokenCk, removeAccessTokenCk, removeRefreshTokenCk } from './cookie.service';

/**
 * The last step of the `httpOnly` migration, and the one that could lock every
 * player out if it were taken on faith.
 *
 * The server now issues the tokens as cookies JavaScript cannot read (`atk` /
 * `rtk`). For that to be worth anything the app has to STOP keeping its own
 * readable copy — otherwise an injected script still walks off with a 30-day
 * refresh token and nothing was gained.
 *
 * But "the server sets a cookie" and "the browser sends it back" are different
 * claims. Telegram Web runs the Mini App in a cross-site iframe, where a
 * browser is entitled to refuse the cookie outright; a proxy can drop it; an
 * old webview can ignore `SameSite=None`. Dropping our copy on the assumption
 * that it works is how everyone ends up signed out at once.
 *
 * So the transport is PROVEN before it is trusted: one request to a guarded
 * endpoint with the Authorization header deliberately left off. It can only
 * succeed if the cookie travelled. Only then are the readable tokens cleared.
 * If it fails — no cookie, old server, offline — nothing changes and the app
 * keeps working exactly as it did.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL;

/** Once per page load: the answer cannot change without a fresh sign-in. */
let settled = false;

export const resetCookieTransportProbe = () => {
  settled = false;
};

export async function adoptCookieTransportIfProven(): Promise<boolean> {
  // Mock mode has no server to prove anything against.
  if (!API_URL || typeof window === 'undefined') return false;
  if (settled) return false;
  settled = true;

  // Nothing to give up — the tokens are already gone (or never existed).
  if (!getAccessTokenCk()) return false;

  try {
    const response = await fetch(`${API_URL.replace(/\/$/, '')}/auth/me`, {
      method: 'GET',
      // Same-origin (`/api-proxy`), so the browser attaches the cookies itself
      // and sends `Sec-Fetch-Site: same-origin`, which the server's CSRF gate
      // requires before it will look at a cookie at all.
      credentials: 'same-origin',
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) return false;

    // Proven: the request authenticated with no Authorization header, so the
    // cookie made the round trip. The readable copies can go — the session flag
    // stays, and it is what the app asks about from here on.
    removeAccessTokenCk();
    removeRefreshTokenCk();
    return true;
  } catch {
    // Network hiccup, offline, aborted navigation: prove it next time.
    settled = false;
    return false;
  }
}
