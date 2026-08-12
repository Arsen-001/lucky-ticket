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
  computeStakeActivityPoints,
  computeStakeFee,
  computeStakeReturnCoins,
  findLevelForDeposit,
} from '@/utils/global/stakes.utils';
import { ClientPortal } from '@/components/shared/ClientPortal';
import { NewStakeHero } from '@/components/pages/out-tabs/drawer/stakes/new/NewStakeHero';
import { NewStakeStickyCta } from '@/components/pages/out-tabs/drawer/stakes/new/NewStakeStickyCta';
import { StakeLevelsCompareModal } from '@/components/pages/out-tabs/drawer/stakes/new/StakeLevelsCompareModal';
import { StakeOpenedModal } from '@/components/pages/out-tabs/drawer/stakes/new/StakeOpenedModal';
import { StakesRewardsPreviewCard } from '@/components/pages/out-tabs/drawer/stakes/StakesRewardsPreviewCard';
import { StakesSectionLabel } from '@/components/pages/out-tabs/drawer/stakes/StakesSectionLabel';
import { StakesWalletPill } from '@/components/pages/out-tabs/drawer/stakes/StakesWalletPill';
import { NotEnoughCoinsModal } from '@/components/shared/modals/NotEnoughCoinsModal';
import { useSpendFailure } from '@/hooks/useSpendFailure';
import { spendFailure } from '@/utils/global/spend-failure.utils';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { QueryErrorState } from '@/components/shared/error/QueryErrorState';

export function NewStakeContent() {
  const t = useAppTranslations();
  const spend = useSpendFailure();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: stakes, isLoading: stakesLoading, isError, refetch } = useGetStakesQuery();
  const { data: me, isLoading: meLoading } = useGetMeQuery();
  const stakeCfg = useStakesDisplayConfig();
  const [startStake, { isLoading: starting }] = useStartStakeMutation();

  const balance = me?.coins ?? 0;
  const levels = stakes?.levels ?? [];
  const [deposit, setDeposit] = useState<number>(0);
  const [durationMonths, setDurationMonths] = useState<number>(1);
  // Opens on the cheapest band when the player can afford it, on their whole
  // balance when they cannot — either way the screen starts on a real stake
  // instead of a zero the CTA immediately refuses.
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    if (seeded || levels.length === 0 || meLoading) return;
    const suggested = Math.min(balance, levels[0].minDeposit);
    setDeposit(suggested > 0 ? suggested : balance);
    setSeeded(true);
  }, [seeded, levels, balance, meLoading]);

  // Pre-fill from query (?amount=, ?months=) for the "re-stake" flow from history.
  useEffect(() => {
    const amountParam = Number(searchParams.get('amount'));
    const monthsParam = Number(searchParams.get('months'));
    if (Number.isFinite(amountParam) && amountParam > 0) {
      setDeposit(amountParam);
      setSeeded(true);
    }
    if (Number.isFinite(monthsParam) && monthsParam > 0) setDurationMonths(monthsParam);
  }, [searchParams]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [openedSnapshot, setOpenedSnapshot] = useState<{ amount: number; months: number } | null>(
    null
  );
  const [blocked, setBlocked] = useState<'coins' | null>(null);

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

  // The deposit alone decides the band, and it may decide there is none.
  const activeLevel = findLevelForDeposit(levels, deposit);
  const boostPct = activeLevel?.yieldBoostPct ?? 0;
  const freeStartsUsed = me?.freeStakeStartsUsed ?? 0;
  const stakeFee = computeStakeFee(
    deposit,
    durationMonths,
    me?.isLuckyPlayer ?? false,
    freeStartsUsed,
    me?.isVIP ?? false,
    me?.statusPerks,
    stakeCfg.freeStartCount
  );
  const freeStartsRemaining = Math.max(0, stakeCfg.freeStartCount - freeStartsUsed);

  const maxMonths = stakeCfg.durationMaxMonths;
  const apAtMax = computeStakeActivityPoints(deposit, maxMonths, stakeCfg);
  const apNow = computeStakeActivityPoints(deposit, durationMonths, stakeCfg);
  const apDelta = apAtMax - apNow;
  const yieldAt = (months: number) =>
    computeStakeReturnCoins(
      deposit,
      months,
      me?.isLuckyPlayer ?? false,
      me?.isVIP ?? false,
      stakeCfg,
      me?.statusPerks,
      boostPct
    );
  const lcDelta = yieldAt(maxMonths) - yieldAt(durationMonths);
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

  const handleConfirm = async () => {
    if (deposit <= 0 || deposit > balance) return;
    if (notEnoughStars) {
      setErrorMessage(t('not enough stars for fee {n}', { n: stakeFee.fee - starsBalance }));
      return;
    }
    setErrorMessage(null);
    const result = await startStake({
      // Sent for older-server compatibility; the server re-derives it from the
      // amount and ignores this field.
      level: activeLevel?.level ?? 0,
      amount: deposit,
      durationMonths,
    });
    if ('data' in result && result.data?.success) {
      setOpenedSnapshot({ amount: deposit, months: durationMonths });
    } else if ('error' in result) {
      // A shortfall the local check could not see (someone spent elsewhere, or
      // the server prices the fee differently) gets the top-up route; anything
      // else stays as the inline message under the form.
      const failure = spendFailure(result.error, t);
      if (failure.kind === 'message') setErrorMessage(t('failed to start stake try again'));
      else await spend.report(result.error, { required: deposit });
    }
  };

  const handleOpenedClose = () => {
    setOpenedSnapshot(null);
    router.replace(routes.stakes.index);
  };

  return (
    <div className="flex flex-col gap-1 pb-32">
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
            <Image sizes="14px" src={icons.telegramStar} alt="" className="h-3.5 w-auto" />
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
        deposit={deposit}
        balance={balance}
        durationMonths={durationMonths}
        onDepositChange={setDeposit}
        onDurationChange={setDurationMonths}
      />

      {!me?.isLuckyPlayer && deposit >= 100_000 && (
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
        {activeLevel
          ? t('what you will get level {level}', { level: activeLevel.level })
          : t('what you will get')}
      </StakesSectionLabel>
      <StakesRewardsPreviewCard
        levelDef={activeLevel}
        deposit={deposit}
        durationMonths={durationMonths}
      />

      {/* Portalled and fixed rather than sticky inside the scroller: the
          scroller carries `padding-bottom: 2.5rem + inset`, so a sticky child
          pinned at `bottom: 0` still floated that padding above the screen
          edge. The CTA now sits on the edge itself and only the safe-area inset
          lifts the button; `pb-32` on the content above keeps the last card
          from scrolling underneath it. */}
      <ClientPortal>
        <div
          className="from-background via-background pointer-events-none fixed inset-x-0 bottom-0 z-20 mx-auto max-w-[var(--app-max-w)] bg-gradient-to-t via-70% to-transparent px-5 pt-8"
          style={{ paddingBottom: 'calc(0.5rem + var(--tg-inset-bottom))' }}
        >
          <div className="pointer-events-auto">
            {errorMessage && (
              <div className="border-error/40 bg-error/15 text-error-text mb-2 rounded-xl border px-3 py-2 text-center text-[11px] font-bold">
                {errorMessage}
              </div>
            )}
            <NewStakeStickyCta
              level={activeLevel?.level ?? 0}
              amount={deposit}
              balance={balance}
              stakeFee={stakeFee.fee}
              stakeFeeFree={stakeFee.free}
              freeStartsRemaining={freeStartsRemaining}
              hint={ctaHint}
              balanceAfter={Math.max(0, balance - deposit)}
              loading={starting}
              onConfirm={handleConfirm}
              onBlocked={setBlocked}
            />
          </div>
        </div>
      </ClientPortal>

      <StakeLevelsCompareModal
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
        levels={levels}
      />

      <NotEnoughCoinsModal
        open={blocked === 'coins'}
        onClose={() => setBlocked(null)}
        required={deposit}
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

      {spend.modals}
    </div>
  );
}
