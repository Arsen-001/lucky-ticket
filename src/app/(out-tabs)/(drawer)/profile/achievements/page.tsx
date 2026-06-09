'use client';
import { useState } from 'react';
import { useGetAchievementsQuery } from '@/api/achievements.api';
import { usePinAchievementMutation } from '@/api/profile.api';
import { AchievementGrid } from '@/components/shared/achievements/AchievementGrid';
import { AchievementDetailModal } from '@/components/shared/achievements/AchievementDetailModal';
import { AchievementPinModal } from '@/components/shared/achievements/AchievementPinModal';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { AchievementCategory, AchievementRarity } from '@/types/enums/achievement.enums';
import {
  categoryLabelKey,
  rarityLabelKey,
} from '@/components/shared/achievements/achievement.utils';
import { twMerge } from 'tailwind-merge';
import type { Achievement } from '@/types/interfaces/achievement.interfaces';
import { QueryErrorState } from '@/components/shared/error/QueryErrorState';

type Filter = 'all' | 'earned' | 'locked';

const VISIBLE_CATEGORIES: AchievementCategory[] = [
  AchievementCategory.STATUS,
  AchievementCategory.STAKES,
  AchievementCategory.TICKETS,
  AchievementCategory.TOURNAMENTS,
  AchievementCategory.ACTIVITY_POINTS,
  AchievementCategory.TASKS,
];

export default function Page() {
  const t = useAppTranslations();
  const { data, isLoading, isError, refetch } = useGetAchievementsQuery();
  const [pinAchievement] = usePinAchievementMutation();
  const [filter, setFilter] = useState<Filter>('all');
  const [category, setCategory] = useState<AchievementCategory | 'all'>('all');
  const [rarity, setRarity] = useState<AchievementRarity | 'all'>('all');
  const [selected, setSelected] = useState<Achievement | null>(null);
  const [pinTarget, setPinTarget] = useState<Achievement | null>(null);

  if (isError) return <QueryErrorState onRetry={() => refetch()} />;

  const allAchievements = (data?.achievements ?? []).filter(a =>
    VISIBLE_CATEGORIES.includes(a.category)
  );

  const filtered = allAchievements.filter(a => {
    if (a.hidden && !a.earned) return false;
    if (filter === 'earned' && !a.earned) return false;
    if (filter === 'locked' && a.earned) return false;
    if (rarity !== 'all' && a.rarity !== rarity) return false;
    return true;
  });

  const visibleCategories =
    category === 'all' ? VISIBLE_CATEGORIES : VISIBLE_CATEGORIES.filter(c => c === category);

  const pinnedSlots: (Achievement | null)[] = [0, 1, 2].map(
    slot => allAchievements.find(a => a.isPinned && a.pinnedSlot === slot) ?? null
  );

  const handlePin = async (slot: number) => {
    if (!pinTarget) return;
    await pinAchievement({ achievementId: pinTarget.id, slot });
    setPinTarget(null);
  };

  return (
    <div className="-mx-5 -mt-3 flex flex-col gap-5 pb-12">
      <header className="flex flex-col gap-1 px-5 pt-4">
        <h1 className="text-2xl font-extrabold text-white">{t('all badges')}</h1>
        {data && (
          <p className="text-sm text-white/55">
            {allAchievements.filter(a => a.earned).length} / {allAchievements.length}{' '}
            {t('badges earned').toLowerCase()}
          </p>
        )}
      </header>

      <div className="flex flex-col gap-2.5 px-5">
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
            ...VISIBLE_CATEGORIES.map(c => ({
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
        <div className="flex flex-col gap-5">
          {VISIBLE_CATEGORIES.map(cat => (
            <CategorySectionSkeleton key={cat} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-10 text-center text-sm text-white/45">{t('no badges in selection')}</p>
      ) : (
        <div className="flex flex-col gap-5">
          {visibleCategories.map(cat => {
            const items = filtered.filter(a => a.category === cat);
            if (items.length === 0) return null;
            if (cat === AchievementCategory.TOURNAMENTS) {
              return (
                <TournamentSection
                  key={cat}
                  items={items}
                  allItems={allAchievements.filter(a => a.category === cat)}
                  onSelect={setSelected}
                  onPin={a => setPinTarget(a)}
                />
              );
            }
            return (
              <CategorySection
                key={cat}
                label={t(categoryLabelKey(cat))}
                count={items.filter(a => a.earned).length}
                total={allAchievements.filter(a => a.category === cat).length}
              >
                <AchievementGrid
                  achievements={items}
                  onClick={a => setSelected(a)}
                  onPin={a => (a.earned ? setPinTarget(a) : undefined)}
                />
              </CategorySection>
            );
          })}
        </div>
      )}

      <AchievementDetailModal achievement={selected} onClose={() => setSelected(null)} />
      <AchievementPinModal
        achievement={pinTarget}
        pinnedSlots={pinnedSlots}
        onClose={() => setPinTarget(null)}
        onPin={handlePin}
      />
    </div>
  );
}

const PLACE_TABS = [
  { id: 'first-place', label: '1st' },
  { id: 'second-place', label: '2nd' },
  { id: 'third-place', label: '3rd' },
  { id: 'tournaments-played', label: 'Played' },
] as const;

interface TournamentSectionProps {
  items: Achievement[];
  allItems: Achievement[];
  onSelect: (a: Achievement) => void;
  onPin: (a: Achievement) => void;
}

function TournamentSection({ items, allItems, onSelect, onPin }: TournamentSectionProps) {
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
                'flex-1 rounded-lg py-1.5 text-xs font-extrabold uppercase tracking-wider transition-all',
                activeTab === tab.id
                  ? 'bg-electric-pink/20 text-electric-pink border border-electric-pink/40'
                  : 'text-white/45 hover:text-white/70'
              )}
            >
              {tab.label}
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

interface CategorySectionProps {
  label: string;
  count: number;
  total: number;
  children: React.ReactNode;
}

function CategorySection({ label, count, total, children }: CategorySectionProps) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-baseline gap-2 px-5">
        <h2 className="text-xs font-extrabold uppercase tracking-widest text-white/60">{label}</h2>
        <span className="text-[11px] font-bold tabular-nums text-white/30">
          {count}/{total}
        </span>
      </div>
      <div className="px-4">{children}</div>
    </section>
  );
}

function CategorySectionSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline gap-2 px-5">
        <div className="h-3 w-20 rounded-full bg-white/10" />
        <div className="h-2.5 w-8 rounded-full bg-white/8" />
      </div>
      <div className="px-4">
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="rounded-rectangle" className="h-28" />
          ))}
        </div>
      </div>
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
    <div className="-mx-5 overflow-x-auto px-5 scrollbar-hidden">
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
