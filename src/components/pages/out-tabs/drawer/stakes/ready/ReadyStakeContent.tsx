'use client';

import '@/styles/components/stakes.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { useClaimStakeMutation, useGetStakesQuery } from '@/api/stakes.api';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { routes } from '@/constants/routes';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useCountDown } from '@/hooks/useCountDown';
import {
  computeStakeMonths,
  computeStakeProgress,
  findLevelDef,
  isStakeReady,
} from '@/utils/global/stakes.utils';
import { StakeCountdownRing } from '@/components/pages/out-tabs/drawer/stakes/progress/StakeCountdownRing';
import { StakesClaimRewardsModal } from '@/components/pages/out-tabs/drawer/stakes/StakesClaimRewardsModal';
import { StakesRewardsPreviewCard } from '@/components/pages/out-tabs/drawer/stakes/StakesRewardsPreviewCard';
import { StakesSectionLabel } from '@/components/pages/out-tabs/drawer/stakes/StakesSectionLabel';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { Button } from '@/components/shared/buttons/Button';

export interface ReadyStakeContentProps {
  stakeId: string;
}

export function ReadyStakeContent({ stakeId }: ReadyStakeContentProps) {
  const t = useAppTranslations();
  const router = useRouter();
  const { data: stakes, isLoading } = useGetStakesQuery();
  const [claimStake, { isLoading: claiming }] = useClaimStakeMutation();

  const stake = stakes?.activeStakes.find(s => s.id === stakeId);
  const levelDef = stake && stakes ? findLevelDef(stakes.levels, stake.level) : undefined;

  const countdown = useCountDown(stake?.endDate);
  const ready = stake ? countdown.expired || isStakeReady(stake.endDate) : false;

  const [rewardsOpen, setRewardsOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && stake && !ready) {
      router.replace(routes.stakes.getById(stake.id));
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

  const handleClaim = async () => {
    const result = await claimStake({ stakeId: stake.id });
    if ('data' in result && result.data?.success) {
      setRewardsOpen(true);
    }
  };

  const handleRewardsClose = () => {
    setRewardsOpen(false);
    router.replace(routes.stakes.index);
  };

  return (
    <div className="flex flex-col gap-1 pb-4">
      <div className="text-pink-secondary mb-3 text-[10px] font-bold uppercase tracking-wider">
        {t('level {level}', { level: levelDef.level })}
      </div>

      <div
        className="stake-card-shell stake-card-border px-5 py-6"
        style={{ ['--stake-card-accent' as string]: `var(--color-${levelDef.tier})` }}
      >
        <div className="relative text-center">
          <StakeCountdownRing
            levelDef={levelDef}
            leftTime={countdown.leftTime}
            progress={progress}
            ready
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
            <div className="rounded-xl border border-success/30 bg-success/10 px-3 py-2.5">
              <div className="text-success text-[9px] font-bold uppercase tracking-wider">
                {t('status')}
              </div>
              <div className="text-success mt-0.5 text-[14px] font-extrabold uppercase leading-none tracking-wider">
                {t('ready')}
              </div>
            </div>
          </div>
        </div>
      </div>

      <StakesSectionLabel>{t('rewards ready')}</StakesSectionLabel>
      <StakesRewardsPreviewCard
        levelDef={levelDef}
        deposit={stake.lockedAmount}
        durationMonths={computeStakeMonths(stake.startDate, stake.endDate)}
      />

      <div className="sticky bottom-0 -mx-5 mt-5 px-5 pb-2 pt-6 bg-gradient-to-b from-transparent to-background">
        <Button
          type="button"
          onClick={handleClaim}
          disabled={claiming}
          className="stakes-btn-glow flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-[13px] font-extrabold uppercase tracking-wider text-white shadow-[0_10px_28px_rgba(222,0,155,0.45),inset_0_1px_0_rgba(255,255,255,0.25)] disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #DE009B 0%, #743DF5 100%)' }}
        >
          <span>{t('open rewards')}</span>
          <ArrowRight size={18} strokeWidth={2.5} />
        </Button>
      </div>

      <StakesClaimRewardsModal
        open={rewardsOpen}
        onClose={handleRewardsClose}
        levelDef={levelDef}
        stake={stake}
      />
    </div>
  );
}
