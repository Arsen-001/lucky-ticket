'use client';

import { ReactNode, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';
import { ClientPortal } from '@/components/shared/ClientPortal';
import { ModalCloseButton } from '@/components/shared/modals/ModalCloseButton';
import { useOverlayPresence } from '@/hooks/useOverlayPresence';
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
}

export const Modal = ({
  open,
  onClose,
  children,
  closeOnOverlayClick = true,
  hideOnEscape = true,
  closeButtonProps,
  hideCloseButton,
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
          style={{ transitionDuration: `${ANIMATION_MS}ms` }}
          className={twMerge(
            'w-full relative transition-all transform max-h-[80vh] overflow-scroll scrollbar-hidden rounded-lg',
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
