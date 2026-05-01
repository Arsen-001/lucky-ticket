'use client';

import '@/styles/components/stakes.css';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGetMeQuery } from '@/api/me.api';
import { useGetStakesQuery, useStartStakeMutation } from '@/api/stakes.api';
import { routes } from '@/constants/routes';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { findLevelForDeposit } from '@/utils/global/stakes.utils';
import { NewStakeHero } from '@/components/pages/out-tabs/drawer/stakes/new/NewStakeHero';
import { NewStakeStickyCta } from '@/components/pages/out-tabs/drawer/stakes/new/NewStakeStickyCta';
import { StakesRewardsPreviewCard } from '@/components/pages/out-tabs/drawer/stakes/StakesRewardsPreviewCard';
import { StakesSectionLabel } from '@/components/pages/out-tabs/drawer/stakes/StakesSectionLabel';
import { StakesWalletPill } from '@/components/pages/out-tabs/drawer/stakes/StakesWalletPill';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';

const SLIDER_CAP = 10000;

export function NewStakeContent() {
  const t = useAppTranslations();
  const router = useRouter();
  const { data: stakes, isLoading: stakesLoading } = useGetStakesQuery();
  const { data: me, isLoading: meLoading } = useGetMeQuery();
  const [startStake, { isLoading: starting }] = useStartStakeMutation();

  const balance = me?.coins ?? 0;
  const levels = stakes?.levels ?? [];
  const minDepositOfFirst = levels[0]?.minDeposit ?? 0;
  const [deposit, setDeposit] = useState<number>(minDepositOfFirst);
  const [durationMonths, setDurationMonths] = useState<number>(1);

  if (stakesLoading || meLoading || levels.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-44 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-44 rounded-2xl" />
      </div>
    );
  }

  const safeDeposit = deposit || minDepositOfFirst;
  const activeLevel = findLevelForDeposit(levels, safeDeposit);
  const sliderMax = Math.min(Math.max(balance, minDepositOfFirst), SLIDER_CAP);

  const handleConfirm = async () => {
    if (safeDeposit < activeLevel.minDeposit || safeDeposit > balance) return;
    const result = await startStake({
      level: activeLevel.level,
      amount: safeDeposit,
      durationMonths,
    });
    if ('data' in result && result.data?.success) {
      router.replace(routes.stakes.index);
    }
  };

  return (
    <div className="flex flex-col gap-1 pb-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-pink-secondary text-[10px] font-bold uppercase tracking-wider">
          {t('pick level amount')}
        </div>
        <StakesWalletPill balance={balance} />
      </div>

      <NewStakeHero
        levels={levels}
        activeLevel={activeLevel}
        deposit={safeDeposit}
        balance={balance}
        sliderMin={minDepositOfFirst}
        sliderMax={sliderMax}
        durationMonths={durationMonths}
        onDepositChange={setDeposit}
        onDurationChange={setDurationMonths}
      />

      <StakesSectionLabel>
        {t('what you will get level {level}', { level: activeLevel.level })}
      </StakesSectionLabel>
      <StakesRewardsPreviewCard levelDef={activeLevel} />

      <NewStakeStickyCta
        level={activeLevel.level}
        amount={safeDeposit}
        minDeposit={activeLevel.minDeposit}
        balance={balance}
        loading={starting}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
