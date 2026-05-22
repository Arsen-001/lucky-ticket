'use client';

import '@/styles/components/stakes.css';
import { useGetStakesQuery } from '@/api/stakes.api';
import { useGetMeQuery } from '@/api/me.api';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { ArrivalShine } from '@/components/shared/ArrivalShine';
import { StakesActiveStakeCard } from '@/components/pages/out-tabs/drawer/stakes/StakesActiveStakeCard';
import { StakesEmptyActiveCard } from '@/components/pages/out-tabs/drawer/stakes/StakesEmptyActiveCard';
import { StakesHistoryRow } from '@/components/pages/out-tabs/drawer/stakes/StakesHistoryRow';
import { StakesNewStakeFab } from '@/components/pages/out-tabs/drawer/stakes/StakesNewStakeFab';
import { StakesSectionLabel } from '@/components/pages/out-tabs/drawer/stakes/StakesSectionLabel';
import { StakesSummaryCard } from '@/components/pages/out-tabs/drawer/stakes/StakesSummaryCard';
import { StakesWalletPill } from '@/components/pages/out-tabs/drawer/stakes/StakesWalletPill';
import {
  findLevelDef,
  isStakeReady,
  sortHistoryNewestFirst,
  sortStakesReadyFirst,
} from '@/utils/global/stakes.utils';

export function StakesContent() {
  const t = useAppTranslations();
  const { data: stakes, isLoading } = useGetStakesQuery();
  const { data: me } = useGetMeQuery();

  const balance = me?.coins ?? 0;
  const activeStakes = stakes ? sortStakesReadyFirst(stakes.activeStakes) : [];
  const history = stakes ? sortHistoryNewestFirst(stakes.history) : [];
  const totalLocked = activeStakes.reduce((sum, s) => sum + s.lockedAmount, 0);
  const readyCount = activeStakes.filter(s => isStakeReady(s.endDate)).length;

  return (
    <div className="relative flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-pink-secondary text-[10px] font-bold uppercase tracking-wider">
          {t('lock LC earn rewards')}
        </div>
        <StakesWalletPill balance={balance} locked={totalLocked} />
      </div>

      <SkeletonSuspense
        loading={isLoading}
        skeleton={<Skeleton className="h-22 w-full rounded-2xl" />}
      >
        <StakesSummaryCard
          activeCount={activeStakes.length}
          lockedAmount={totalLocked}
          readyCount={readyCount}
        />
      </SkeletonSuspense>

      <div>
        <StakesSectionLabel>
          <ArrivalShine id="stake" variant="title">
            <span className="flex items-center gap-2">
              {t('your active stakes')}
              {activeStakes.length > 0 && (
                <span className="text-pink-secondary text-[10px] font-bold uppercase tracking-wider">
                  {activeStakes.length}
                </span>
              )}
            </span>
          </ArrivalShine>
        </StakesSectionLabel>

        <SkeletonSuspense
          loading={isLoading}
          skeleton={
            <div className="grid grid-cols-2 gap-2.5">
              <Skeleton className="h-44 rounded-2xl" />
              <Skeleton className="h-44 rounded-2xl" />
            </div>
          }
        >
          {activeStakes.length === 0 ? (
            <StakesEmptyActiveCard />
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              {activeStakes.map(stake => {
                const levelDef = stakes && findLevelDef(stakes.levels, stake.level);
                if (!levelDef) return null;
                return <StakesActiveStakeCard key={stake.id} stake={stake} levelDef={levelDef} />;
              })}
            </div>
          )}
        </SkeletonSuspense>
      </div>

      <div>
        <StakesSectionLabel>{t('recent stakes')}</StakesSectionLabel>
        <SkeletonSuspense
          loading={isLoading}
          skeleton={
            <div className="flex flex-col gap-2">
              <Skeleton className="h-14 rounded-xl" />
              <Skeleton className="h-14 rounded-xl" />
              <Skeleton className="h-14 rounded-xl" />
            </div>
          }
        >
          {history.length === 0 ? (
            <p className="text-pink-secondary text-[11px]">{t('no completed stakes yet')}</p>
          ) : (
            <div className="flex flex-col gap-2 pb-24">
              {history.map(entry => (
                <StakesHistoryRow key={entry.id} entry={entry} levels={stakes?.levels ?? []} />
              ))}
            </div>
          )}
        </SkeletonSuspense>
      </div>

      <StakesNewStakeFab />
    </div>
  );
}
