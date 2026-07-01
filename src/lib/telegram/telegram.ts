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
