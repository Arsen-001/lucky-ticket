'use client';

import { useEffect, useState } from 'react';

function remaining(target?: number | null): number {
  if (!target) return 0;
  return Math.max(0, Math.ceil((target - Date.now()) / 1000));
}

/**
 * Whole seconds left until `target` (a timestamp), ticking down to 0.
 *
 * Deliberately not `useCountDown`: that one formats a duration for a date hours
 * or days away, while this is a handful of seconds rendered as a bare number.
 *
 * It re-reads the clock on every tick instead of decrementing a counter — the
 * Telegram client freezes timers in a backgrounded app, and a decrementing
 * counter would come back still showing the second it was frozen on.
 */
export function useSecondsUntil(target?: number | null): number {
  const [left, setLeft] = useState(() => remaining(target));

  useEffect(() => {
    setLeft(remaining(target));
    if (!target) return;
    // Faster than the second it displays, so the number turns over on time
    // rather than up to a second late.
    const timer = setInterval(() => {
      const next = remaining(target);
      setLeft(next);
      if (next <= 0) clearInterval(timer);
    }, 250);
    return () => clearInterval(timer);
  }, [target]);

  return left;
}
