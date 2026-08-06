'use client';

import { useSyncExternalStore } from 'react';
import {
  getOverlayProbeRecords,
  isOverlayProbeOn,
  stopOverlayProbe,
  subscribeOverlayProbe,
} from '@/lib/debug/overlay-probe';

/**
 * Read-out for the overlay probe — see `src/lib/debug/overlay-probe.ts`.
 *
 * Renders nothing unless the probe was explicitly switched on AND an overlay
 * actually closed within a couple of seconds of opening, so a player who never
 * asked for it can never see it. The copy is deliberately untranslated: this is
 * a diagnostic read by one person on one device, not product surface, and
 * putting it through `t()` would leave dead keys behind once it is removed.
 */
export function OverlayProbeBanner() {
  const records = useSyncExternalStore(subscribeOverlayProbe, getOverlayProbeRecords, () =>
    getOverlayProbeRecords()
  );

  if (!isOverlayProbeOn() || records.length === 0) return null;

  return (
    // Bottom, above the tab bar, and transparent to taps: the header is exactly
    // what this is used to tap, so a read-out sitting on top of it would block
    // the gesture it exists to measure. Only `stop` takes input.
    <div
      className="pointer-events-none fixed left-2 right-2 z-[200] flex flex-col gap-1 rounded-lg p-3 font-mono text-[11px] leading-tight text-white"
      style={{
        bottom: 'calc(5rem + var(--tg-inset-bottom) + 0.5rem)',
        backgroundColor: 'rgba(126,40,40,0.96)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-bold">overlay probe</span>
        <button
          type="button"
          onClick={stopOverlayProbe}
          className="pointer-events-auto rounded bg-white/20 px-2 py-0.5 font-bold"
        >
          stop
        </button>
      </div>
      {records.map((r, i) => (
        <div key={i}>
          {r.label} closed after {r.openMs}ms — {r.reason}
          {r.unmounted ? ' (unmounted)' : ''}
        </div>
      ))}
    </div>
  );
}
