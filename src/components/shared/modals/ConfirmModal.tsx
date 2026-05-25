'use client';

import { Modal } from '@/components/shared/modals/Modal';
import { Button } from '@/components/shared/buttons/Button';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { ReactNode } from 'react';

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: ReactNode;
  content?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  hideConfirm?: boolean;
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  content,
  confirmText,
  cancelText,
  loading,
  hideConfirm,
}: ConfirmModalProps) {
  const t = useAppTranslations();

  return (
    <Modal open={open} onClose={onClose}>
      <div
        className="bg-background relative flex flex-col gap-6 overflow-hidden rounded-2xl border border-white/10 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.55)]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 0%, rgba(124, 58, 237, 0.22) 0%, transparent 60%),' +
            'radial-gradient(circle at 100% 100%, rgba(222, 0, 155, 0.14) 0%, transparent 55%)',
        }}
      >
        <div className="relative z-1 flex flex-col gap-2 text-center">
          {title && <h3 className="text-xl font-bold text-white">{title}</h3>}
          {content}
        </div>

        <div className="flex-center relative z-1 gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            className=" rounded-full px-4 py-2"
            disabled={loading}
          >
            {cancelText || t('cancel')}
          </Button>
          {!hideConfirm && (
            <Button
              variant="primary"
              onClick={onConfirm}
              className=" rounded-full px-4 py-1.5"
              loading={loading}
            >
              {confirmText || t('confirm')}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
