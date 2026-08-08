'use client';

import { useEffect } from 'react';
import { getTelegramWebApp, isTelegramVersionAtLeast } from '@/lib/telegram/telegram';
import { getDeviceKind } from '@/lib/telegram/platform';

/**
 * Marks a phone-class Telegram session on `<html>` so `portrait-gate.css` can
 * refuse landscape there at ANY viewport height — a tablet held sideways is
 * still 700px tall and would slip past a height-only rule. Kept as a data
 * attribute rather than React state because the gate itself is pure CSS: the
 * rule has to hold on the very first paint and through every rotation, with no
 * render in between.
 */
const PHONE_SESSION_ATTR = 'tgPhone';

/**
 * Keep the app upright.
 *
 * Two layers, because neither is enough on its own:
 *
 * 1. **The client is asked not to rotate at all** — `lockOrientation()` (Bot
 *    API 8.0+). This is the only one that prevents the rotation rather than
 *    apologising for it, so it is the one that matters on a current client.
 *    Telegram locks the orientation the app is *currently* in, so it may only
 *    be called while portrait: locking a landscape app would freeze it
 *    landscape. If the app is opened sideways we explicitly *un*lock instead,
 *    so the device can still be turned back, and lock the moment it is.
 * 2. **Landscape is walled off in CSS** — @see PortraitOnlyGate. Older clients,
 *    Android split-screen, and every non-Telegram browser ignore layer 1
 *    entirely, and a lock request can also simply fail. The wall does not
 *    depend on any of that: a media query cannot be missed, and it re-evaluates
 *    on rotation without a listener.
 */
export function usePortraitOnly(): void {
  useEffect(() => {
    const root = document.documentElement;
    if (getDeviceKind() === 'telegram-mobile') root.dataset[PHONE_SESSION_ATTR] = 'true';

    const tg = getTelegramWebApp();
    // Outside Telegram there is nothing to ask; the CSS wall still applies.
    if (!tg?.initData || !isTelegramVersionAtLeast('8.0')) return;

    const portrait = window.matchMedia('(orientation: portrait)');
    const sync = () => {
      try {
        if (portrait.matches) tg.lockOrientation?.();
        else tg.unlockOrientation?.();
      } catch {
        /* Best-effort: the CSS wall is what actually holds the rule */
      }
    };

    sync();
    portrait.addEventListener('change', sync);
    return () => portrait.removeEventListener('change', sync);
  }, []);
}
