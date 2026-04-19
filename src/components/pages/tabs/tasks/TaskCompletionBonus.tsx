'use client';

import { CheckCircle2, Gift, Lock } from 'lucide-react';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { Button } from '@/components/shared/buttons/Button';
import { twMerge } from 'tailwind-merge';
import type { TaskCompletionBonus as TaskCompletionBonusType } from '@/types/interfaces/tasks.interfaces';

interface TaskCompletionBonusProps {
  completionBonus: TaskCompletionBonusType;
  progress: number;
}

export function TaskCompletionBonus({ completionBonus, progress }: TaskCompletionBonusProps) {
  const t = useAppTranslations();
  const isUnlocked = progress >= 100;
  const { reward, claimed } = completionBonus;

  return (
    <div
      className={twMerge(
        'rounded-xl p-4 mt-3 border transition-all',
        isUnlocked && !claimed ? 'bg-pink/10 border-pink/30' : 'bg-white/5 border-white/10'
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={twMerge(
            'w-10 h-10 rounded-full flex-center flex-shrink-0',
            isUnlocked ? 'bg-pink/20' : 'bg-white/10'
          )}
        >
          {isUnlocked ? (
            <Gift size={20} className="text-pink" />
          ) : (
            <Lock size={18} className="text-white/40" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className={twMerge('text-sm font-bold', isUnlocked ? 'text-pink' : 'text-white/40')}>
            {isUnlocked ? t('bonus unlocked') : t('completion bonus')}
          </p>
          <p
            className={twMerge(
              'text-xs mt-0.5 truncate',
              isUnlocked ? 'text-white/70' : 'text-white/30'
            )}
          >
            {isUnlocked ? reward : t('complete all for bonus')}
          </p>
        </div>

        {isUnlocked && !claimed && (
          <Button className="text-xs px-3 py-2 rounded-lg min-w-fit flex-shrink-0">
            {t('claim bonus')}
          </Button>
        )}

        {claimed && (
          <div className="flex items-center gap-1 text-success text-xs font-semibold flex-shrink-0">
            <CheckCircle2 size={12} />
            {t('bonus claimed')}
          </div>
        )}
      </div>
    </div>
  );
}
