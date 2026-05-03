'use client';

import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export type FriendsFilter = 'all' | 'with-rewards' | 'premium';

export interface FriendsFilterChipsProps {
  active: FriendsFilter;
  onChange: (next: FriendsFilter) => void;
  counts: Record<FriendsFilter, number>;
}

export function FriendsFilterChips({ active, onChange, counts }: FriendsFilterChipsProps) {
  const t = useAppTranslations();

  const items: { key: FriendsFilter; label: string }[] = [
    { key: 'all', label: t('all') },
    { key: 'with-rewards', label: t('with rewards') },
    { key: 'premium', label: t('premium friends') },
  ];

  return (
    <div className="scrollbar-hidden -mx-1 flex gap-2 overflow-x-auto px-1">
      {items.map(({ key, label }) => {
        const isActive = active === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={twMerge(
              'inline-flex flex-shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
              isActive
                ? 'border-electric-pink/50 bg-electric-pink/15 text-white'
                : 'text-pink-secondary border-white/10 bg-white/5 hover:bg-white/10'
            )}
          >
            <span>{label}</span>
            <span
              className={twMerge(
                'rounded-full px-1.5 py-0.5 text-[10px] font-extrabold tabular-nums',
                isActive ? 'bg-electric-pink/25 text-white' : 'bg-white/10 text-white/70'
              )}
            >
              {counts[key]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
