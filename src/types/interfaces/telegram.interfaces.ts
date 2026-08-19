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
  /**
   * Bot API 6.9+ — "True, if this user allowed the bot to message them"
   * (Telegram's own wording). Absent means NOT allowed, or a client older than
   * 6.9 that never reports it.
   *
   * This is the whole ballgame for notifications: a bot may not write first, so
   * without this permission every DM the game sends that player answers
   * `Bad Request: chat not found`. Measured on production 19.08.2026 — of ~1000
   * engine-ready reminders, zero were delivered. @see useBotWriteAccess
   */
  allows_write_to_pm?: boolean;
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

/**
 * Bot API 6.1+ — the back arrow in the Mini App header. Showing it also takes
 * over the ANDROID SYSTEM BACK gesture: while it is visible the client sends
 * `back_button_pressed` to the app instead of closing the Mini App, which is
 * the only way to stop back from dropping the player out of the game.
 * @see TelegramBackButton
 */
export interface TelegramBackButton {
  isVisible: boolean;
  show: () => void;
  hide: () => void;
  onClick: (handler: () => void) => void;
  offClick: (handler: () => void) => void;
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
  /**
   * Bot API 6.9+ — "shows a native popup requesting permission for the bot to
   * send messages to the user" (Telegram's own wording); the callback receives
   * whether it was granted.
   *
   * Telegram only honours it in response to a real user interaction, so it must
   * be called from inside a tap handler — never from an effect on mount.
   * @see useBotWriteAccess
   */
  requestWriteAccess?: (callback?: (granted: boolean) => void) => void;
  /** Bot API 6.1+ — optional so older clients (where it is simply absent) type-check. */
  BackButton?: TelegramBackButton;
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
  disableVerticalSwipes?: () => void;
  /**
   * Bot API 6.2+ — makes the client ask "Close this app?" before it closes on a
   * gesture: the swipe, the ✕, and the Android back press at the root (the one
   * press `BackButton` deliberately does NOT intercept). @see TelegramBackButton
   */
  enableClosingConfirmation?: () => void;
  /** Bot API 8.0+ — immersive fullscreen (Telegram chrome floats over the app). */
  isFullscreen?: boolean;
  requestFullscreen?: () => void;
  exitFullscreen?: () => void;
  /**
   * Bot API 8.0+ — freezes the Mini App in **whatever orientation it is in when
   * called**, so the client stops following the device. There is no "lock to
   * portrait" argument: calling this in landscape would nail the app to
   * landscape, which is the opposite of what we want. @see usePortraitOnly
   *
   * The SDK warns to the console (and does nothing) below client version 8.0,
   * so callers gate on `isTelegramVersionAtLeast('8.0')`.
   */
  lockOrientation?: () => void;
  unlockOrientation?: () => void;
  isOrientationLocked?: boolean;
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
