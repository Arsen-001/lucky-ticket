'use client';

import '@/styles/components/stakes.css';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCancelStakeMutation, useGetStakesQuery } from '@/api/stakes.api';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { routes } from '@/constants/routes';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useCountDown } from '@/hooks/useCountDown';
import { computeStakeProgress, findLevelDef, isStakeReady } from '@/utils/global/stakes.utils';
import { StakeCancelSection } from '@/components/pages/out-tabs/drawer/stakes/progress/StakeCancelSection';
import { StakeCountdownRing } from '@/components/pages/out-tabs/drawer/stakes/progress/StakeCountdownRing';
import { StakesRewardsPreviewCard } from '@/components/pages/out-tabs/drawer/stakes/StakesRewardsPreviewCard';
import { StakesSectionLabel } from '@/components/pages/out-tabs/drawer/stakes/StakesSectionLabel';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';

export interface ProgressStakeContentProps {
  stakeId: string;
}

export function ProgressStakeContent({ stakeId }: ProgressStakeContentProps) {
  const t = useAppTranslations();
  const router = useRouter();
  const { data: stakes, isLoading } = useGetStakesQuery();
  const [cancelStake, { isLoading: cancelling }] = useCancelStakeMutation();

  const stake = stakes?.activeStakes.find(s => s.id === stakeId);
  const levelDef = stake && stakes ? findLevelDef(stakes.levels, stake.level) : undefined;

  const countdown = useCountDown(stake?.endDate);
  const ready = stake ? countdown.expired || isStakeReady(stake.endDate) : false;

  useEffect(() => {
    if (!isLoading && stake && ready) {
      router.replace(routes.stakes.getReadyById(stake.id));
    }
  }, [isLoading, stake, ready, router]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-44 rounded-2xl" />
      </div>
    );
  }

  if (!stake || !levelDef) {
    return (
      <div className="text-white-secondary py-12 text-center text-sm">{t('stake not found')}</div>
    );
  }

  const progress = computeStakeProgress(stake.startDate, stake.endDate);

  const handleCancel = async () => {
    const result = await cancelStake({ stakeId: stake.id });
    if ('data' in result && result.data?.success) {
      router.replace(routes.stakes.index);
    }
  };

  return (
    <div className="flex flex-col gap-1 pb-4">
      <div className="text-pink-secondary mb-3 text-[10px] font-bold uppercase tracking-wider">
        {t('level {level} · {count} tickets', {
          level: levelDef.level,
          count: levelDef.allTickets.length,
        })}
      </div>

      <div
        className="stake-card-shell stake-card-border px-5 py-6"
        style={{ ['--stake-card-accent' as string]: `var(--color-${levelDef.guaranteedTicket})` }}
      >
        <div className="relative text-center">
          <StakeCountdownRing
            levelDef={levelDef}
            leftTime={countdown.leftTime}
            progress={progress}
            ready={false}
          />

          <div className="mt-5 grid grid-cols-2 gap-2.5 text-left">
            <div className="rounded-xl border border-white/5 bg-black/30 px-3 py-2.5">
              <div className="text-pink-secondary text-[9px] font-bold uppercase tracking-wider">
                {t('locked')}
              </div>
              <div className="mt-0.5 flex items-baseline gap-1">
                <LcLabel size={22} className="self-center" />
                <span className="text-gold text-[16px] font-extrabold leading-none tabular-nums">
                  {stake.lockedAmount.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="rounded-xl border border-white/5 bg-black/30 px-3 py-2.5">
              <div className="text-pink-secondary text-[9px] font-bold uppercase tracking-wider">
                {t('progress')}
              </div>
              <div className="mt-0.5 text-[16px] font-extrabold leading-none text-white tabular-nums">
                {progress}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <StakesSectionLabel>{t('rewards on completion')}</StakesSectionLabel>
      <StakesRewardsPreviewCard levelDef={levelDef} />

      <div className="mt-5">
        <StakeCancelSection
          level={levelDef.level}
          lockedAmount={stake.lockedAmount}
          loading={cancelling}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
