'use client';

import { Check, Flame, Lock } from 'lucide-react';
import { Modal } from '@/components/shared/modals/Modal';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { StreakInfo } from '@/types/interfaces/tasks.interfaces';
import { TaskRewardBadge } from './TaskRewardBadge';

export interface StreakModalProps {
  open: boolean;
  onClose: () => void;
  streak?: StreakInfo;
}

export function StreakModal({ open, onClose, streak }: StreakModalProps) {
  const t = useAppTranslations();
  const days = streak?.currentDays ?? 0;
  const next = streak?.nextMilestoneDay ?? 7;
  const milestones = streak?.upcomingMilestones ?? [];

  return (
    <Modal open={open} onClose={onClose}>
      <div className="bg-purple-gradient p-6 rounded-2xl">
        <div className="flex flex-col items-center gap-2 mb-5">
          <div className="relative flex-center w-20 h-20 rounded-full bg-gradient-to-br from-orange/40 to-electric-pink/40 border border-orange/60">
            <Flame
              size={42}
              className="fill-orange text-warning animate-task-flame"
              strokeWidth={1.5}
            />
          </div>
          <h2 className="text-2xl font-extrabold">{t('streak days', { days })}</h2>
          <p className="text-sm text-white-secondary text-center">
            {t('streak modal description', { next })}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-wider text-white/40 font-semibold">
            {t('upcoming rewards')}
          </p>
          {milestones.map(m => {
            const reached = days >= m.day;
            return (
              <div
                key={m.day}
                className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5"
              >
                <div className="flex-center w-9 h-9 rounded-full bg-white/10 shrink-0">
                  {reached ? (
                    <Check size={16} className="text-success" />
                  ) : (
                    <Lock size={14} className="text-white/40" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{t('day n', { n: m.day })}</p>
                  <p className="text-[11px] text-white/50">
                    {reached ? t('reached') : t('keep your streak')}
                  </p>
                </div>
                <TaskRewardBadge reward={m.reward} size="md" />
              </div>
            );
          })}
        </div>

        <p className="mt-4 text-[11px] text-pink-secondary text-center">
          {t('streak modal footer')}
        </p>
      </div>
    </Modal>
  );
}
