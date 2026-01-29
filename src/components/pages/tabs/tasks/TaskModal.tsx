'use client';

import { Modal } from '@/components/shared/modals/Modal';
import { ModalCloseButton } from '@/components/shared/modals/ModalCloseButton';
import { Task } from '@/types/interfaces/tasks.interfaces';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/shared/buttons/Button';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { TASK_ICON_MAP } from '@/utils/pages/tasks.utils';

interface TaskModalProps {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  onAction: (task: Task) => void;
}

export function TaskModal({ task, open, onClose, onAction }: TaskModalProps) {
  const t = useAppTranslations();

  if (!task) return null;

  const Icon = TASK_ICON_MAP[task.type];

  return (
    <Modal open={open} onClose={onClose}>
      <div className="bg-purple-gradient p-5 rounded-xl">
        <ModalCloseButton onClick={onClose} />
        <div className="flex flex-col items-center text-center mt-4">
          <div className="w-16 h-16 bg-pink/20 rounded-full flex items-center justify-center mb-4">
            {Icon && <Icon className="text-pink" size={32} />}
          </div>

          <h3 className="text-xl font-bold mb-2">{task.title}</h3>
          <p className="text-white/70 text-sm">{task.description}</p>

          <div className="bg-white/5 rounded-xl p-3 w-full my-6">
            <p className="text-xs text-white/50 uppercase tracking-wider mb-1">{t('reward')}</p>
            <p className="font-bold text-yellow-500">{task.reward}</p>
          </div>

          {!task.claimed ? (
            <Button
              className="w-full p-3 flex items-center justify-center text-base font-bold rounded-xl"
              onClick={() => onAction(task)}
            >
              {t('complete')}
            </Button>
          ) : (
            <div className="flex-center gap-1 text-success">
              <CheckCircle2 size={16} />
              <div className="font-semibold text-sm h-4.5">{t('reward claimed')}</div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
