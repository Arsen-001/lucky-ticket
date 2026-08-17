'use client';

import { useRef, useState } from 'react';

export interface InFlightLock {
  /** Is a request for this key already in flight? Synchronous — safe inside a tap handler. */
  isLocked: (key: string) => boolean;
  /**
   * Take the lock. Returns `false` (and does nothing) if it was already held,
   * so a handler can be written as `if (!lock.acquire(id)) return;`.
   */
  acquire: (key: string) => boolean;
  release: (key: string) => void;
  /** Rendered state — for dimming the button that holds the lock. */
  locked: ReadonlySet<string>;
}

/**
 * One request per key at a time, keyed by whatever the server serialises on —
 * an engine id, a chip id.
 *
 * Why not the mutation hook's `isLoading`: RTK auto-batches the mutation's
 * `pending` action, so the re-render that would disable the button can land a
 * frame after the tap. Two taps inside that frame both reach the server, and
 * the second loses the backend's compare-and-swap — which used to surface as
 * «Покупка не прошла» after a purchase that had gone through (upgrades,
 * 18.08.2026). The lock is a ref, mutated in the handler itself, so the second
 * tap sees it no matter when React paints; the state only mirrors it for the
 * dimmed button.
 */
export function useInFlightLock(): InFlightLock {
  const ref = useRef<Set<string>>(new Set());
  const [locked, setLocked] = useState<ReadonlySet<string>>(() => new Set());

  const set = (key: string, on: boolean) => {
    if (on) ref.current.add(key);
    else ref.current.delete(key);
    setLocked(prev => {
      if (prev.has(key) === on) return prev;
      const next = new Set(prev);
      if (on) next.add(key);
      else next.delete(key);
      return next;
    });
  };

  return {
    isLocked: key => ref.current.has(key),
    acquire: key => {
      if (ref.current.has(key)) return false;
      set(key, true);
      return true;
    },
    release: key => set(key, false),
    locked,
  };
}
