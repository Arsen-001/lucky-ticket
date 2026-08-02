'use client';

import { useEffect, useState } from 'react';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Keeps an open overlay the only thing you can reach.
 *
 * Overlays already handled the closed state — nothing in the DOM, `inert`,
 * `aria-hidden`. The open state had none of it: measured on a production build,
 * every sheet and modal in the app left 20–103 focusable controls live behind it,
 * and the very first Tab landed on the page underneath. The dialog looked modal
 * and behaved like a floating panel: keyboard focus wandered off into content the
 * player could not see, and the page kept scrolling behind a sheet.
 *
 * Focus goes to the panel itself rather than its first control — the first
 * control is often a text input, and focusing that pops the on-screen keyboard
 * open the moment the sheet appears. The panel needs `tabIndex={-1}` for this.
 *
 * Restores the previously focused element on close, so dismissing a dialog puts
 * the caret back on the button that opened it.
 *
 * The Drawer keeps its own copy of this: its Tab handling is interleaved with
 * Escape and swipe-to-close, and prying those apart is not worth the risk.
 *
 * Returns a ref callback for the panel. It has to be a callback rather than a
 * `useRef`, because the panel arrives late: it lives inside a `ClientPortal`,
 * which itself only renders after its own mount effect. Keyed on `open` alone,
 * this effect ran while the ref was still empty and then never ran again — it
 * silently did nothing, which is how it passed review the first time. A callback
 * ref stores the node in state, so the effect runs exactly when both the overlay
 * is open and the node exists.
 */
export function useOverlayFocusLock(open: boolean) {
  const [panel, setPanel] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!open || !panel || typeof document === 'undefined') return;

    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    panel.focus({ preventScroll: true });

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || active === panel)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      } else if (active instanceof HTMLElement && !panel.contains(active)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus({ preventScroll: true });
    };
  }, [open, panel]);

  return setPanel;
}
