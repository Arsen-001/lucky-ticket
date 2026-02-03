'use client';

import { Modal } from '@/components/shared/modals/Modal';
import { Task } from '@/types/interfaces/tasks.interfaces';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/shared/buttons/Button';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { TaskIcon } from '@/components/pages/tabs/tasks/TaskIcon';

interface TaskModalProps {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  onAction: (task: Task) => void;
}

export function TaskModal({ task, open, onClose, onAction }: TaskModalProps) {
  const t = useAppTranslations();

  if (!task) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="bg-purple-gradient p-5 rounded-xl">
        <div className="flex flex-col items-center text-center mt-4">
          <div className="w-16 h-16 bg-pink/20 rounded-full flex items-center justify-center mb-4">
            <TaskIcon className="text-pink" size={32} type={task.type} />
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
