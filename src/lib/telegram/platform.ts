import { getTelegramWebApp } from './telegram';

/**
 * Which kind of client is looking at us — the one thing the server cannot
 * answer for itself.
 *
 * `initData` is signed and says WHO is asking; it does not say from WHAT. Only
 * the WebApp object in the page knows that, which is why «не играем из
 * браузера» is decided here and merely excused by the backend.
 */
export type DeviceKind = 'telegram-mobile' | 'telegram-desktop' | 'telegram-web' | 'browser';

/**
 * Telegram Web — the Mini App running in a browser tab, reporting itself
 * honestly. `weba` is Web A, `webk` is Web K, `web` is what older builds sent.
 *
 * This is the list the rule is written against (@see isWebClient), so it is
 * kept closed and small: anything not named here is an installed client.
 */
const WEB_PLATFORMS = new Set(['weba', 'webk', 'web']);

/**
 * Telegram applications installed on a computer: the official desktop build,
 * the native macOS one, and `unigram` (a third-party Windows client).
 *
 * A closed list of DESKTOP platforms, not an open list of mobile ones, and that
 * direction is the whole point: an unknown or new client string resolves to
 * "phone". Blocking a real player on a client we have not heard of costs a
 * player; letting an unusual client through costs one session.
 */
const DESKTOP_PLATFORMS = new Set(['tdesktop', 'macos', 'unigram']);

/**
 * Where this page is being viewed.
 *
 * No Telegram payload at all — a bare browser tab, a link pasted into Chrome —
 * is `browser`: there is nobody to identify there, so it is the one case that
 * cannot be excused by name.
 *
 * Safe to call on the server: it answers `browser` when there is no window, and
 * every caller renders the same neutral splash until the client re-checks.
 */
export function getDeviceKind(): DeviceKind {
  const webApp = getTelegramWebApp();
  if (!webApp?.initData) return 'browser';
  const platform = (webApp.platform ?? '').trim().toLowerCase();
  if (WEB_PLATFORMS.has(platform)) return 'telegram-web';
  return DESKTOP_PLATFORMS.has(platform) ? 'telegram-desktop' : 'telegram-mobile';
}

/**
 * Is the game being opened **in a browser** — the one case the rule turns away.
 *
 * Since 14.08.2026 the rule is "no web", not "phones only": a computer is a
 * perfectly good place to play as long as the game runs in a real Telegram
 * client. What a browser tab cannot give us is Telegram's own chrome, its
 * viewport handling, `lockOrientation`, the closing confirmation and the
 * haptics — and, on the plain-browser side of it, any signed identity at all.
 *
 * Both blocked cases are a browser, and they differ only in what can be done
 * about it: `telegram-web` is inside Telegram (so a person can be named, and
 * excused by the allow-list), `browser` is not (so only the shared key gets
 * in). @see usePreLaunchGate
 */
export function isWebClient(kind: DeviceKind): boolean {
  return kind === 'telegram-web' || kind === 'browser';
}
