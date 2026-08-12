import Cookies from 'js-cookie';

const accessTokenKey = 'accessToken';
const refreshTokenKey = 'refreshToken';
const localKey = 'local';
const sessionFlagKey = 'session';

/**
 * Attributes for the two auth cookies, which until now were written bare.
 *
 * `secure` is decided at call time rather than hardcoded: a Secure cookie is
 * silently discarded over plain http, so a constant `true` would look correct
 * in review and log every developer out on `localhost`.
 *
 * `sameSite: 'none'` because this app is *embedded* — Telegram Web runs the
 * Mini App inside a cross-site iframe, and the browser's default for a missing
 * attribute is `Lax`, which is not sent in that context. The tokens have been
 * riding on that default. `None` is only legal together with `Secure`, which is
 * why the two travel as one object.
 *
 * They deliberately stay readable to JavaScript: the API layer reads the access
 * token to build the `Authorization` header, so `httpOnly` is not a flag that
 * can be flipped here — it needs the backend to move to cookie auth first.
 */
const tokenCookieOptions = (): Cookies.CookieAttributes =>
  typeof location !== 'undefined' && location.protocol === 'https:'
    ? { secure: true, sameSite: 'none' }
    : {};

export const setAccessTokenCk = (token: string) =>
  Cookies.set(accessTokenKey, token, tokenCookieOptions());
export const getAccessTokenCk = () => Cookies.get(accessTokenKey);
export const removeAccessTokenCk = () => Cookies.remove(accessTokenKey);

export const setRefreshTokenCk = (token: string) =>
  Cookies.set(refreshTokenKey, token, tokenCookieOptions());
export const getRefreshTokenCk = () => Cookies.get(refreshTokenKey);
export const removeRefreshTokenCk = () => Cookies.remove(refreshTokenKey);

/**
 * "This browser has a session" — a flag, not a credential. It carries the
 * string `1` and nothing else, so reading it tells an attacker what they could
 * already tell from the app rendering a logged-in screen.
 *
 * It exists because the two token cookies are on their way to `httpOnly`, and
 * the day the server starts issuing them JavaScript stops being able to see a
 * session at all. Everything that used to ask "is there a token?" has to ask
 * something else BEFORE that day, or the app decides the player is logged out
 * the moment the tokens become invisible — and on the web that means a redirect
 * to the login page for someone who is perfectly signed in.
 *
 * Deliberately written by the client, on the same events that persist tokens,
 * so this half works against today's backend unchanged.
 */
export const setSessionFlagCk = () => Cookies.set(sessionFlagKey, '1', tokenCookieOptions());
export const removeSessionFlagCk = () => Cookies.remove(sessionFlagKey);

/**
 * The one question the app should ask about being signed in. True while either
 * token is still visible (today) and while only the flag remains (after the
 * cookies turn `httpOnly`).
 */
export const hasSessionCk = () =>
  !!Cookies.get(sessionFlagKey) || !!Cookies.get(accessTokenKey) || !!Cookies.get(refreshTokenKey);

export const setLocalCk = (value: string) => Cookies.set(localKey, value);
export const getLocalCk = () => Cookies.get(localKey);
export const removeLocalCk = () => Cookies.remove(localKey);
