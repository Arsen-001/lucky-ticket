'use client';

import '@/styles/components/stakes.css';
import { useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCancelStakeMutation, useGetStakesQuery } from '@/api/stakes.api';
import { useGetMeQuery } from '@/api/me.api';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { icons } from '@/constants/icons';
import { routes } from '@/constants/routes';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useSpendFailure } from '@/hooks/useSpendFailure';
import { useCountDown } from '@/hooks/useCountDown';
import { formatDate } from '@/utils/global/date.utils';
import { formatCompact } from '@/utils/global/number.utils';
import {
  computeStakeCancelFee,
  computeStakeMonths,
  computeStakeProgress,
  findLevelDef,
  isStakeReady,
} from '@/utils/global/stakes.utils';
import { stakeAccent } from '@/components/pages/out-tabs/drawer/stakes/StakesLevelChip';
import { StakeCancelSection } from '@/components/pages/out-tabs/drawer/stakes/progress/StakeCancelSection';
import { StakeCountdownRing } from '@/components/pages/out-tabs/drawer/stakes/progress/StakeCountdownRing';
import { StakesRewardsPreviewCard } from '@/components/pages/out-tabs/drawer/stakes/StakesRewardsPreviewCard';
import { StakesSectionLabel } from '@/components/pages/out-tabs/drawer/stakes/StakesSectionLabel';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { QueryErrorState } from '@/components/shared/error/QueryErrorState';

export interface ProgressStakeContentProps {
  stakeId: string;
}

export function ProgressStakeContent({ stakeId }: ProgressStakeContentProps) {
  const t = useAppTranslations();
  const spend = useSpendFailure();
  const router = useRouter();
  const { data: stakes, isLoading, isError, refetch } = useGetStakesQuery();
  const { data: me } = useGetMeQuery();
  const [cancelStake, { isLoading: cancelling }] = useCancelStakeMutation();

  const stake = stakes?.activeStakes.find(s => s.id === stakeId);
  // `null` is a valid answer here (a stake below the cheapest band), so only a
  // missing STAKE is "not found" — keying the guard on the band is how a real
  // stake became an untappable card that opened an error page.
  const levelDef = stake && stakes ? findLevelDef(stakes.levels, stake.level) : null;

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

  if (isError) return <QueryErrorState onRetry={() => refetch()} />;

  if (!stake) {
    return (
      <div className="text-white-secondary py-12 text-center text-sm">{t('stake not found')}</div>
    );
  }

  const progress = computeStakeProgress(stake.startDate, stake.endDate);

  const handleCancel = async () => {
    const result = await cancelStake({ stakeId: stake.id });
    if ('data' in result && result.data?.success) {
      router.replace(routes.stakes.index);
    } else if ('error' in result) {
      // e.g. "Not enough Lucky Stars for the cancel fee" (400) — the shared
      // handler turns that into the buy-Stars sheet rather than a flat toast.
      await spend.report(result.error, { required: computeStakeCancelFee(stake.lockedAmount) });
    }
  };

  const cancelFee = computeStakeCancelFee(stake.lockedAmount);
  const starsBalance = me?.telegramStars ?? 0;

  return (
    <div className="flex flex-col gap-1 pb-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="text-pink-secondary text-[10px] font-bold uppercase tracking-wider">
          {levelDef ? t('level {level}', { level: levelDef.level }) : t('no level')}
        </div>
        <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-back-button-background/60 px-2.5 py-1.5">
          <Image src={icons.telegramStar} alt="" className="h-3.5 w-auto" />
          <span className="text-gold text-[12px] font-extrabold tabular-nums">
            {formatCompact(starsBalance)}
          </span>
          <span className="text-pink-secondary text-[8px] font-bold uppercase tracking-wider">
            {t('cancel')} −{cancelFee}
          </span>
        </div>
      </div>

      <div
        className="stake-card-shell stake-card-border px-5 py-6"
        style={{ ['--stake-card-accent' as string]: stakeAccent(levelDef) }}
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
              <div className="mt-0.5 flex items-center gap-1">
                <LcLabel size={22} />
                <span className="text-gold text-[16px] font-extrabold leading-none tabular-nums">
                  {formatCompact(stake.lockedAmount)}
                </span>
              </div>
            </div>
            {/* The ring already carries the percentage — this tile answers the
                other half of "when do I get it back": the unlock date. */}
            <div className="rounded-xl border border-white/5 bg-black/30 px-3 py-2.5">
              <div className="text-pink-secondary text-[9px] font-bold uppercase tracking-wider">
                {t('ends on')}
              </div>
              <div className="mt-0.5 text-[16px] font-extrabold leading-none text-white tabular-nums">
                {formatDate(stake.endDate, 'DD.MM.YY')}
              </div>
            </div>
          </div>
        </div>
      </div>

      <StakesSectionLabel>{t('rewards on completion')}</StakesSectionLabel>
      <StakesRewardsPreviewCard
        levelDef={levelDef}
        deposit={stake.lockedAmount}
        durationMonths={computeStakeMonths(stake.startDate, stake.endDate)}
      />

      <div className="mt-5">
        <StakeCancelSection
          lockedAmount={stake.lockedAmount}
          durationMonths={computeStakeMonths(stake.startDate, stake.endDate)}
          loading={cancelling}
          onCancel={handleCancel}
        />
      </div>

      {spend.modals}
    </div>
  );
}
