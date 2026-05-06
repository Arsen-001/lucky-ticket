'use client';
import { useState } from 'react';
import { useGetAchievementsQuery } from '@/api/achievements.api';
import { AchievementGrid } from '@/components/shared/achievements/AchievementGrid';
import { AchievementDetailModal } from '@/components/shared/achievements/AchievementDetailModal';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { AchievementCategory, AchievementRarity } from '@/types/enums/achievement.enums';
import {
  categoryLabelKey,
  getChainVisibility,
  rarityLabelKey,
} from '@/components/shared/achievements/achievement.utils';
import { twMerge } from 'tailwind-merge';
import type { Achievement } from '@/types/interfaces/achievement.interfaces';

type Filter = 'all' | 'earned' | 'locked';

export default function Page() {
  const t = useAppTranslations();
  const { data, isLoading } = useGetAchievementsQuery();
  const [filter, setFilter] = useState<Filter>('all');
  const [category, setCategory] = useState<AchievementCategory | 'all'>('all');
  const [rarity, setRarity] = useState<AchievementRarity | 'all'>('all');
  const [selected, setSelected] = useState<Achievement | null>(null);

  const allAchievements = data?.achievements ?? [];

  const items = allAchievements.filter(a => {
    if (a.hidden && !a.earned) return false;
    const visibility = getChainVisibility(a, allAchievements);
    if (visibility === 'hidden') return false;
    if (filter === 'earned' && !a.earned) return false;
    if (filter === 'locked' && a.earned) return false;
    if (category !== 'all' && a.category !== category) return false;
    if (rarity !== 'all' && a.rarity !== rarity) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-5 px-5 pb-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold text-white">{t('all badges')}</h1>
        {data && (
          <p className="text-sm text-white/55">
            {data.earned} / {data.total} {t('badges earned').toLowerCase()}
          </p>
        )}
      </header>

      <div className="flex flex-col gap-3">
        <FilterPills
          options={[
            { value: 'all', label: t('all') },
            { value: 'earned', label: t('earned') },
            { value: 'locked', label: t('locked') },
          ]}
          value={filter}
          onChange={v => setFilter(v as Filter)}
        />

        <FilterPills
          options={[
            { value: 'all', label: t('all categories') },
            ...Object.values(AchievementCategory).map(c => ({
              value: c,
              label: t(categoryLabelKey(c)),
            })),
          ]}
          value={category}
          onChange={v => setCategory(v as AchievementCategory | 'all')}
        />

        <FilterPills
          options={[
            { value: 'all', label: t('all rarities') },
            ...Object.values(AchievementRarity).map(r => ({
              value: r,
              label: t(rarityLabelKey(r)),
            })),
          ]}
          value={rarity}
          onChange={v => setRarity(v as AchievementRarity | 'all')}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} variant="rounded-rectangle" className="h-32" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="py-10 text-center text-sm text-white/45">{t('no badges in selection')}</p>
      ) : (
        <AchievementGrid
          achievements={items}
          allAchievements={allAchievements}
          onClick={a => setSelected(a)}
        />
      )}

      <AchievementDetailModal achievement={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

interface FilterPillsProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}

function FilterPills({ options, value, onChange }: FilterPillsProps) {
  return (
    <div className="-mx-5 px-5 overflow-x-auto scrollbar-hidden">
      <div className="flex w-max gap-2 pr-3">
        {options.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={twMerge(
              'rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all',
              value === opt.value
                ? 'border-electric-pink bg-electric-pink/20 text-electric-pink'
                : 'border-white/10 bg-white/5 text-white/65 hover:bg-white/10'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
