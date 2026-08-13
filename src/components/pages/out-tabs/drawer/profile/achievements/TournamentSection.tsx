'use client';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { AchievementGrid } from '@/components/shared/achievements/AchievementGrid';
import { categoryLabelKey } from '@/components/shared/achievements/achievement.utils';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { AchievementCategory } from '@/types/enums/achievement.enums';
import type { Achievement } from '@/types/interfaces/achievement.interfaces';
import type { MessageIds } from '@/types/types/i18n.types';

const PLACE_TABS: { id: string; labelKey: MessageIds }[] = [
  { id: 'first-place', labelKey: '1st' },
  { id: 'second-place', labelKey: '2nd' },
  { id: 'third-place', labelKey: '3rd' },
  { id: 'tournaments-played', labelKey: 'played' },
];

export interface TournamentSectionProps {
  items: Achievement[];
  allItems: Achievement[];
  onSelect: (a: Achievement) => void;
  onPin: (a: Achievement) => void;
}

export function TournamentSection({ items, allItems, onSelect, onPin }: TournamentSectionProps) {
  const t = useAppTranslations();
  const [activeTab, setActiveTab] = useState<string>(PLACE_TABS[0].id);

  const earnedCount = items.filter(a => a.earned).length;
  const totalCount = allItems.length;

  const tabItems = items.filter(a => a.series?.id === activeTab);

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-baseline gap-2 px-5">
        <h2 className="text-xs font-extrabold uppercase tracking-widest text-white/60">
          {t(categoryLabelKey(AchievementCategory.TOURNAMENTS))}
        </h2>
        <span className="text-[11px] font-bold tabular-nums text-white/30">
          {earnedCount}/{totalCount}
        </span>
      </div>

      <div className="px-4 flex flex-col gap-3">
        <div className="flex gap-1 rounded-xl border border-white/8 bg-white/[0.03] p-1">
          {PLACE_TABS.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={twMerge(
                'tap-target relative flex-1 rounded-lg py-1.5 text-xs font-extrabold uppercase tracking-wider transition-all',
                activeTab === tab.id
                  ? 'bg-electric-pink/20 text-electric-pink border border-electric-pink/40'
                  : 'text-white/45 hover:text-white/70'
              )}
            >
              {t(tab.labelKey)}
            </button>
          ))}
        </div>

        {tabItems.length > 0 && (
          <AchievementGrid
            achievements={tabItems}
            onClick={onSelect}
            onPin={a => (a.earned ? onPin(a) : undefined)}
          />
        )}
      </div>
    </section>
  );
}
