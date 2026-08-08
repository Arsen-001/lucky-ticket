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
 * Marks that the DEVICE reports itself upright, which switches the wall off
 * whatever the viewport looks like. @see isDeviceUpright — this attribute is
 * the whole reason the wall stopped firing at an upright phone.
 *
 * Also set pre-paint by an inline script in the root layout, so a webview that
 * opens short and wide never flashes the wall before hydration.
 */
const DEVICE_PORTRAIT_ATTR = 'devicePortrait';

/**
 * Is the phone itself upright — as opposed to the *viewport* being wider than
 * it is tall, which is a different question entirely and the one that shipped
 * as the rule by mistake.
 *
 * A Telegram Mini App does not own the window: its webview is short and wide on
 * a perfectly upright phone in compact mode (before `expand()`), during the
 * fullscreen transition, with the keyboard open, and in Android split-screen.
 * `(orientation: landscape)` is true in every one of those, which is how an
 * upright player ended up staring at "turn your phone upright".
 *
 * `screen.orientation` answers about the SCREEN, so none of that moves it.
 * `window.orientation` is the same answer on clients too old for it (iOS below
 * 16.4). `null` means neither exists — the caller then falls back to the
 * viewport, i.e. to the old behaviour, rather than dropping the rule entirely.
 */
function isDeviceUpright(): boolean | null {
  const type = window.screen?.orientation?.type;
  if (type) return type.startsWith('portrait');

  const angle = (window as Window & { orientation?: number }).orientation;
  if (typeof angle === 'number') return Math.abs(angle) !== 90;

  return null;
}

/**
 * Keep the app upright.
 *
 * Two layers, because neither is enough on its own:
 *
 * 1. **The client is asked not to rotate at all** — `lockOrientation()` (Bot
 *    API 8.0+). This is the only one that prevents the rotation rather than
 *    apologising for it, so it is the one that matters on a current client.
 *    Telegram locks the orientation the app is *currently* in, so it may only
 *    be called while the phone is upright: locking a sideways app would freeze
 *    it sideways. Opened sideways we explicitly *un*lock instead, so the device
 *    can still be turned back, and lock the moment it is.
 * 2. **Landscape is walled off in CSS** — @see PortraitOnlyGate. Older clients,
 *    Android split-screen, and every non-Telegram browser ignore layer 1
 *    entirely, and a lock request can also simply fail. The wall does not
 *    depend on any of that: a media query cannot be missed, and it re-evaluates
 *    on rotation without a listener.
 *
 * Both layers ask the DEVICE which way it is facing (@see isDeviceUpright) and
 * not the viewport. Reading the viewport got layer 1 backwards too: a compact
 * webview looks landscape, so the app was *unlocking* the rotation of a phone
 * that was upright all along.
 */
export function usePortraitOnly(): void {
  useEffect(() => {
    const root = document.documentElement;
    if (getDeviceKind() === 'telegram-mobile') root.dataset[PHONE_SESSION_ATTR] = 'true';

    const tg = getTelegramWebApp();
    const canLock = !!tg?.initData && isTelegramVersionAtLeast('8.0');

    const sync = () => {
      // Unknown device orientation → the viewport is all there is to go on.
      const upright = isDeviceUpright() ?? window.matchMedia('(orientation: portrait)').matches;

      if (upright) root.dataset[DEVICE_PORTRAIT_ATTR] = 'true';
      else delete root.dataset[DEVICE_PORTRAIT_ATTR];

      if (!canLock) return;
      try {
        if (upright) tg?.lockOrientation?.();
        else tg?.unlockOrientation?.();
      } catch {
        /* Best-effort: the CSS wall is what actually holds the rule */
      }
    };

    sync();

    // Three sources for one event, because they do not all fire everywhere:
    // `screen.orientation` is the modern one, `orientationchange` covers older
    // WebKit, and `resize` catches a client that resizes the webview first and
    // updates the orientation a frame later.
    const orientation = window.screen?.orientation;
    orientation?.addEventListener?.('change', sync);
    window.addEventListener('orientationchange', sync);
    window.addEventListener('resize', sync);

    return () => {
      orientation?.removeEventListener?.('change', sync);
      window.removeEventListener('orientationchange', sync);
      window.removeEventListener('resize', sync);
    };
  }, []);
}
