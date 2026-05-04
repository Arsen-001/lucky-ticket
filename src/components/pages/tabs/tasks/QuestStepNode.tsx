import { Check, Lock } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { TaskStatus } from '@/types/enums/tasks.enums';
import type { QuestStep } from '@/types/interfaces/tasks.interfaces';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { TaskRewardRow } from './TaskRewardRow';

export interface QuestStepNodeProps {
  step: QuestStep;
  index: number;
  isLast?: boolean;
  onClaim: (step: QuestStep) => void;
}

export function QuestStepNode({ step, index, isLast, onClaim }: QuestStepNodeProps) {
  const t = useAppTranslations();
  const isCompleted = step.status === TaskStatus.COMPLETED;
  const isReady = step.status === TaskStatus.READY_TO_CLAIM;
  const isLocked = step.status === TaskStatus.LOCKED;

  return (
    <div className="relative flex gap-3">
      {/* connector line */}
      {!isLast && (
        <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-white/10">
          <div
            className={twMerge(
              'absolute top-0 left-0 right-0 transition-all',
              isCompleted ? 'h-full bg-pink-gradient' : 'h-0'
            )}
          />
        </div>
      )}

      {/* node circle */}
      <div className="relative z-1 shrink-0">
        <div
          className={twMerge(
            'flex-center w-10 h-10 rounded-full border-2 transition-all',
            isCompleted && 'bg-pink-gradient border-electric-pink',
            isReady &&
              'bg-pink-gradient border-electric-pink animate-task-pulse shadow-lg shadow-electric-pink/40',
            !isCompleted && !isReady && !isLocked && 'bg-background-overlay border-white/20',
            isLocked && 'bg-background-overlay border-white/10 opacity-60'
          )}
        >
          {isCompleted ? (
            <Check size={18} className="text-white" />
          ) : isLocked ? (
            <Lock size={14} className="text-white/40" />
          ) : (
            <span className="text-sm font-extrabold text-white">{index + 1}</span>
          )}
        </div>
      </div>

      {/* step content */}
      <div
        className={twMerge(
          'flex-1 min-w-0 rounded-2xl bg-background-overlay px-3 py-2.5 mb-3 transition-all',
          'card-outlined',
          isLocked && 'opacity-60',
          isReady && 'shadow-[0_0_24px_rgba(222,0,155,0.25)]'
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-bold leading-tight">{step.title}</h4>
          {isReady && (
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                onClaim(step);
              }}
              className="rounded-full bg-pink-gradient px-3 py-1 text-[11px] font-bold text-white animate-task-pulse"
            >
              {t('claim')}
            </button>
          )}
        </div>
        <p className="text-[11px] text-white/50 line-clamp-2 mt-0.5">{step.description}</p>
        <TaskRewardRow rewards={step.rewards} size="sm" className="mt-2" />
      </div>
    </div>
  );
}
