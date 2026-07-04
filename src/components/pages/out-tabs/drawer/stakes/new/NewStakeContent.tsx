'use client';

import '@/styles/components/stakes.css';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Info, Sparkles } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { icons } from '@/constants/icons';
import { formatCompact } from '@/utils/global/number.utils';
import { useGetMeQuery } from '@/api/me.api';
import { useGetStakesQuery, useStartStakeMutation } from '@/api/stakes.api';
import { routes } from '@/constants/routes';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import {
  computeStakeActivityPoints,
  computeStakeFee,
  computeStakeReturnCoins,
  findLevelForDeposit,
} from '@/utils/global/stakes.utils';
import { GlobalConstants } from '@/constants/global.constants';
import type { ActivityTier } from '@/constants/global.constants';
import { useUnlockedTiers } from '@/hooks/useUnlockedTiers';
import { NewStakeHero } from '@/components/pages/out-tabs/drawer/stakes/new/NewStakeHero';
import { NewStakeStickyCta } from '@/components/pages/out-tabs/drawer/stakes/new/NewStakeStickyCta';
import { StakeLevelsCompareModal } from '@/components/pages/out-tabs/drawer/stakes/new/StakeLevelsCompareModal';
import { StakeOpenedModal } from '@/components/pages/out-tabs/drawer/stakes/new/StakeOpenedModal';
import { StakesRewardsPreviewCard } from '@/components/pages/out-tabs/drawer/stakes/StakesRewardsPreviewCard';
import { StakesSectionLabel } from '@/components/pages/out-tabs/drawer/stakes/StakesSectionLabel';
import { StakesWalletPill } from '@/components/pages/out-tabs/drawer/stakes/StakesWalletPill';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { QueryErrorState } from '@/components/shared/error/QueryErrorState';

const SLIDER_CAP = 1_000_000;

export function NewStakeContent() {
  const t = useAppTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: stakes, isLoading: stakesLoading, isError, refetch } = useGetStakesQuery();
  const { data: me, isLoading: meLoading } = useGetMeQuery();
  const [startStake, { isLoading: starting }] = useStartStakeMutation();
  const { isTierUnlocked } = useUnlockedTiers();

  const balance = me?.coins ?? 0;
  const levels = stakes?.levels ?? [];
  const minDepositOfFirst = levels[0]?.minDeposit ?? 0;
  const [deposit, setDeposit] = useState<number>(minDepositOfFirst);
  const [durationMonths, setDurationMonths] = useState<number>(1);

  // Pre-fill from query (?amount=, ?months=) for the "re-stake" flow from history.
  useEffect(() => {
    const amountParam = Number(searchParams.get('amount'));
    const monthsParam = Number(searchParams.get('months'));
    if (Number.isFinite(amountParam) && amountParam > 0) setDeposit(amountParam);
    if (Number.isFinite(monthsParam) && monthsParam > 0) setDurationMonths(monthsParam);
  }, [searchParams]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [openedSnapshot, setOpenedSnapshot] = useState<{ amount: number; months: number } | null>(
    null
  );

  if (isError) return <QueryErrorState onRetry={() => refetch()} />;

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
  const tierLocked = !isTierUnlocked(activeLevel.tier);
  const sliderMax = Math.min(Math.max(balance, minDepositOfFirst), SLIDER_CAP);
  const stakeFee = computeStakeFee(
    safeDeposit,
    durationMonths,
    me?.isLuckyPlayer ?? false,
    activeLevel.level,
    me?.bronzeStakesOpened ?? 0
  );
  const bronzeFreeRemaining = Math.max(
    0,
    GlobalConstants.stakeBronzeFreeStartCount - (me?.bronzeStakesOpened ?? 0)
  );

  const maxMonths = GlobalConstants.stakeDurationMaxMonths;
  const apAtMax = computeStakeActivityPoints(safeDeposit, maxMonths);
  const apNow = computeStakeActivityPoints(safeDeposit, durationMonths);
  const apDelta = apAtMax - apNow;
  const lcAtMax = computeStakeReturnCoins(
    safeDeposit,
    maxMonths,
    me?.isLuckyPlayer ?? false,
    me?.isVIP ?? false
  );
  const lcNow = computeStakeReturnCoins(
    safeDeposit,
    durationMonths,
    me?.isLuckyPlayer ?? false,
    me?.isVIP ?? false
  );
  const lcDelta = lcAtMax - lcNow;
  const ctaHint =
    durationMonths < maxMonths && apDelta > 0
      ? t('extend to {n} months for {ap} more AP and {lc} more LC', {
          n: maxMonths,
          ap: apDelta.toLocaleString(),
          lc: lcDelta.toLocaleString(),
        })
      : undefined;

  const starsBalance = me?.telegramStars ?? 0;
  const notEnoughStars = !stakeFee.free && starsBalance < stakeFee.fee;

  const tierLockedHint = tierLocked
    ? (() => {
        const required = GlobalConstants.apTierThresholds[activeLevel.tier as ActivityTier];
        const apShort = required - (me?.activityPoints ?? 0);
        return t('need {tier} tier {ap} more ap', {
          tier: t(activeLevel.tier),
          ap: Math.max(0, apShort).toLocaleString(),
        });
      })()
    : null;

  const handleConfirm = async () => {
    if (tierLocked || safeDeposit < activeLevel.minDeposit || safeDeposit > balance) return;
    if (notEnoughStars) {
      setErrorMessage(t('not enough stars for fee {n}', { n: stakeFee.fee - starsBalance }));
      return;
    }
    setErrorMessage(null);
    const result = await startStake({
      level: activeLevel.level,
      amount: safeDeposit,
      durationMonths,
    });
    if ('data' in result && result.data?.success) {
      setOpenedSnapshot({ amount: safeDeposit, months: durationMonths });
    } else if ('error' in result) {
      setErrorMessage(t('failed to start stake try again'));
    }
  };

  const handleOpenedClose = () => {
    setOpenedSnapshot(null);
    router.replace(routes.stakes.index);
  };

  return (
    <div className="flex flex-col gap-1 pb-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setCompareOpen(true)}
          className="text-pink-secondary hover:text-white inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider transition-colors"
        >
          <span>{t('pick level amount')}</span>
          <Info size={11} strokeWidth={2.4} />
        </button>
        <div className="flex items-center gap-1.5">
          <Link
            href={routes.wallet}
            aria-label={t('go to wallet to buy stars')}
            className="hover:bg-back-button-background/80 inline-flex items-center gap-1 rounded-full border border-white/10 bg-back-button-background/60 px-2.5 py-1.5 transition-colors"
          >
            <Image src={icons.telegramStar} alt="" className="h-3.5 w-auto" />
            <span className="text-gold text-[12px] font-extrabold tabular-nums">
              {formatCompact(starsBalance)}
            </span>
          </Link>
          <StakesWalletPill balance={balance} />
        </div>
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

      {!me?.isLuckyPlayer && safeDeposit >= 100_000 && (
        <Link
          href={routes.settings.luckyPlayer}
          className="border-electric-pink/35 bg-electric-pink/10 hover:bg-electric-pink/15 mt-2 flex items-center gap-2 rounded-xl border px-3 py-2 transition-colors"
        >
          <Sparkles size={14} className="text-electric-pink shrink-0" strokeWidth={2.4} />
          <span className="text-electric-pink flex-1 text-[11px] font-semibold leading-tight">
            {t('lucky player doubles volume discount')}
          </span>
          <ChevronRight size={12} className="text-electric-pink shrink-0" strokeWidth={2.4} />
        </Link>
      )}

      <StakesSectionLabel>
        {t('what you will get level {level}', { level: activeLevel.level })}
      </StakesSectionLabel>
      <StakesRewardsPreviewCard
        levelDef={activeLevel}
        deposit={safeDeposit}
        durationMonths={durationMonths}
      />

      {tierLockedHint && (
        <div className="border-error/40 bg-error/10 text-error mt-3 rounded-xl border px-3 py-2 text-center text-[11px] font-bold">
          {tierLockedHint}
        </div>
      )}

      <NewStakeStickyCta
        level={activeLevel.level}
        amount={safeDeposit}
        minDeposit={activeLevel.minDeposit}
        balance={balance}
        stakeFee={stakeFee.fee}
        stakeFeeFree={stakeFee.free}
        bronzeFreeRemaining={bronzeFreeRemaining}
        hint={ctaHint}
        balanceAfter={Math.max(0, balance - safeDeposit)}
        tierLocked={tierLocked}
        loading={starting}
        onConfirm={handleConfirm}
      />
      {errorMessage && (
        <div className="border-error/40 bg-error/15 text-error mt-2 rounded-xl border px-3 py-2 text-center text-[11px] font-bold">
          {errorMessage}
        </div>
      )}

      <StakeLevelsCompareModal
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
        levels={levels}
      />

      {openedSnapshot && (
        <StakeOpenedModal
          open
          onClose={handleOpenedClose}
          amount={openedSnapshot.amount}
          months={openedSnapshot.months}
        />
      )}
    </div>
  );
}
