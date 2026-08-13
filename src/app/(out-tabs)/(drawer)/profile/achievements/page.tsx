'use client';
import { useState } from 'react';
import { useGetAchievementsQuery } from '@/api/achievements.api';
import { usePinAchievementMutation, useGetProfileQuery } from '@/api/profile.api';
import { AchievementGrid } from '@/components/shared/achievements/AchievementGrid';
import { AchievementDetailModal } from '@/components/shared/achievements/AchievementDetailModal';
import { AchievementPinModal } from '@/components/shared/achievements/AchievementPinModal';
import { CategorySection } from '@/components/pages/out-tabs/drawer/profile/achievements/CategorySection';
import { CategorySectionSkeleton } from '@/components/pages/out-tabs/drawer/profile/achievements/CategorySectionSkeleton';
import { FilterPills } from '@/components/pages/out-tabs/drawer/profile/achievements/FilterPills';
import { TournamentSection } from '@/components/pages/out-tabs/drawer/profile/achievements/TournamentSection';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useToast } from '@/hooks/useToast';
import { GlobalConstants } from '@/constants/global.constants';
import { AchievementCategory, AchievementRarity } from '@/types/enums/achievement.enums';
import {
  categoryLabelKey,
  rarityLabelKey,
} from '@/components/shared/achievements/achievement.utils';
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
  const toast = useToast();
  const { data, isLoading, isError, refetch } = useGetAchievementsQuery();
  const { data: profile } = useGetProfileQuery(undefined);
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

  // One pin target per showcase slot the profile actually has — follows the
  // backend value instead of hardcoding, so a future slot-expansion re-enable
  // (raising showcaseMaxSlots) needs no change here.
  const slotCount = Math.max(profile?.showcaseSlots ?? GlobalConstants.showcaseFreeSlots, 1);
  const pinnedSlots: (Achievement | null)[] = Array.from(
    { length: slotCount },
    (_, slot) => allAchievements.find(a => a.isPinned && a.pinnedSlot === slot) ?? null
  );

  const handlePin = async (slot: number) => {
    if (!pinTarget) return;
    try {
      await pinAchievement({ achievementId: pinTarget.id, slot }).unwrap();
      setPinTarget(null);
    } catch {
      toast.error(t('action failed'));
    }
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

      {/* 14px, not 10: the pills are 30px tall, so a 10px gap puts three rows
          on a 40px pitch and each row's 44px hit zone reaches 4px into the one
          above and below — measured, the middle rows lost 5 sample points of 25
          to their neighbours. At 14px the pitch is exactly 44 and the zones
          meet without overlapping. */}
      <div className="flex flex-col gap-3.5 px-5">
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
