'use client';

import { Check, ChevronRight, Circle, Gift } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { TaskRewardBadge } from '@/components/pages/tabs/tasks/TaskRewardBadge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { TaskSubStep } from '@/types/interfaces/tasks.interfaces';

export interface LabSubStepRowProps {
  step: TaskSubStep;
  claimed: boolean;
  onClaim: () => void;
  onNavigate?: () => void;
}

/**
 * Sub-step row, copied verbatim from `TaskItemCard`'s private `SubStepRow`.
 *
 * It is duplicated rather than imported because the original is not exported.
 * Copied and not simplified on purpose: the point of these candidates is that
 * they change the SHAPE of a task card and nothing else, so every behaviour the
 * live card has — claim a step, batch-claim, navigate, the claimed state — has
 * to survive into them unchanged.
 */
export function LabSubStepRow({ step, claimed, onClaim, onNavigate }: LabSubStepRowProps) {
  const t = useAppTranslations();
  const isClaimable = step.completed && !claimed;
  const isFullyClaimed = step.completed && claimed;
  const isPending = !step.completed;
  const canNavigate = isPending && !!onNavigate;
  const rowAction = isClaimable ? onClaim : canNavigate ? onNavigate : undefined;
  const isInteractive = !!rowAction;

  return (
    <div
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={
        rowAction
          ? e => {
              e.stopPropagation();
              rowAction();
            }
          : undefined
      }
      onKeyDown={
        rowAction
          ? e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                rowAction();
              }
            }
          : undefined
      }
      className={twMerge(
        'flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 transition-all',
        isClaimable &&
          'bg-pink/10 border-pink/20 cursor-pointer border hover:bg-pink/15 active:scale-[0.99]',
        isFullyClaimed && 'bg-success/10',
        isPending && 'bg-white/5',
        canNavigate && 'cursor-pointer hover:bg-white/10 active:scale-[0.99]'
      )}
    >
      {isFullyClaimed ? (
        <div className="flex-center bg-success/30 size-5 shrink-0 rounded-full">
          <Check size={11} className="text-success" />
        </div>
      ) : isClaimable ? (
        <div className="flex-center bg-pink/30 animate-task-pulse size-5 shrink-0 rounded-full">
          <Gift size={11} className="text-electric-pink" />
        </div>
      ) : (
        <Circle size={18} className="shrink-0 text-white/30" />
      )}

      {step.label ? (
        <span
          className={twMerge(
            'flex-1 truncate text-xs font-semibold',
            isFullyClaimed && 'text-white/50',
            isClaimable && 'text-white',
            !step.completed && 'text-white/60'
          )}
        >
          {step.label}
        </span>
      ) : (
        <div className="flex-1" />
      )}

      {step.reward && !isFullyClaimed && <TaskRewardBadge reward={step.reward} size="sm" />}

      {isPending && onNavigate && (
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            onNavigate();
          }}
          aria-label={t('open')}
          className="flex-center bg-electric-pink/15 border-electric-pink/30 hover:bg-electric-pink/25 size-6 shrink-0 rounded-full border transition-colors"
        >
          <ChevronRight size={12} className="text-electric-pink" strokeWidth={2.5} />
        </button>
      )}

      {isClaimable && (
        <span className="bg-pink-gradient pointer-events-none shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold text-white">
          {t('claim')}
        </span>
      )}

      {isFullyClaimed && (
        <span className="text-success shrink-0 text-[10px] font-semibold tracking-wider uppercase">
          {t('claimed')}
        </span>
      )}
    </div>
  );
}
