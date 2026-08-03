'use client';

import { useTelegramLocale } from '@/hooks/useTelegramLocale';

/**
 * Mount point for the Telegram language seed. Renders nothing.
 *
 * It sits ABOVE `PreLaunchGate` on purpose. The gate returns the countdown
 * screen *instead of* its children while the app is closed, so anything below
 * it — including `TelegramProvider` — never mounts for a gated visitor. With
 * the seed underneath, a Russian player waiting for launch read an English
 * countdown, and the language only ever corrected itself after the gate opened.
 *
 * Safe this high in the tree: the hook no-ops outside Telegram and never
 * overrides a locale the player already has.
 */
export function TelegramLocaleSeed(): null {
  useTelegramLocale();
  return null;
}
