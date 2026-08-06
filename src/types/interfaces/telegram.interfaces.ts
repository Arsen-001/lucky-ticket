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

/** Inset object (px) returned by `safeAreaInset` / `contentSafeAreaInset`. */
export interface TelegramInset {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

/** The subset of Telegram WebApp events the app subscribes to. */
export type TelegramEvent =
  | 'safeAreaChanged'
  | 'contentSafeAreaChanged'
  | 'fullscreenChanged'
  | 'fullscreenFailed'
  | 'viewportChanged'
  // Bot API 8.0+ — Mini App moved to the fore/background inside the Telegram
  // client. Used by AppLifecycleProvider; harmless no-ops on older clients.
  | 'activated'
  | 'deactivated';

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
  /** Opens a non-Telegram URL in Telegram's in-app browser. Needed because the
   *  WebView silently swallows `window.open`. */
  openLink?: (url: string, options?: { try_instant_view?: boolean }) => void;
  /** Bot API 8.0+ — sends a message prepared server-side via
   *  `savePreparedInlineMessage` to a chat the user picks (rich invite card
   *  with an image). The callback reports whether it was actually sent. */
  shareMessage?: (msgId: string, callback?: (sent: boolean) => void) => void;
  /** Opens a native invoice (e.g. a Telegram Stars payment). The callback
   *  receives the final status once the payment flow closes. */
  openInvoice?: (
    url: string,
    callback?: (status: 'paid' | 'cancelled' | 'failed' | 'pending') => void
  ) => void;
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
  disableVerticalSwipes?: () => void;
  /** Bot API 8.0+ — immersive fullscreen (Telegram chrome floats over the app). */
  isFullscreen?: boolean;
  requestFullscreen?: () => void;
  exitFullscreen?: () => void;
  /** Device-level insets (notch, status bar, home indicator), in px. */
  safeAreaInset?: TelegramInset;
  /** Insets from Telegram's own chrome (close/menu buttons) in fullscreen, in px. */
  contentSafeAreaInset?: TelegramInset;
  onEvent?: (event: TelegramEvent, handler: (payload?: unknown) => void) => void;
  offEvent?: (event: TelegramEvent, handler: (payload?: unknown) => void) => void;
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}
