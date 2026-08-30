'use client';

import { useState } from 'react';
import { getTelegramWebApp, isTelegramEnv } from '@/lib/telegram/telegram';

export interface UseInviteShareOptions {
  /** `t.me/<bot>?startapp=<id>`. Empty while the inviter's id is unknown. */
  link: string;
  /** Title for the OS share sheet, used only outside Telegram. */
  title?: string;
  /**
   * Called once a share actually went out. `confirmed` is true only when the OS
   * sheet resolved; inside Telegram there is no delivery callback on this path,
   * so the share is reported optimistically.
   */
  onShared?: (confirmed: boolean) => void;
}

export interface InviteShareControls {
  /** True for ~2s after a copy, for the button's checkmark state. */
  copied: boolean;
  copy: () => Promise<void>;
  share: () => Promise<void>;
  /** False until there is a link — callers keep their buttons busy until then. */
  ready: boolean;
}

/**
 * The one place that knows how to hand a referral link to another person.
 *
 * What goes out is the bare link and nothing else — byte for byte what the
 * copy button puts on the clipboard, so a shared invite is indistinguishable
 * from one a person pasted by hand. Telegram expands it into the bot's own
 * preview at the far end.
 *
 * Two paths, each falling through to the next so a tap never dead-ends:
 *
 *  1. **Telegram share** — `t.me/share/url`, which minimises the Mini App and
 *     opens the native chat picker with the link. No delivery callback exists
 *     here, so a share is recorded optimistically.
 *  2. **Outside Telegram** — the OS share sheet, then the clipboard.
 *
 * There used to be a third, first: a server-prepared rich card (image, caption,
 * "Play" button) forwarded with `WebApp.shareMessage`. Both screens dropped it
 * on 31.08.2026 — the plain link is what the user asked for on each. The
 * backend route and its admin editor are still there, so bringing it back is a
 * revert, not a rebuild.
 *
 * Shared between the in-app invite screen and the pre-launch countdown, which
 * fetch their link through completely different plumbing (RTK Query vs. a bare
 * token) but must behave identically once tapped.
 */
export function useInviteShare({
  link,
  title,
  onShared,
}: UseInviteShareOptions): InviteShareControls {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard denied — nothing useful to say */
    }
  };

  const share = async () => {
    if (!link) return;
    const webApp = getTelegramWebApp();

    if (isTelegramEnv() && webApp) {
      if (webApp.openTelegramLink) {
        // No `text=` on purpose, and NOT an empty one: an empty caption still
        // occupies the caption slot, while leaving the parameter off sends the
        // link on its own and lets Telegram render the bot's preview.
        webApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(link)}`);
        onShared?.(false);
        return;
      }
    }

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ url: link, title });
        onShared?.(true);
        return;
      } catch {
        /* user cancelled */
      }
    }

    await copy();
  };

  return { copied, copy, share, ready: !!link };
}
