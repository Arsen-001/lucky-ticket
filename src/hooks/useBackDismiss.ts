'use client';

import { useEffect, useRef } from 'react';
import { pushBackHandler } from '@/lib/telegram/back-stack';

/**
 * Lets Telegram's back button (and the Android system back) close this overlay
 * instead of navigating the app underneath it. @see back-stack
 *
 * Pass the same `onClose` the backdrop and Escape use — Back is the third way
 * out of the same overlay, so all three should agree; an overlay that refuses
 * a backdrop tap passes `undefined` here too and lets Back fall through.
 */
export function useBackDismiss(open: boolean, onDismiss?: () => void): void {
  // Every caller passes an inline arrow, so `onDismiss` has a new identity on
  // each parent render. Registration must not depend on that: re-running the
  // effect would pop this overlay off the stack and push it back on TOP, which
  // on a screen that re-renders on a timer (Home ticks once a second for the
  // engine) silently rewrites which overlay Back closes. The identity lives in
  // a ref instead, and only `open` moves the registration.
  const latest = useRef(onDismiss);
  useEffect(() => {
    latest.current = onDismiss;
  });

  const dismissible = !!onDismiss;
  useEffect(() => {
    if (!open || !dismissible) return;
    return pushBackHandler(() => latest.current?.());
  }, [open, dismissible]);
}
