'use client';

import { Check, ChevronRight, Circle, Gift } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { TaskSubStep } from '@/types/interfaces/tasks.interfaces';
import { TaskRewardBadge } from './TaskRewardBadge';

export interface SubStepRowProps {
  step: TaskSubStep;
  claimed: boolean;
  onClaim: () => void;
  onNavigate?: () => void;
}

/**
 * One row inside an expanded task card's sub-step accordion.
 * Three visual states: pending → claimable → fully claimed.
 */
export function SubStepRow({ step, claimed, onClaim, onNavigate }: SubStepRowProps) {
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
          'bg-pink/10 border border-pink/20 cursor-pointer active:scale-[0.99] hover:bg-pink/15',
        isFullyClaimed && 'bg-success/10',
        isPending && 'bg-white/5',
        canNavigate && 'cursor-pointer active:scale-[0.99] hover:bg-white/10'
      )}
    >
      {isFullyClaimed ? (
        <div className="flex-center w-5 h-5 rounded-full bg-success/30 shrink-0">
          <Check size={11} className="text-success" />
        </div>
      ) : isClaimable ? (
        <div className="flex-center w-5 h-5 rounded-full bg-pink/30 shrink-0 animate-task-pulse">
          <Gift size={11} className="text-electric-pink" />
        </div>
      ) : (
        <Circle size={18} className="text-white/30 shrink-0" />
      )}
      {step.label ? (
        <span
          className={twMerge(
            'text-xs font-semibold flex-1 truncate',
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
          className="flex-center w-6 h-6 rounded-full bg-electric-pink/15 border border-electric-pink/30 hover:bg-electric-pink/25 transition-colors shrink-0"
        >
          <ChevronRight size={12} className="text-electric-pink" strokeWidth={2.5} />
        </button>
      )}
      {isClaimable && (
        <span className="rounded-full bg-pink-gradient px-2.5 py-1 text-[10px] font-bold text-white shrink-0 pointer-events-none">
          {t('claim')}
        </span>
      )}
      {isFullyClaimed && (
        <span className="text-[10px] font-semibold text-success uppercase tracking-wider shrink-0">
          {t('claimed')}
        </span>
      )}
    </div>
  );
}
