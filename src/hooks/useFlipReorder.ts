'use client';

import { useLayoutEffect, useRef } from 'react';

/**
 * FLIP (First → Last → Invert → Play) hook for list re-order animations.
 * Capture each tracked element's position before paint, compare against the
 * previous frame, and apply an inverse transform that animates to zero — so
 * the visible item appears to glide from its old slot to its new one.
 *
 * Usage:
 *   const { registerRef } = useFlipReorder(visibleChips.map(c => c.id), 400);
 *   ...
 *   <div ref={registerRef(chip.id)} key={chip.id} />
 */
export function useFlipReorder(keys: readonly string[], durationMs = 450) {
  const refsByKey = useRef<Map<string, HTMLElement>>(new Map());
  const prevRectsRef = useRef<Map<string, DOMRect>>(new Map());

  useLayoutEffect(() => {
    const newRects = new Map<string, DOMRect>();
    refsByKey.current.forEach((el, key) => {
      newRects.set(key, el.getBoundingClientRect());
    });

    newRects.forEach((newRect, key) => {
      const prevRect = prevRectsRef.current.get(key);
      if (!prevRect) return;
      const dx = prevRect.left - newRect.left;
      const dy = prevRect.top - newRect.top;
      if (dx === 0 && dy === 0) return;

      const el = refsByKey.current.get(key);
      if (!el) return;

      el.style.transition = 'none';
      el.style.transform = `translate(${dx}px, ${dy}px)`;
      el.style.willChange = 'transform';

      requestAnimationFrame(() => {
        el.style.transition = `transform ${durationMs}ms cubic-bezier(0.22, 1, 0.36, 1)`;
        el.style.transform = '';
      });

      const cleanup = () => {
        el.style.transition = '';
        el.style.transform = '';
        el.style.willChange = '';
        el.removeEventListener('transitionend', cleanup);
      };
      el.addEventListener('transitionend', cleanup);
    });

    prevRectsRef.current = newRects;
  }, [keys.join('|'), durationMs]);

  const registerRef = (key: string) => (el: HTMLElement | null) => {
    if (el) {
      refsByKey.current.set(key, el);
    } else {
      refsByKey.current.delete(key);
    }
  };

  return { registerRef };
}
