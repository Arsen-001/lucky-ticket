'use client';

import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { LeaderboardPeriod } from '@/types/interfaces/leaderboard.interfaces';

export interface LeaderboardPeriodTabsProps {
  active: LeaderboardPeriod;
  onChange: (next: LeaderboardPeriod) => void;
}

export function LeaderboardPeriodTabs({ active, onChange }: LeaderboardPeriodTabsProps) {
  const t = useAppTranslations();

  const items: { key: LeaderboardPeriod; label: string }[] = [
    { key: 'today', label: t('today') },
    { key: 'week', label: t('this week') },
    { key: 'month', label: t('this month') },
    { key: 'all', label: t('all time') },
  ];

  return (
    <div
      role="tablist"
      aria-label={t('leaderboard')}
      className="bg-background-overlay/70 grid grid-cols-4 gap-1 rounded-full border border-white/5 p-1"
    >
      {items.map(({ key, label }) => {
        const isActive = active === key;
        return (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(key)}
            className={twMerge(
              'cursor-pointer rounded-full px-2 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all',
              isActive
                ? 'bg-electric-pink text-white shadow-[0_4px_12px_rgba(222,0,155,0.35)]'
                : 'text-pink-secondary hover:text-white'
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
