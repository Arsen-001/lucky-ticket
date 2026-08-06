'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { ClientPortal } from '@/components/shared/ClientPortal';
import { useOverlayPresence } from '@/hooks/useOverlayPresence';
import { useOverlayFocusLock } from '@/hooks/useOverlayFocusLock';
import { useBackdropDismiss } from '@/hooks/useBackdropDismiss';
import { noteDismissIntent, noteOverlayClose, noteOverlayOpen } from '@/lib/debug/overlay-probe';

/** Matches the panel's `duration-300` slide. */
const ANIMATION_MS = 300;

export interface BottomSheetProps {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
  /** Extra classes for the sliding panel. */
  className?: string;
  closeOnOverlayClick?: boolean;
  /** Show the grab-handle bar at the top. */
  showHandle?: boolean;
  /** What this sheet is, for assistive tech. @see Modal */
  label?: string;
}

/**
 * Bottom-anchored sheet: a panel that slides up from the bottom edge with an
 * overlay, closes on overlay tap / Escape. The mobile-native alternative to the
 * centered `Modal` — used where a lighter, thumb-reachable surface fits better.
 */
export function BottomSheet({
  open,
  onClose,
  children,
  className,
  closeOnOverlayClick = true,
  showHandle = true,
  label,
}: BottomSheetProps) {
  // Closed → nothing in the DOM (see useOverlayPresence).
  const { mounted, visible } = useOverlayPresence(open, ANIMATION_MS);
  const panelRef = useOverlayFocusLock(open);
  // The opening tap's own click lands here, on a backdrop that did not exist
  // when the finger went down — see useBackdropDismiss.
  const backdropProps = useBackdropDismiss(
    visible,
    ANIMATION_MS,
    closeOnOverlayClick ? onClose : undefined
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        noteDismissIntent('escape');
        onClose?.();
      }
    };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Field probe (off unless switched on): records what closed this sheet when
  // it closes right after opening. The cleanup fires on unmount too, which is
  // the case a dismissal gesture cannot explain — see lib/debug/overlay-probe.
  const probeLabel = label ?? 'sheet';
  // Declared first on purpose: React runs cleanups in declaration order, so this
  // one has already flagged the unmount by the time the probe effect below reads
  // it. On a plain `open` change it does not run at all.
  const unmounting = useRef(false);
  useEffect(() => {
    return () => {
      unmounting.current = true;
    };
  }, []);
  useEffect(() => {
    if (!open) return;
    noteOverlayOpen(probeLabel);
    return () => noteOverlayClose(probeLabel, unmounting.current);
  }, [open, probeLabel]);

  if (!mounted) return null;

  return (
    <ClientPortal>
      <div
        aria-hidden={!open}
        inert={!open ? true : undefined}
        className={twMerge(
          'fixed inset-0 z-100 flex items-end justify-center transition-opacity duration-300',
          visible ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      >
        <div className="bg-fade absolute inset-0 backdrop-blur-[2px]" {...backdropProps} />

        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={label}
          tabIndex={-1}
          className={twMerge(
            'max-w-[var(--app-max-w)] scrollbar-hidden relative max-h-[90vh] w-full overflow-y-auto transition-transform duration-300 ease-out focus:outline-none',
            visible ? 'translate-y-0' : 'translate-y-full',
            className
          )}
        >
          {showHandle && (
            <div className="pointer-events-none absolute left-1/2 top-2 z-10 h-1 w-10 -translate-x-1/2 rounded-full bg-white/25" />
          )}
          {children}
        </div>
      </div>
    </ClientPortal>
  );
}
