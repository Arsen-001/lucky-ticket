import { GlobalConstants } from '@/constants/global.constants';

/**
 * «Играть только с телефона, и только из Telegram» — client half.
 *
 * The rule itself is an admin switch on the backend; what a client has to own
 * is this: where the QR code points, and how a person who is allowed to use a
 * computer says so.
 *
 * @see src/lib/telegram/platform — which client is asking
 * @see src/hooks/usePreLaunchGate — the runtime decision
 * @see src/components/pages/coming-soon/OpenInTelegramScreen — what a computer sees
 */

/**
 * Where the QR code sends a phone.
 *
 * `?startapp=` (empty value) is the documented way to open a bot's Main Mini
 * App directly — verified live via `getMe`: this bot has `has_main_web_app`.
 * If a client ever ignores it, the same link still lands in the bot chat, whose
 * `/start` reply carries the same button — the failure mode is one extra tap,
 * never a dead end.
 */
const OPEN_IN_TELEGRAM_URL = GlobalConstants.telegramMiniAppUrl;

/**
 * `?desktop=<key>` — the one way into the app from a plain browser, where no
 * signed payload exists and therefore nobody can be named. The value is checked
 * by the backend (`GET /config/desktop-access`), never compared here: a secret
 * shipped in the bundle is not a secret.
 */
const KEY_PARAM = 'desktop';

/**
 * Kept so the key survives the navigation that immediately strips it from the
 * URL — otherwise every in-app route change would ask for it again.
 */
const KEY_STORAGE = 'lt:desktop-access-key';

export const deviceGateConfig = {
  openInTelegramUrl: OPEN_IN_TELEGRAM_URL,
  keyParam: KEY_PARAM,
  keyStorage: KEY_STORAGE,
};

/**
 * The browser key this visit carries: the one in the URL (which is then
 * remembered), or the one remembered from an earlier visit.
 *
 * Returns null outside the browser and swallows storage failures — a private
 * window with storage disabled must fall back to "no key", not to a crash on
 * the very first screen the app renders.
 */
export function readDesktopAccessKey(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const fromUrl = new URLSearchParams(window.location.search).get(KEY_PARAM)?.trim();
    if (fromUrl) {
      window.localStorage.setItem(KEY_STORAGE, fromUrl);
      return fromUrl;
    }
    return window.localStorage.getItem(KEY_STORAGE)?.trim() || null;
  } catch {
    return null;
  }
}
