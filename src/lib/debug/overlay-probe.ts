'use client';

/**
 * A field probe for one question: what closes an overlay right after it opens.
 *
 * The Stars sheet was reported opening and closing itself from a single tap on
 * the ⭐ pill, in Telegram on a phone. It does not happen with a mouse, and it
 * does not happen under Playwright's touch emulation either (measured
 * 06.08.2026: the overlay tests pass identically with and without the backdrop
 * guard, because CDP delivers one clean click and never the webview's late
 * compatibility click). So the only instrument left is the device itself.
 *
 * `onClose` on a sheet is reachable from exactly two gestures — Escape and a
 * click on the backdrop. If neither fired, the `open` prop was flipped by its
 * owner, which means the diagnosis so far is wrong and the cause is upstream
 * (the Header's state resetting, most likely a remount). Those three answers
 * lead to three different fixes, and this tells them apart.
 *
 * OFF unless explicitly switched on, because it ships to production:
 *   - `?probe=overlay` in the URL, or
 *   - `startapp=probe-overlay` on the Mini App link, which Telegram delivers as
 *     `tgWebAppStartParam` in the location hash.
 * Either one sticks in localStorage, so it survives the reload
 * AppLifecycleProvider performs on a long background.
 *
 * Everything here is defensive: a probe that can break the screen it observes
 * is worse than no probe.
 */

const STORAGE_KEY = 'lt-overlay-probe';
/** A close later than this is a normal dismissal, not the anomaly. */
const ANOMALY_WINDOW_MS = 2500;
/** A dismissal gesture older than this did not cause the close being recorded. */
const INTENT_FRESHNESS_MS = 600;

export type OverlayDismissReason =
  /** A backdrop press the guard accepted. */
  | 'backdrop'
  /** A backdrop click the guard rejected — no press behind it, or mid-animation. */
  | 'backdrop-blocked'
  | 'escape'
  /** No gesture at all: the owner flipped `open`, or the overlay was unmounted. */
  | 'no gesture';

export interface OverlayProbeRecord {
  label: string;
  reason: OverlayDismissReason;
  /** How long the overlay stayed open, in ms. */
  openMs: number;
  /** True when the overlay left the tree rather than being closed. */
  unmounted: boolean;
}

let enabled: boolean | null = null;
let lastIntent: { reason: OverlayDismissReason; at: number } | null = null;
const openedAt = new Map<string, number>();
// Replaced, never mutated: `useSyncExternalStore` compares snapshots by
// identity, so a push into a stable array is a change React cannot see.
let records: readonly OverlayProbeRecord[] = [];
const listeners = new Set<() => void>();

export function isOverlayProbeOn(): boolean {
  if (enabled !== null) return enabled;
  if (typeof window === 'undefined') return false;

  try {
    const asked =
      new URLSearchParams(window.location.search).get('probe') === 'overlay' ||
      window.location.hash.includes('tgWebAppStartParam=probe-overlay');
    if (asked) window.localStorage.setItem(STORAGE_KEY, '1');
    enabled = asked || window.localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    enabled = false;
  }

  return enabled;
}

/** Turns the probe off and forgets what it collected. */
export function stopOverlayProbe() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* private mode — the in-memory flag below is enough for this session */
  }
  enabled = false;
  records = [];
  listeners.forEach(fn => fn());
}

/** Called by whatever handled a dismissal gesture, accepted or rejected. */
export function noteDismissIntent(reason: OverlayDismissReason) {
  if (!isOverlayProbeOn()) return;
  lastIntent = { reason, at: performance.now() };
}

export function noteOverlayOpen(label: string) {
  if (!isOverlayProbeOn()) return;
  openedAt.set(label, performance.now());
}

export function noteOverlayClose(label: string, unmounted = false) {
  if (!isOverlayProbeOn()) return;

  const opened = openedAt.get(label);
  openedAt.delete(label);
  if (opened === undefined) return;

  const openMs = Math.round(performance.now() - opened);
  if (openMs > ANOMALY_WINDOW_MS) return;

  const fresh = lastIntent && performance.now() - lastIntent.at < INTENT_FRESHNESS_MS;
  const record: OverlayProbeRecord = {
    label,
    reason: fresh && lastIntent ? lastIntent.reason : 'no gesture',
    openMs,
    unmounted,
  };
  records = [record, ...records].slice(0, 8);
  lastIntent = null;
  listeners.forEach(fn => fn());
}

export function getOverlayProbeRecords(): readonly OverlayProbeRecord[] {
  return records;
}

export function subscribeOverlayProbe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
