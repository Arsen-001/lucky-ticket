/**
 * Minimal typings for the Telegram Mini App SDK exposed at
 * `window.Telegram.WebApp` (loaded from telegram.org/js/telegram-web-app.js).
 * Only the surface the app actually uses is declared — full reference at
 * https://core.telegram.org/bots/webapps. Newer methods are optional so the
 * app keeps working on older Telegram clients that don't expose them.
 */
export interface TelegramWebAppUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export interface TelegramWebAppInitDataUnsafe {
  user?: TelegramWebAppUser;
  auth_date?: number;
  hash?: string;
  start_param?: string;
}

export interface TelegramWebApp {
  /** Signed, URL-encoded init data — the credential the backend verifies. */
  initData: string;
  initDataUnsafe: TelegramWebAppInitDataUnsafe;
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  isExpanded: boolean;
  ready: () => void;
  expand: () => void;
  close: () => void;
  /** Opens a `t.me/…` link inside Telegram. For a `t.me/share/url?…` link this
   *  brings up the native "share to a chat" picker (used for the invite share). */
  openTelegramLink?: (url: string) => void;
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
  disableVerticalSwipes?: () => void;
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}
