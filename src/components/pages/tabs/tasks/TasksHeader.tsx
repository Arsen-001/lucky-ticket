'use client';

import { type CSSProperties, useState } from 'react';
import { Flame, Gift } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import type { DailyProgressInfo, StreakInfo } from '@/types/interfaces/tasks.interfaces';
import { StreakModal } from './StreakModal';

export interface TasksHeaderProps {
  streak?: StreakInfo;
  dailyProgress?: DailyProgressInfo;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function TasksHeader({
  streak,
  dailyProgress,
  loading,
  className,
  style,
}: TasksHeaderProps) {
  const t = useAppTranslations();
  const [streakModalOpen, setStreakModalOpen] = useState(false);

  const completed = dailyProgress?.completedToday ?? 0;
  const total = dailyProgress?.totalToday ?? 0;
  const ready = dailyProgress?.readyToClaim ?? 0;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const days = streak?.currentDays ?? 0;

  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (pct / 100) * circumference;

  return (
    <>
      <div
        style={style}
        className={twMerge('flex items-center justify-between gap-3 px-5 pt-3 pb-4', className)}
      >
        <div className="flex flex-col gap-0.5 min-w-0">
          <h1 className="text-2xl font-extrabold leading-tight">{t('tasks')}</h1>
          <p className="text-pink-secondary text-xs">{t('tasks header subtitle')}</p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Daily progress ring */}
          <SkeletonSuspense
            loading={loading}
            skeleton={<Skeleton variant="card" className="w-16 h-16 rounded-full" />}
          >
            <div className="relative flex-center w-16 h-16">
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 64 64">
                <circle
                  cx="32"
                  cy="32"
                  r={radius}
                  className="fill-none stroke-white/10"
                  strokeWidth="5"
                />
                <circle
                  cx="32"
                  cy="32"
                  r={radius}
                  className="fill-none stroke-electric-pink transition-[stroke-dashoffset] duration-700 ease-out"
                  strokeWidth="5"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                />
              </svg>
              {ready > 0 ? (
                <div className="flex-center w-9 h-9 rounded-full bg-pink-gradient animate-task-pulse">
                  <Gift size={18} className="text-white" />
                </div>
              ) : (
                <div className="flex flex-col items-center leading-none">
                  <span className="text-sm font-bold tabular-nums">{completed}</span>
                  <span className="text-[10px] text-white/50 tabular-nums">/ {total}</span>
                </div>
              )}
            </div>
          </SkeletonSuspense>

          {/* Streak badge */}
          <SkeletonSuspense
            loading={loading}
            skeleton={<Skeleton variant="card" className="w-16 h-16 rounded-2xl" />}
          >
            <button
              type="button"
              onClick={() => setStreakModalOpen(true)}
              className="flex flex-col items-center gap-0.5 rounded-2xl bg-gradient-to-br from-orange/30 to-electric-pink/30 px-3 py-2 border border-orange/40 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
              aria-label={t('open streak details')}
            >
              <Flame
                size={22}
                className="fill-orange text-warning animate-task-flame"
                strokeWidth={1.5}
              />
              <div className="flex items-baseline gap-0.5 leading-none">
                <span className="text-base font-extrabold tabular-nums">{days}</span>
                <span className="text-[10px] text-white/70">{t(days === 1 ? 'day' : 'days')}</span>
              </div>
            </button>
          </SkeletonSuspense>
        </div>
      </div>

      <StreakModal
        open={streakModalOpen}
        onClose={() => setStreakModalOpen(false)}
        streak={streak}
      />
    </>
  );
}
