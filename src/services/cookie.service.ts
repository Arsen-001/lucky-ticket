import Cookies from 'js-cookie';

const accessTokenKey = 'accessToken';
const refreshTokenKey = 'refreshToken';
const localKey = 'local';

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

export const setLocalCk = (value: string) => Cookies.set(localKey, value);
export const getLocalCk = () => Cookies.get(localKey);
export const removeLocalCk = () => Cookies.remove(localKey);
