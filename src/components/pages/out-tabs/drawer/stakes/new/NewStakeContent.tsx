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
import { useStakesDisplayConfig } from '@/hooks/useStakesDisplayConfig';
import {
  computeMaxStakeable,
  computeStakeActivityPoints,
  computeStakeFee,
  computeStakeReturnCoins,
  findFirstLockedLevel,
  findLevelForDeposit,
} from '@/utils/global/stakes.utils';
import { formatTierGap } from '@/utils/global/activity.utils';
import { tierNameId } from '@/constants/tier-names';
import { useUnlockedTiers } from '@/hooks/useUnlockedTiers';
import { NewStakeHero } from '@/components/pages/out-tabs/drawer/stakes/new/NewStakeHero';
import { NewStakeStickyCta } from '@/components/pages/out-tabs/drawer/stakes/new/NewStakeStickyCta';
import { StakeLevelsCompareModal } from '@/components/pages/out-tabs/drawer/stakes/new/StakeLevelsCompareModal';
import { StakeOpenedModal } from '@/components/pages/out-tabs/drawer/stakes/new/StakeOpenedModal';
import { StakesRewardsPreviewCard } from '@/components/pages/out-tabs/drawer/stakes/StakesRewardsPreviewCard';
import { StakesSectionLabel } from '@/components/pages/out-tabs/drawer/stakes/StakesSectionLabel';
import { StakesWalletPill } from '@/components/pages/out-tabs/drawer/stakes/StakesWalletPill';
import { NotEnoughCoinsModal } from '@/components/shared/modals/NotEnoughCoinsModal';
import { TierGateModal } from '@/components/shared/modals/TierGateModal';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { QueryErrorState } from '@/components/shared/error/QueryErrorState';
import type { TicketType } from '@/types/types/ticket.types';

export function NewStakeContent() {
  const t = useAppTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: stakes, isLoading: stakesLoading, isError, refetch } = useGetStakesQuery();
  const { data: me, isLoading: meLoading } = useGetMeQuery();
  const stakeCfg = useStakesDisplayConfig();
  const [startStake, { isLoading: starting }] = useStartStakeMutation();
  const { isTierUnlocked, tierGap } = useUnlockedTiers();

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
  // Which gate the blocked CTA was tapped through — each opens the screen that
  // moves it (AP page / invites for a tier, tasks for a balance).
  const [blocked, setBlocked] = useState<'tier' | 'coins' | null>(null);

  if (isError) return <QueryErrorState onRetry={() => refetch()} />;

  // Admin kill switch — the whole new-stake flow is off (deep links included).
  if (stakes && stakes.enabled === false) {
    return (
      <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
        <Info size={28} className="text-white/30" />
        <p className="text-sm text-white/60">{t('stakes disabled')}</p>
      </div>
    );
  }

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
  // The balance is the only ceiling the backend enforces (`StakesService.start`
  // checks `user.coins >= amount` and nothing above it), so the track runs to
  // the full balance — a fixed UI cap used to hide the rest.
  const sliderMax = Math.max(balance, minDepositOfFirst);
  // …but the tier gate is a second ceiling, and it used to exist only as a
  // greyed-out button at the far end of the screen. `maxStakeable` is where the
  // controls stop; `lockedLevel` is the level that put the wall there.
  const lockedLevel = findFirstLockedLevel(levels, isTierUnlocked);
  const maxStakeable = computeMaxStakeable(levels, balance, isTierUnlocked);
  const lockedLevelHint = lockedLevel ? formatTierGap(tierGap(lockedLevel.tier), t) : undefined;
  const stakeFee = computeStakeFee(
    safeDeposit,
    durationMonths,
    me?.isLuckyPlayer ?? false,
    activeLevel.level,
    me?.bronzeStakesOpened ?? 0
  );
  const bronzeFreeRemaining = Math.max(
    0,
    stakeCfg.bronzeFreeStartCount - (me?.bronzeStakesOpened ?? 0)
  );

  const maxMonths = stakeCfg.durationMaxMonths;
  const apAtMax = computeStakeActivityPoints(safeDeposit, maxMonths, stakeCfg);
  const apNow = computeStakeActivityPoints(safeDeposit, durationMonths, stakeCfg);
  const apDelta = apAtMax - apNow;
  const lcAtMax = computeStakeReturnCoins(
    safeDeposit,
    maxMonths,
    me?.isLuckyPlayer ?? false,
    me?.isVIP ?? false,
    stakeCfg
  );
  const lcNow = computeStakeReturnCoins(
    safeDeposit,
    durationMonths,
    me?.isLuckyPlayer ?? false,
    me?.isVIP ?? false,
    stakeCfg
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

  // Both halves of the gate, and only the ones actually missing. Naming AP
  // unconditionally is how a stake blocked on friends said "need 0 more AP".
  const tierLockedHint = tierLocked
    ? [
        t('level {level} needs {tier} tier', {
          level: activeLevel.level,
          tier: t(tierNameId[activeLevel.tier]),
        }),
        formatTierGap(tierGap(activeLevel.tier), t),
      ]
        .filter(Boolean)
        .join(' · ')
    : undefined;

  const handleConfirm = async () => {
    if (tierLocked || safeDeposit < activeLevel.minDeposit || safeDeposit > maxStakeable) return;
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
        maxStakeable={maxStakeable}
        lockedLevel={lockedLevel}
        lockedLevelHint={lockedLevelHint}
        onExplainLock={() => setBlocked('tier')}
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

      {/* Pinned to the bottom of the scroller: the answer to "can I stake this?"
          has to be on screen while the amount is being set, not two scrolls
          under the rewards preview. */}
      <div
        className="from-background via-background sticky z-20 -mx-5 mt-3 bg-gradient-to-t via-70% to-transparent px-5 pb-2 pt-6"
        style={{ bottom: 'var(--tg-inset-bottom)' }}
      >
        {errorMessage && (
          <div className="border-error/40 bg-error/15 text-error-text mb-2 rounded-xl border px-3 py-2 text-center text-[11px] font-bold">
            {errorMessage}
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
          tierLockedHint={tierLockedHint}
          loading={starting}
          onConfirm={handleConfirm}
          onBlocked={setBlocked}
        />
      </div>

      <StakeLevelsCompareModal
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
        levels={levels}
      />

      <TierGateModal
        open={blocked === 'tier'}
        onClose={() => setBlocked(null)}
        // Blocked → the level being configured is the gated one. Otherwise the
        // gate was opened from the ceiling notice, which is about the level
        // above the wall, not the (unlocked) one currently selected.
        tier={
          (tierLocked ? activeLevel.tier : (lockedLevel?.tier ?? activeLevel.tier)) as TicketType
        }
        titleId="stake level locked"
      />

      <NotEnoughCoinsModal
        open={blocked === 'coins'}
        onClose={() => setBlocked(null)}
        required={safeDeposit}
        current={balance}
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
