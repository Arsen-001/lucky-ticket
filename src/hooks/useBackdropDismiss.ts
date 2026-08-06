'use client';

import { useEffect, useRef } from 'react';
import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from 'react';
import { noteDismissIntent } from '@/lib/debug/overlay-probe';

/**
 * Tap-to-dismiss for an overlay backdrop that only fires on a real press.
 *
 * A closed overlay is no longer in the DOM (see useOverlayPresence), so the tap
 * that opens one puts a full-screen backdrop under the finger that was not there
 * when the finger went down. A touch does not end at `touchend`: the webview
 * still delivers the compatibility `click` afterwards, and it hit-tests against
 * the DOM as it is at that moment — the backdrop. The overlay opened and closed
 * itself from a single tap, which on the Home header's Stars pill looked like the
 * sheet flashing and vanishing.
 *
 * Two conditions, both required:
 *
 *  1. The press started on the backdrop. A stray click arriving without its own
 *     `pointerdown` on the backdrop — the click belonging to the tap that opened
 *     the overlay — is not a dismissal. This also means a drag that starts on the
 *     panel and releases over the backdrop no longer closes it.
 *  2. The enter transition has finished. A tap landing while the panel is still
 *     sliding in is never a considered "dismiss this".
 *
 * Returns props to spread on the backdrop element.
 */
export function useBackdropDismiss(visible: boolean, animationMs: number, onDismiss?: () => void) {
  const openedAt = useRef(0);
  const pressedOnBackdrop = useRef(false);

  useEffect(() => {
    if (visible) openedAt.current = performance.now();
  }, [visible]);

  return {
    onPointerDown: (event: ReactPointerEvent<HTMLElement>) => {
      pressedOnBackdrop.current = event.target === event.currentTarget;
    },
    onPointerCancel: () => {
      pressedOnBackdrop.current = false;
    },
    onClick: (event: ReactMouseEvent<HTMLElement>) => {
      const pressed = pressedOnBackdrop.current;
      pressedOnBackdrop.current = false;

      if (!onDismiss) return;

      // A click the guard turns down is the interesting one in the field: it is
      // the shape a stray tap-leftover has. Recorded either way so the probe can
      // say which of the two happened — see lib/debug/overlay-probe.
      const rejected =
        !pressed ||
        event.target !== event.currentTarget ||
        performance.now() - openedAt.current < animationMs;

      noteDismissIntent(rejected ? 'backdrop-blocked' : 'backdrop');
      if (rejected) return;

      onDismiss();
    },
  };
}
