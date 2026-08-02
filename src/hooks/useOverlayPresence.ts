'use client';

import { useEffect, useState } from 'react';

/**
 * Presence state for a portal overlay — keeps a closed overlay out of the DOM
 * without losing its enter/exit transition.
 *
 * Overlays used to render their whole subtree at all times and merely fade it
 * out. Inside a list that costs one `fixed inset-0` backdrop-blur layer — plus
 * its images and infinite animations — for every row, even though none of them
 * is on screen. A 40-row tournaments History tab held ~130 full-viewport
 * composited layers and ~5k portal nodes at once, which is what pushed the iOS
 * WebView past its renderer memory budget (the Mini App reloads, then wedges).
 *
 * `mounted` gates rendering; `visible` drives the open-state classes and flips
 * a frame later, so the closed styles paint once and the enter transition has
 * something to animate from.
 */
export function useOverlayPresence(open: boolean, animationMs: number) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      // Two frames: the first commits the closed styles, the second starts the
      // transition. One frame would let React batch both into a single paint.
      let second = 0;
      const first = requestAnimationFrame(() => {
        second = requestAnimationFrame(() => setVisible(true));
      });
      return () => {
        cancelAnimationFrame(first);
        cancelAnimationFrame(second);
      };
    }

    setVisible(false);
    const timer = window.setTimeout(() => setMounted(false), animationMs);
    return () => window.clearTimeout(timer);
  }, [open, animationMs]);

  return { mounted, visible };
}
