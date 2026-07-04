'use client';

import '@/styles/components/fullscreen-brand.css';

/**
 * Branded title rendered into Telegram's fullscreen top strip — the band where
 * Telegram floats its close/menu buttons and where the app name is otherwise
 * absent. It sits inside the content-safe-area (below the OS status bar,
 * vertically aligned with those buttons) and centered horizontally, so it never
 * collides with the far-right control pill.
 *
 * Purely decorative chrome (`aria-hidden`) — the page keeps its own headings.
 * A no-op outside Telegram fullscreen: CSS hides it unless `<html>` carries
 * `data-tg-fullscreen="true"` (set by TelegramProvider), so it never overlays a
 * plain browser or a non-fullscreen Telegram session.
 */
export function FullscreenBrandBar() {
  return (
    <div aria-hidden className="fullscreen-brand-bar">
      <span className="fullscreen-brand-bar__inner">
        <span className="fullscreen-brand-bar__text">
          LuckyTicket<span className="fullscreen-brand-bar__accent">365</span>
        </span>
      </span>
    </div>
  );
}
