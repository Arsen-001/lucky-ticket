import Cookies from 'js-cookie';

const accessTokenKey = 'accessToken';
const refreshTokenKey = 'refreshToken';
const localKey = 'local';

export const setAccessTokenCk = (token: string) =>
  Cookies.set(accessTokenKey, token);
export const getAccessTokenCk = () => Cookies.get(accessTokenKey);
export const removeAccessTokenCk = () => Cookies.remove(accessTokenKey);

export const setRefreshTokenCk = (token: string) =>
  Cookies.set(refreshTokenKey, token);
export const getRefreshTokenCk = () => Cookies.get(refreshTokenKey);
export const removeRefreshTokenCk = () => Cookies.remove(refreshTokenKey);

export const setLocalCk = (value: string) => Cookies.set(localKey, value);
export const getLocalCk = () => Cookies.get(localKey);
export const removeLocalCk = () => Cookies.remove(localKey);
