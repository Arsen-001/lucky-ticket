'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { TourStep } from '@/constants/onboarding-tour.constants';

export type TourTargetPhase = 'searching' | 'targeted' | 'fallback';

export interface TourTargetState {
  /** Viewport-relative box of the anchored element, or null while searching / on fallback. */
  rect: DOMRect | null;
  /** The anchored element (needed to fire its real click on `realAction` steps). */
  targetEl: HTMLElement | null;
  /** searching → navigating / waiting for the anchor; targeted → found; fallback → gave up. */
  phase: TourTargetPhase;
}

/** How long to wait for a step's anchor to mount before falling back to a centered card. */
const ANCHOR_WAIT_MS = 2500;

/** Smallest box containing both rects — used to spotlight a step's two anchors at once. */
const unionRect = (a: DOMRect, b: DOMRect): DOMRect => {
  const left = Math.min(a.left, b.left);
  const top = Math.min(a.top, b.top);
  const right = Math.max(a.right, b.right);
  const bottom = Math.max(a.bottom, b.bottom);
  return new DOMRect(left, top, right - left, bottom - top);
};

/**
 * Drives a single tour step: navigates to its screen, waits for the
 * `[data-tour="…"]` anchor to mount (MutationObserver + timeout), scrolls it
 * into view, and keeps its measured rect fresh while shown. Fully generic —
 * every step is handled the same way, so adding a step needs no changes here.
 */
export function useTourTarget(step: TourStep | null, active: boolean): TourTargetState {
  const router = useRouter();
  const pathname = usePathname();
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [targetEl, setTargetEl] = useState<HTMLElement | null>(null);
  // Mirrors the currently-anchored node so the sync loop can detect when React
  // has swapped it out (remount) without churning the effect's deps.
  const targetElRef = useRef<HTMLElement | null>(null);
  const [phase, setPhase] = useState<TourTargetPhase>('searching');
  const stepId = step?.id;
  const secondaryAnchor = step?.secondaryAnchor ?? null;

  // Measure the anchor — and, when the step declares a secondary anchor, the
  // union of both so the spotlight covers two elements (e.g. two tab rows).
  const measureRect = (el: HTMLElement): DOMRect => {
    const primary = el.getBoundingClientRect();
    if (!secondaryAnchor) return primary;
    const secondary = document.querySelector<HTMLElement>(`[data-tour="${secondaryAnchor}"]`);
    return secondary ? unionRect(primary, secondary.getBoundingClientRect()) : primary;
  };

  // Navigate to the step's screen when we're not already there.
  useEffect(() => {
    if (!active || !step) return;
    if (pathname !== step.route) router.push(step.route);
  }, [active, stepId, pathname]);

  // Locate + measure the anchor on the current screen.
  useEffect(() => {
    if (!active || !step) {
      setRect(null);
      setTargetEl(null);
      targetElRef.current = null;
      setPhase('searching');
      return;
    }

    setPhase('searching');
    setTargetEl(null);
    targetElRef.current = null;

    const selector = `[data-tour="${step.anchor}"]`;
    let settled = false;
    let raf = 0;
    let timeoutId = 0;
    let settleTimer = 0;
    let observer: MutationObserver | null = null;

    const lockOn = (el: HTMLElement) => {
      settled = true;
      observer?.disconnect();
      window.clearTimeout(timeoutId);
      const r0 = el.getBoundingClientRect();
      const visible = r0.top >= 0 && r0.bottom <= window.innerHeight && r0.left >= 0;
      if (!visible) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Don't spotlight a moving target: entry animations (slide-in-bottom) and
      // the smooth scroll above shift the anchor for a few hundred ms after it
      // mounts. Poll until the rect holds still for two ticks (~180ms) — the
      // ring then appears directly at its final position instead of visibly
      // chasing the element. Capped so a permanently-animating anchor still locks.
      let last: DOMRect | null = null;
      let stableTicks = 0;
      let polls = 0;
      const poll = () => {
        // Survive a remount mid-settle (e.g. data landing) by re-querying.
        const node = document.querySelector<HTMLElement>(selector) ?? el;
        const r = node.getBoundingClientRect();
        const still =
          !!last &&
          Math.abs(r.top - last.top) < 1 &&
          Math.abs(r.left - last.left) < 1 &&
          Math.abs(r.width - last.width) < 1 &&
          Math.abs(r.height - last.height) < 1;
        stableTicks = still ? stableTicks + 1 : 0;
        last = r;
        polls += 1;
        if ((stableTicks >= 2 && r.width >= 1 && r.height >= 1) || polls >= 16) {
          targetElRef.current = node;
          setTargetEl(node);
          setRect(measureRect(node));
          setPhase('targeted');
          return;
        }
        settleTimer = window.setTimeout(poll, 90);
      };
      raf = window.requestAnimationFrame(poll);
    };

    const tryFind = () => {
      const el = document.querySelector<HTMLElement>(selector);
      if (el) {
        lockOn(el);
        return true;
      }
      return false;
    };

    if (!tryFind()) {
      observer = new MutationObserver(() => {
        if (!settled) tryFind();
      });
      observer.observe(document.body, { childList: true, subtree: true });
      timeoutId = window.setTimeout(() => {
        if (settled) return;
        settled = true;
        observer?.disconnect();
        setTargetEl(null);
        setRect(null);
        setPhase('fallback');
      }, ANCHOR_WAIT_MS);
    }

    return () => {
      observer?.disconnect();
      window.clearTimeout(timeoutId);
      window.clearTimeout(settleTimer);
      window.cancelAnimationFrame(raf);
    };
  }, [active, stepId, pathname]);

  // Keep the rect in sync while the step is shown (scroll / resize / layout shift).
  // Re-query the anchor every tick instead of trusting the cached node: cards
  // like the engine reactor (its `key` changes each production cycle) and the
  // first tournament card (countdown / refetch) remount, which detaches the old
  // node — measuring a detached node returns an all-zero rect and snaps the
  // spotlight to the top-left corner. Skip zero-size rects for the same reason.
  useEffect(() => {
    if (!active || phase !== 'targeted' || !step) return;
    const selector = `[data-tour="${step.anchor}"]`;
    const update = () => {
      const el = document.querySelector<HTMLElement>(selector);
      if (!el) return; // gone this frame (mid-remount) — keep the last good rect
      const r = measureRect(el);
      if (r.width < 1 || r.height < 1) return; // degenerate — keep the last good rect
      if (el !== targetElRef.current) {
        targetElRef.current = el;
        setTargetEl(el);
      }
      // Only commit meaningful moves (>1px) — re-setting an identical rect every
      // tick re-renders the overlay for nothing and reads as shimmer.
      setRect(prev =>
        prev &&
        Math.abs(prev.top - r.top) < 1 &&
        Math.abs(prev.left - r.left) < 1 &&
        Math.abs(prev.width - r.width) < 1 &&
        Math.abs(prev.height - r.height) < 1
          ? prev
          : r
      );
    };
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    const intervalId = window.setInterval(update, 200);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
      window.clearInterval(intervalId);
    };
  }, [active, phase, stepId, secondaryAnchor]);

  return { rect, targetEl, phase };
}
