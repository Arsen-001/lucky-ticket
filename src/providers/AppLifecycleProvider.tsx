'use client';

import { useEffect } from 'react';
import { getTelegramWebApp } from '@/lib/telegram/telegram';

/**
 * Long-session resilience for the Telegram Mini App.
 *
 * The Mini App can stay open (or backgrounded) for a very long time. Over a
 * long-lived WebView session heap and timers accumulate, and Telegram / iOS
 * aggressively throttle a backgrounded page — which has shown up as the app
 * becoming unresponsive after a long session (even the native close button
 * stops responding), recoverable only by fully restarting Telegram.
 *
 * This provider adds the lifecycle awareness the app otherwise lacks entirely
 * (nothing in `src/` listened to `visibilitychange` or Telegram's
 * activated/deactivated events):
 *
 *  1. Pause every running animation while hidden (`data-app-hidden` on <html>
 *     → `animation-play-state: paused`, see base-layer.css), so a backgrounded
 *     tab isn't burning the compositor on infinite shine/blink/spin loops.
 *  2. Reload on return from a *long* background — the cheapest reliable heap
 *     reset, which also re-authenticates and pulls fresh data. Short
 *     backgrounds (a tab peek, a quick app switch) are left untouched.
 *  3. A wall-clock watchdog: if a tick lands far later than scheduled while the
 *     page is foreground, the main thread was wedged — reload to recover.
 *
 * Renders nothing; mounted once at the root. Device-agnostic hygiene — it does
 * not depend on which client froze, so it is safe everywhere the app runs.
 */

/** Background longer than this → reload on return (heap reset + re-auth + fresh data). */
const RELOAD_AFTER_HIDDEN_MS = 15 * 60 * 1000;
/** Watchdog cadence. */
const WATCHDOG_INTERVAL_MS = 30 * 1000;
/** A foreground tick this much later than scheduled = the main thread stalled. */
const WATCHDOG_STALL_MS = 90 * 1000;

export function AppLifecycleProvider() {
  useEffect(() => {
    const root = document.documentElement;
    let hiddenAt: number | null = null;
    let lastTick = Date.now();

    const markHidden = () => {
      if (hiddenAt !== null) return;
      hiddenAt = Date.now();
      root.dataset.appHidden = 'true';
    };

    const markVisible = () => {
      const since = hiddenAt;
      hiddenAt = null;
      // Reset the watchdog baseline across the gap so a long, expected
      // background throttle doesn't read as a stall on the first tick back.
      lastTick = Date.now();
      delete root.dataset.appHidden;
      if (since !== null && Date.now() - since > RELOAD_AFTER_HIDDEN_MS) {
        window.location.reload();
      }
    };

    const onVisibilityChange = () => {
      if (document.hidden) markHidden();
      else markVisible();
    };

    document.addEventListener('visibilitychange', onVisibilityChange);

    // Telegram (Bot API 8.0+) fires activated/deactivated as the Mini App goes
    // fore/background inside the client — a signal `visibilitychange` doesn't
    // always deliver there. No-ops on older clients.
    const tg = getTelegramWebApp();
    tg?.onEvent?.('activated', markVisible);
    tg?.onEvent?.('deactivated', markHidden);

    const watchdog = window.setInterval(() => {
      const now = Date.now();
      const drift = now - lastTick - WATCHDOG_INTERVAL_MS;
      lastTick = now;
      // Only act while foreground: background timers are throttled by design,
      // so their drift is expected and must never trigger a reload.
      if (!document.hidden && hiddenAt === null && drift > WATCHDOG_STALL_MS) {
        window.location.reload();
      }
    }, WATCHDOG_INTERVAL_MS);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      tg?.offEvent?.('activated', markVisible);
      tg?.offEvent?.('deactivated', markHidden);
      clearInterval(watchdog);
    };
  }, []);

  return null;
}
