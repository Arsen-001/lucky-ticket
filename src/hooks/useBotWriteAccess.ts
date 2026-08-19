'use client';

import { useCallback, useEffect, useState } from 'react';
import { getTelegramWebApp, isTelegramVersionAtLeast } from '@/lib/telegram/telegram';
import type { TelegramWebApp } from '@/types/interfaces/telegram.interfaces';

/** Bot API version that introduced `requestWriteAccess` / `allows_write_to_pm`. */
const WRITE_ACCESS_MIN_VERSION = '6.9';

/**
 * Whether the native permission popup can be shown to this player at all.
 *
 * Pure, and exported, because all three ways it can answer "no" are silent
 * failures otherwise: outside Telegram there is no SDK, a client older than 6.9
 * has no method (calling it just logs to the console and does nothing), and a
 * player who already granted the permission must not be asked again.
 */
export function canAskWriteAccess(
  tg: Pick<TelegramWebApp, 'initData' | 'requestWriteAccess'> | undefined,
  versionAtLeast: (version: string) => boolean
): boolean {
  if (!tg?.initData) return false;
  if (typeof tg.requestWriteAccess !== 'function') return false;
  return versionAtLeast(WRITE_ACCESS_MIN_VERSION);
}

/**
 * Whether the bot is allowed to write to this player, and the one-tap way to ask.
 *
 * A Telegram bot may not open a conversation on its own: until the player has
 * allowed it, every DM the game sends them comes back `Bad Request: chat not
 * found` or `Forbidden: bot can't initiate conversation with a user`. That is
 * not an edge case here — a Mini App player arrives by link, QR or inline
 * result and never meets the bot, so on 19.08.2026 production delivered ZERO of
 * ~1000 engine-ready reminders. Every notification toggle in Settings was
 * promising something that could not happen.
 *
 * `requestWriteAccess` fixes that with a native permission popup — no "go find
 * the bot and press Start". Telegram only shows it in response to a real user
 * interaction, so `ask()` belongs in a tap handler; calling it from an effect
 * on mount is silently ignored.
 *
 * `granted` is read from the signed `initData` the client was launched with, so
 * it does not update mid-session — after a successful `ask()` the local state
 * is what carries the news until the next launch.
 */
export function useBotWriteAccess() {
  const [granted, setGranted] = useState(false);
  const [supported, setSupported] = useState(false);
  const [asking, setAsking] = useState(false);

  // Resolved in an effect, not during render: `window.Telegram` does not exist
  // on the server, and a first client render that disagreed with SSR would
  // hydrate-mismatch the card this drives.
  useEffect(() => {
    const tg = getTelegramWebApp();
    if (!tg?.initData) return;
    setSupported(canAskWriteAccess(tg, isTelegramVersionAtLeast));
    setGranted(!!tg.initDataUnsafe?.user?.allows_write_to_pm);
  }, []);

  const ask = useCallback(() => {
    const tg = getTelegramWebApp();
    if (!tg?.requestWriteAccess || asking) return Promise.resolve(false);
    setAsking(true);
    return new Promise<boolean>(resolve => {
      // Guarded against a client that never calls back (the popup was dismissed
      // by the OS, an old WebView): without this the button would spin forever.
      let settled = false;
      const settle = (ok: boolean) => {
        if (settled) return;
        settled = true;
        setAsking(false);
        if (ok) setGranted(true);
        resolve(ok);
      };
      const timeout = setTimeout(() => settle(false), 60_000);
      tg.requestWriteAccess?.(ok => {
        clearTimeout(timeout);
        settle(!!ok);
      });
    });
  }, [asking]);

  return {
    /** The bot may already write to this player — nothing to ask. */
    granted,
    /** The popup can be shown: inside Telegram, on a client new enough. */
    canAsk: supported && !granted,
    /** The popup is open. */
    asking,
    ask,
  };
}
