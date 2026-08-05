import { getTelegramWebApp } from './telegram';

/**
 * Which kind of client is looking at us — the one thing the server cannot
 * answer for itself.
 *
 * `initData` is signed and says WHO is asking; it does not say from WHAT. Only
 * the WebApp object in the page knows that, which is why «играть только с
 * телефона» is decided here and merely excused by the backend.
 */
export type DeviceKind = 'telegram-mobile' | 'telegram-desktop' | 'browser';

/**
 * Telegram clients that run on a computer. `weba`/`webk`/`web` are Telegram Web
 * — a browser tab that reports itself honestly — and `unigram` is a Windows
 * client.
 *
 * A closed list of DESKTOP platforms, not an open list of mobile ones, and that
 * direction is the whole point: an unknown or new client string resolves to
 * "phone". Blocking a real player on a client we have not heard of costs a
 * player; letting an unusual desktop through costs one desktop session.
 */
const DESKTOP_PLATFORMS = new Set(['tdesktop', 'macos', 'weba', 'webk', 'web', 'unigram']);

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
  return DESKTOP_PLATFORMS.has(platform) ? 'telegram-desktop' : 'telegram-mobile';
}
