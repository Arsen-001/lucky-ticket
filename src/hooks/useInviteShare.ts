'use client';

import { useState } from 'react';
import { getTelegramWebApp, isTelegramEnv } from '@/lib/telegram/telegram';

export interface UseInviteShareOptions {
  /** `t.me/<bot>?startapp=<id>`. Empty while the inviter's id is unknown. */
  link: string;
  /** Caption for the plain-link fallbacks (Telegram's share sheet, the OS one). */
  text: string;
  /** Title for the OS share sheet, used only outside Telegram. */
  title?: string;
  /**
   * Prepares the rich invite card server-side and resolves its id. Rejecting is
   * an expected outcome, not an error to report: the share quietly falls back
   * to the plain link, which carries the same referral.
   */
  prepareCard?: () => Promise<string>;
  /**
   * Called once a share actually went out. `confirmed` is true only when
   * Telegram reported delivery (or the OS sheet resolved); the fallback paths
   * give no signal and report optimistically.
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
 * Three paths, best first, each falling through to the next so a tap never
 * dead-ends:
 *
 *  1. **Rich card** (Bot API 8.0+) — image + caption + "Play" button, prepared
 *     by the backend and forwarded through Telegram's native chat picker.
 *  2. **Plain Telegram share** — `t.me/share/url`, which minimises the Mini App
 *     and opens the same picker with a bare link. No delivery callback exists
 *     here, so a share is recorded optimistically.
 *  3. **Outside Telegram** — the OS share sheet, then the clipboard.
 *
 * Shared between the in-app invite screen and the pre-launch countdown, which
 * fetch their link and prepare their card through completely different plumbing
 * (RTK Query vs. a bare token) but must behave identically once tapped.
 */
export function useInviteShare({
  link,
  text,
  title,
  prepareCard,
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
      if (webApp.shareMessage && prepareCard) {
        try {
          const id = await prepareCard();
          // The callback fires with sent=true only if the user actually
          // forwarded the card — the reliable "did they share" signal.
          webApp.shareMessage(id, sent => {
            if (sent) onShared?.(true);
          });
          return;
        } catch {
          /* fall through to the plain t.me/share/url flow */
        }
      }

      if (webApp.openTelegramLink) {
        webApp.openTelegramLink(
          `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`
        );
        onShared?.(false);
        return;
      }
    }

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ url: link, title, text });
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
