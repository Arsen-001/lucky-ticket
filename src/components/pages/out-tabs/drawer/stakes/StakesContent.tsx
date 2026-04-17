'use client';

import { useGetStakesQuery } from '@/api/stakes.api';
import { StakesActiveSession } from '@/components/pages/out-tabs/drawer/stakes/StakesActiveSession';
import { StakesLevelCard } from '@/components/pages/out-tabs/drawer/stakes/StakesLevelCard';
import { StakesStartModal } from '@/components/pages/out-tabs/drawer/stakes/StakesStartModal';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import type { StakeLevelDefinition } from '@/types/interfaces/stakes.interfaces';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { Layers } from 'lucide-react';
import { useState } from 'react';

export function StakesContent() {
  const t = useAppTranslations();
  const { data: stakes, isLoading } = useGetStakesQuery();
  const [selectedLevel, setSelectedLevel] = useState<StakeLevelDefinition | null>(null);

  const hasActiveStake = !!stakes?.activeStake;

  return (
    <div className="flex flex-col gap-5">
      <SkeletonSuspense
        loading={isLoading}
        skeleton={<Skeleton className="w-full h-36 rounded-2xl" />}
      >
        {stakes?.activeStake &&
          (() => {
            const levelDef = stakes.levels.find(l => l.level === stakes.activeStake!.level);
            return levelDef ? (
              <StakesActiveSession stake={stakes.activeStake} levelDef={levelDef} />
            ) : null;
          })()}
      </SkeletonSuspense>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Layers size={15} />
          <span>{t('stake levels')}</span>
        </div>

        <SkeletonSuspense
          loading={isLoading}
          skeleton={
            <div className="flex flex-col gap-3">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="w-full h-44 rounded-2xl" />
              ))}
            </div>
          }
        >
          <div className="flex flex-col gap-3">
            {stakes?.levels.map(levelDef => (
              <StakesLevelCard
                key={levelDef.level}
                levelDef={levelDef}
                hasActiveStake={hasActiveStake}
                onStart={setSelectedLevel}
              />
            ))}
          </div>
        </SkeletonSuspense>
      </div>

      <StakesStartModal
        open={!!selectedLevel}
        onClose={() => setSelectedLevel(null)}
        levelDef={selectedLevel}
      />
    </div>
  );
}
