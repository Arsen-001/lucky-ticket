'use client';

import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';

/**
 * «Друзья» = everyone who arrived through the link; «Рефералы» = the ones who
 * pay; «Их друзья» = the second level — who your friends invited in turn.
 */
export type FriendsTab = 'friends' | 'referrals' | 'network';

export interface FriendsTabsProps {
  active: FriendsTab;
  onChange: (next: FriendsTab) => void;
  counts: Record<FriendsTab, number>;
}

/**
 * The friends screen has three lists, and each answers a different question:
 * «Друзья» — who arrived through my link; «Рефералы» — which of them pay right
 * now; «Их друзья» — the second level, everyone my friends brought in turn.
 *
 * Still not the five filter chips this replaced — «с наградами», «premium» and
 * «не засчитаны» sliced the SAME people three more ways. The third tab is not
 * another slice: it is a different set of people entirely, and without it the
 * second level had nowhere on the screen to live.
 */
export function FriendsTabs({ active, onChange, counts }: FriendsTabsProps) {
  const t = useAppTranslations();

  const items: { key: FriendsTab; label: string }[] = [
    { key: 'friends', label: t('friends') },
    { key: 'referrals', label: t('referrals') },
    { key: 'network', label: t('their friends') },
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
              // `whitespace-nowrap` and the tighter padding are what let a
              // third tab in: at 390px «Their friends» wrapped to two lines and
              // made that one tab taller than its neighbours.
              'flex flex-1 cursor-pointer items-center justify-center gap-1 whitespace-nowrap rounded-lg px-1.5 py-2 text-[11px] font-bold transition-colors',
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
