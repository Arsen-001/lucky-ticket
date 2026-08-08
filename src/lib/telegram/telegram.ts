import type { TelegramWebApp } from '@/types/interfaces/telegram.interfaces';

/** The Telegram WebApp SDK object, or `undefined` when not inside Telegram. */
export function getTelegramWebApp(): TelegramWebApp | undefined {
  if (typeof window === 'undefined') return undefined;
  return window.Telegram?.WebApp;
}

/**
 * True only when the app runs inside the Telegram client with a signed
 * `initData` payload (the credential the backend verifies). A bare WebApp
 * object with empty `initData` means we're not in a real Telegram session, so
 * the app falls back to its normal browser flow (email login for dev/admin).
 */
export function isTelegramEnv(): boolean {
  return !!getTelegramWebApp()?.initData;
}

/**
 * Whether the Telegram client is new enough for a given Bot API feature.
 *
 * `WebApp.version` is the CLIENT's Bot API version, not the SDK's — the script
 * is the same file for everyone, so a method existing on the object says
 * nothing about whether the client will act on it. Below the required version
 * the SDK logs a console warning and drops the call, which is why anything
 * called repeatedly (once per rotation, say) checks first.
 */
export function isTelegramVersionAtLeast(version: string): boolean {
  const current = getTelegramWebApp()?.version;
  if (!current) return false;
  const parse = (value: string) => value.split('.').map(part => parseInt(part, 10) || 0);
  const [major, minor] = parse(current);
  const [needMajor, needMinor] = parse(version);
  return major !== needMajor ? major > needMajor : minor >= needMinor;
}

/** `t.me` / `telegram.me` / `telegram.dog` — links Telegram opens in itself. */
const TELEGRAM_HOST = /^(www\.)?(t|telegram)\.(me|dog)$/i;

/**
 * Opens an external URL from inside the Mini App.
 *
 * `window.open(url, '_blank')` is a **silent no-op** in the Telegram WebView —
 * the tap simply does nothing, which is what made the daily check-in task's
 * "Open" button look dead. A `t.me/…` link has to go through
 * `openTelegramLink` (opens the channel in the Telegram client, keeping the
 * Mini App alive); anything else through `openLink` (Telegram's in-app
 * browser). Outside Telegram — browser dev, desktop key — `window.open` is
 * still the right call, so it stays as the fallback.
 */
export function openExternalUrl(url?: string): void {
  if (!url) return;

  const webApp = getTelegramWebApp();
  if (webApp) {
    let isTelegramUrl = false;
    try {
      isTelegramUrl = TELEGRAM_HOST.test(new URL(url).hostname);
    } catch {
      // Not an absolute URL (relative path, tg:// scheme) — leave it to openLink.
    }

    if (isTelegramUrl && webApp.openTelegramLink) {
      webApp.openTelegramLink(url);
      return;
    }
    if (!isTelegramUrl && webApp.openLink) {
      webApp.openLink(url);
      return;
    }
  }

  if (typeof window !== 'undefined') window.open(url, '_blank', 'noopener,noreferrer');
}
