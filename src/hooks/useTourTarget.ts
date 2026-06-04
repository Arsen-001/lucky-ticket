'use client';

import { useEffect, useState } from 'react';
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
      setPhase('searching');
      return;
    }

    setPhase('searching');
    setTargetEl(null);

    const selector = `[data-tour="${step.anchor}"]`;
    let settled = false;
    let raf = 0;
    let timeoutId = 0;
    let observer: MutationObserver | null = null;

    const lockOn = (el: HTMLElement) => {
      settled = true;
      observer?.disconnect();
      window.clearTimeout(timeoutId);
      const r = el.getBoundingClientRect();
      const visible = r.top >= 0 && r.bottom <= window.innerHeight && r.left >= 0;
      if (!visible) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      raf = window.requestAnimationFrame(() => {
        setTargetEl(el);
        setRect(measureRect(el));
        setPhase('targeted');
      });
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
      window.cancelAnimationFrame(raf);
    };
  }, [active, stepId, pathname]);

  // Keep the rect in sync while the step is shown (scroll / resize / layout shift).
  useEffect(() => {
    if (!active || !targetEl) return;
    const update = () => setRect(measureRect(targetEl));
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    const intervalId = window.setInterval(update, 400);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
      window.clearInterval(intervalId);
    };
  }, [active, targetEl, secondaryAnchor]);

  return { rect, targetEl, phase };
}
