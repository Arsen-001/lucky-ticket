'use client';

import { ReactNode, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';
import { ClientPortal } from '@/components/shared/ClientPortal';
import { ModalCloseButton } from '@/components/shared/modals/ModalCloseButton';
import { useOverlayPresence } from '@/hooks/useOverlayPresence';
import { useOverlayFocusLock } from '@/hooks/useOverlayFocusLock';
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

  useEffect(() => {
    if (!open && typeof document !== 'undefined') {
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement && activeElement instanceof HTMLElement) {
        activeElement.blur();
      }
    }

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

  const panelRef = useOverlayFocusLock(open);

  // Overlay click
  const handleOverlayClick = () => {
    if (closeOnOverlayClick && onClose) {
      onClose();
    }
  };

  if (!mounted) return null;

  return (
    <ClientPortal>
      <div
        aria-hidden={!open}
        inert={!open ? true : undefined}
        style={{ transitionDuration: `${ANIMATION_MS}ms` }}
        className={twMerge(
          'fixed inset-0 flex items-center justify-center z-100 transition-all backdrop-blur-[1px] p-7.5',
          visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-fade" onClick={handleOverlayClick} />

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
            'w-full relative transition-all transform max-h-[80vh] overflow-scroll scrollbar-hidden rounded-lg focus:outline-none',
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
