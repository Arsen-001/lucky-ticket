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
}: ConfirmModalProps) {
  const t = useAppTranslations();

  return (
    <Modal open={open} onClose={onClose}>
      <div className="bg-purple-gradient p-6 rounded-2xl flex flex-col gap-6">
        <div className="flex flex-col gap-2 text-center">
          {title && <h3 className="text-xl font-bold text-white">{title}</h3>}
          {content}
        </div>

        <div className="flex-center gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            className=" rounded-full px-4 py-2"
            disabled={loading}
          >
            {cancelText || t('cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            className=" rounded-full px-4 py-1.5"
            loading={loading}
          >
            {confirmText || t('confirm')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
