'use client';

import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';

/** «Друзья» = everyone who arrived through the link; «Рефералы» = the ones who pay. */
export type FriendsTab = 'friends' | 'referrals';

export interface FriendsTabsProps {
  active: FriendsTab;
  onChange: (next: FriendsTab) => void;
  counts: Record<FriendsTab, number>;
}

/**
 * The friends screen has exactly two lists, and the split is the whole point:
 * a referral earns you a cut of their tournament wins, a friend who fell out
 * does not.
 *
 * Two tabs rather than the five filter chips this replaced — «с наградами»,
 * «premium» and «не засчитаны» sliced the same people three more ways without
 * answering the only question the screen exists to answer.
 */
export function FriendsTabs({ active, onChange, counts }: FriendsTabsProps) {
  const t = useAppTranslations();

  const items: { key: FriendsTab; label: string }[] = [
    { key: 'friends', label: t('friends') },
    { key: 'referrals', label: t('referrals') },
  ];

  return (
    <div role="tablist" className="flex gap-1 rounded-xl bg-black/25 p-1">
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
              'flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-colors',
              isActive
                ? 'bg-pink-gradient text-white shadow-[0_4px_12px_rgba(222,0,155,0.28)]'
                : 'text-pink-secondary hover:bg-white/5'
            )}
          >
            <span>{label}</span>
            <span
              className={twMerge(
                'rounded-full px-1.5 py-0.5 text-[10px] font-extrabold tabular-nums',
                isActive ? 'bg-black/20 text-white' : 'bg-white/10 text-white/70'
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
