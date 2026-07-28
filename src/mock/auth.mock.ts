/**
 * Dev-layer auth. Credentials are checked by the backend, never here, so every
 * attempt succeeds: the point is that the auth screens and the Telegram boot
 * handshake run their success path locally — persist the tokens, invalidate
 * `me` — instead of dying on a 404 behind an error toast.
 */
const issueTokens = () => ({
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
});

export const authMock = {
  'POST auth/login': issueTokens,
  'POST auth/register': issueTokens,
  'POST auth/telegram': issueTokens,
  'POST auth/logout': () => ({}),
};
