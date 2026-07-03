'use client';

import { useEffect, type ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { ClientPortal } from '@/components/shared/ClientPortal';

export interface BottomSheetProps {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
  /** Extra classes for the sliding panel. */
  className?: string;
  closeOnOverlayClick?: boolean;
  /** Show the grab-handle bar at the top. */
  showHandle?: boolean;
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
}: BottomSheetProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose?.();
    };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <ClientPortal>
      <div
        aria-hidden={!open}
        inert={!open ? true : undefined}
        className={twMerge(
          'fixed inset-0 z-100 flex items-end justify-center transition-opacity duration-300',
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      >
        <div
          className="bg-fade absolute inset-0 backdrop-blur-[2px]"
          onClick={closeOnOverlayClick ? onClose : undefined}
        />

        <div
          className={twMerge(
            'max-w-140 scrollbar-hidden relative max-h-[90vh] w-full overflow-y-auto transition-transform duration-300 ease-out',
            open ? 'translate-y-0' : 'translate-y-full',
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
