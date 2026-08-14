'use client';

import { ReactNode, useCallback, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { ClientPortal } from '@/components/shared/ClientPortal';
import { ModalCloseButton } from '@/components/shared/modals/ModalCloseButton';
import { useOverlayPresence } from '@/hooks/useOverlayPresence';
import { useOverlayFocusLock } from '@/hooks/useOverlayFocusLock';
import { useBackdropDismiss } from '@/hooks/useBackdropDismiss';
import { useBackDismiss } from '@/hooks/useBackDismiss';
import type { ButtonProps } from '@/components/shared/buttons/Button';

const ANIMATION_MS = 200;

interface ModalProps {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
  closeOnOverlayClick?: boolean;
  hideOnEscape?: boolean;
  hideCloseButton?: boolean;
  closeButtonProps?: ButtonProps;
  /** What this dialog is, for assistive tech — a dialog announced as just
   *  "dialog" tells the user nothing. Modals with a title should pass it. */
  label?: string;
}

export const Modal = ({
  open,
  onClose,
  children,
  closeOnOverlayClick = true,
  hideOnEscape = true,
  closeButtonProps,
  hideCloseButton,
  label,
}: ModalProps) => {
  // Closed → nothing in the DOM. A modal per list row used to mean a
  // full-screen blur layer per row; see useOverlayPresence.
  const { mounted, visible } = useOverlayPresence(open, ANIMATION_MS);

  // No `document.activeElement.blur()` for the closed state here, however
  // harmless it reads. It blurred whatever was focused ANYWHERE in the app, and
  // a closed modal runs this effect far more often than it looks: the deps
  // carry `onClose`, which every caller passes as an inline arrow, so a new
  // identity on any parent render re-runs it. Home re-renders once a second for
  // the engine tick, so typing an amount in the Stars sheet lost focus within
  // ~600ms — on a phone that is the keyboard opening and closing itself
  // (measured 06.08.2026: focus at 13966ms, blur at 14592ms, stack ending in
  // commitHookPassiveMountEffects). Focus on close is `useOverlayFocusLock`'s
  // job, and it restores it to the control that opened the dialog.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open && onClose && hideOnEscape && closeOnOverlayClick) {
        onClose();
      }
    };

    if (open) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose, hideOnEscape, closeOnOverlayClick]);

  // Both need the panel node, and the focus lock hands back a callback ref
  // rather than an object one (the panel arrives late, inside a portal — see
  // useOverlayFocusLock), so the node is kept here and forwarded to it.
  const lockPanel = useOverlayFocusLock(open);
  const [panel, setPanel] = useState<HTMLElement | null>(null);
  // Stable identity on purpose: React re-runs a ref callback whose identity
  // changed, detaching with null and re-attaching on every single render.
  const panelRef = useCallback(
    (node: HTMLDivElement | null) => {
      setPanel(node);
      lockPanel(node);
    },
    [lockPanel]
  );

  // Does the panel have content below its bottom edge right now?
  //
  // A modal taller than 80vh scrolls, but `scrollbar-hidden` means nothing says
  // so — the panel simply clips, and a card cut through the middle of a row
  // reads as broken rather than scrollable (the TON deposit sheet sliced its QR
  // code in half, measured 09.08.2026). Fading that edge is the hint, and it
  // has to come and go with the scrolling: a fade on a dialog that fits would
  // dim the last line of every short modal in the app.
  const [overflowing, setOverflowing] = useState(false);
  useEffect(() => {
    if (!panel) return;

    const check = () =>
      setOverflowing(panel.scrollHeight - panel.scrollTop - panel.clientHeight > 8);

    check();
    panel.addEventListener('scroll', check, { passive: true });
    // Content arriving late (a query resolving, an image loading) changes the
    // answer without any scrolling.
    const observer = new ResizeObserver(check);
    observer.observe(panel);
    for (const child of Array.from(panel.children)) observer.observe(child as Element);

    return () => {
      panel.removeEventListener('scroll', check);
      observer.disconnect();
    };
  }, [panel, open]);

  // The opening tap's own click lands on the backdrop, which did not exist when
  // the finger went down — see useBackdropDismiss.
  const backdropProps = useBackdropDismiss(
    visible,
    ANIMATION_MS,
    closeOnOverlayClick ? onClose : undefined
  );

  // Telegram's back arrow / the Android system back closes this dialog rather
  // than navigating the page under it. Same condition as the backdrop: a modal
  // that insists on an explicit choice is not dismissed by Back either.
  useBackDismiss(open, closeOnOverlayClick ? onClose : undefined);

  if (!mounted) return null;

  return (
    <ClientPortal>
      <div
        aria-hidden={!open}
        inert={!open ? true : undefined}
        style={{ transitionDuration: `${ANIMATION_MS}ms` }}
        className={twMerge(
          'fixed inset-0 flex items-center justify-center z-100 transition-all backdrop-blur-[1px] p-[var(--app-modal-inset)]',
          visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-fade" {...backdropProps} />

        {/* Modal */}
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={label}
          // Focused on open instead of the first control, which is often an
          // input — see useOverlayFocusLock.
          tabIndex={-1}
          style={{ transitionDuration: `${ANIMATION_MS}ms` }}
          className={twMerge(
            // Capped to the phone column, not the browser window: the layer
            // above is `fixed`, so `w-full` alone measured against the viewport
            // and a desktop-width window opened a 1200px-wide dialog over a
            // 430px app. @see --app-modal-max-w
            'w-full max-w-[var(--app-modal-max-w)] relative transition-all transform max-h-[80vh] overflow-y-auto overflow-x-hidden scrollbar-hidden rounded-lg focus:outline-none',
            overflowing && 'scroll-fade-bottom',
            visible ? 'scale-100' : 'scale-80'
          )}
        >
          {onClose && !hideCloseButton && (
            <ModalCloseButton
              onClick={onClose}
              {...closeButtonProps}
              className={twMerge('z-10', closeButtonProps?.className)}
            />
          )}
          {children}
        </div>
      </div>
    </ClientPortal>
  );
};
