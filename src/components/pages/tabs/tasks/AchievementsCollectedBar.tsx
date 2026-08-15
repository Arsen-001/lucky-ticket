'use client';

import { twMerge } from 'tailwind-merge';
import { Gift } from 'lucide-react';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { Progress } from '@/components/shared/Progress';
import { TaskStatus } from '@/types/enums/tasks.enums';
import type { Task } from '@/types/interfaces/tasks.interfaces';
import { isTaskClaimable } from '@/utils/global/tasks-claimable.utils';

export interface AchievementsCollectedBarProps {
  /**
   * Every achievement of the section, not the handful currently unfolded —
   * the list opens three at a time behind «See more», so a count taken from
   * what is on screen would answer a question nobody asked.
   */
  tasks: Task[];
  className?: string;
}

/**
 * «Получено 5 из 30» — how much of the badge wall this player owns.
 *
 * Collected means COLLECTED: a badge whose reward is still waiting is not
 * counted, it is called out separately, because those two states ask the
 * player for different things.
 */
export function AchievementsCollectedBar({ tasks, className }: AchievementsCollectedBarProps) {
  const t = useAppTranslations();

  const total = tasks.length;
  if (!total) return null;

  const earned = tasks.filter(task => task.status === TaskStatus.COMPLETED).length;
  const claimable = tasks.filter(isTaskClaimable).length;
  const pct = Math.min(100, Math.round((earned / total) * 100));

  return (
    <div
      className={twMerge(
        'bg-background-overlay flex flex-col gap-1.5 rounded-2xl border border-white/8 px-3 py-2.5',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[12px] font-bold text-white/80">
          {t('collected {earned} of {total}', { earned, total })}
        </span>
        <div className="flex shrink-0 items-center gap-2">
          {claimable > 0 && (
            <span className="bg-electric-pink/15 border-electric-pink/30 text-electric-pink inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] leading-none font-bold tabular-nums">
              <Gift size={10} strokeWidth={2.6} />
              {claimable}
            </span>
          )}
          <span className="text-[11px] font-semibold text-white/40 tabular-nums">{pct}%</span>
        </div>
      </div>
      {/* `bg-white/10`, not the component's default: its own track colour is
          `background-overlay`, which is this card's fill — the bar would be
          invisible against it. */}
      <Progress
        percentage={pct}
        className="h-1 bg-white/10"
        classNames={{ bar: 'bg-pink-gradient' }}
      />
    </div>
  );
}
