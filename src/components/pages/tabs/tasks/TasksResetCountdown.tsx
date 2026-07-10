'use client';

import { Clock3 } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useCountDown } from '@/hooks/useCountDown';

export interface TasksResetCountdownProps {
  resetAt?: string;
  className?: string;
}

/**
 * Slim period-reset line under the frequency tabs — "Next reset in 05:23:11".
 * Driven by the earliest `resetAt` the backend sent for the active tab, so it
 * always matches the real server rollover (daily UTC midnight / weekly Monday).
 */
export function TasksResetCountdown({ resetAt, className }: TasksResetCountdownProps) {
  const t = useAppTranslations();
  const { leftTime, expired } = useCountDown(resetAt);

  if (!resetAt || expired) return null;

  return (
    <div
      className={twMerge(
        'flex-center gap-1 text-[11px] font-medium text-white/40 tabular-nums',
        className
      )}
    >
      <Clock3 size={11} />
      {t('next reset in {time}', { time: leftTime })}
    </div>
  );
}
