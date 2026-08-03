'use client';

import { useEffect } from 'react';
import { getTelegramWebApp } from '@/lib/telegram/telegram';

/** App background — keeps the Telegram header/body chrome on-theme. */
const THEME_BG = '#1b1930';

/**
 * Tell the Telegram client we are on screen, and paint its chrome our colour.
 *
 * Normally `TelegramProvider` does this on boot — but the screens that render
 * INSTEAD of the app (the pre-launch countdown, the maintenance wall) live
 * outside it, and Telegram keeps its own loading placeholder over the Mini App
 * until something calls `ready()`. Without this those screens sit invisible
 * behind Telegram's spinner: the app reads as hung rather than as closed.
 *
 * Deliberately a subset of what the provider does — no `requestFullscreen`, no
 * swipe locking: these are single, scrollable screens with no chrome of their
 * own to protect. Safe to call more than once; every call here is idempotent.
 */
export function useTelegramChrome(): void {
  useEffect(() => {
    const tg = getTelegramWebApp();
    if (!tg) return;
    try {
      tg.ready();
      tg.expand();
      tg.setHeaderColor?.(THEME_BG);
      tg.setBackgroundColor?.(THEME_BG);
    } catch {
      /* SDK chrome is best-effort — never let it break the screen it decorates */
    }
  }, []);
}
