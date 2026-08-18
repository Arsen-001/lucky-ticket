'use client';

import '@/styles/components/stakes.css';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Gift } from 'lucide-react';
import { icons } from '@/constants/icons';
import { formatCompact } from '@/utils/global/number.utils';
import { useClaimStakeMutation, useGetStakesQuery } from '@/api/stakes.api';
import { useGetMeQuery } from '@/api/me.api';
import {
  activityTierOrder,
  computeActivityTier,
  computeNextTierReferralGap,
  computeNextTierThreshold,
  GlobalConstants,
} from '@/constants/global.constants';
import { ButtonSpinner } from '@/components/shared/loaders/ButtonSpinner';
import { routes } from '@/constants/routes';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useStakesDisplayConfig } from '@/hooks/useStakesDisplayConfig';
import { useToast } from '@/hooks/useToast';
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
  sortHistoryNewestFirst,
  sortStakesReadyFirst,
  stakeIsMatured,
} from '@/utils/global/stakes.utils';
import { QueryErrorState } from '@/components/shared/error/QueryErrorState';

export function StakesContent() {
  const t = useAppTranslations();
  const toast = useToast();
  const { data: stakes, isLoading, isError, refetch } = useGetStakesQuery();
  const { data: me, isLoading: meLoading } = useGetMeQuery();
  const stakeCfg = useStakesDisplayConfig();
  const [claimStake, { isLoading: claimingAll }] = useClaimStakeMutation();

  if (isError) return <QueryErrorState onRetry={() => refetch()} />;

  const balance = me?.coins ?? 0;
  const activeStakes = stakes ? sortStakesReadyFirst(stakes.activeStakes) : [];
  const history = stakes ? sortHistoryNewestFirst(stakes.history) : [];
  const historyPreview = history.slice(0, 3);
  const hasMoreHistory = history.length > historyPreview.length;
  const totalLocked = activeStakes.reduce((sum, s) => sum + s.lockedAmount, 0);
  const readyCount = activeStakes.filter(stakeIsMatured).length;
  const lifetimeEarned = history
    .filter(h => h.outcome === 'completed')
    .reduce((sum, h) => sum + h.yieldLC, 0);
  const freeStartsRemaining = Math.max(0, stakeCfg.freeStartCount - (me?.freeStakeStartsUsed ?? 0));
  // Both queries have to have LANDED before the waiver is advertised. With
  // `me` still loading, `freeStakeStartsUsed ?? 0` invents a full allowance, so
  // a player who has already spent theirs saw "1 free stake left" flash on
  // every open and then vanish.
  const dataReady = !!stakes && !!me && !isLoading && !meLoading;

  const readyStakeIds = activeStakes.filter(stakeIsMatured).map(s => s.id);

  // Largest active stake by lockedAmount drives the summary-card accent tier.
  const biggest = activeStakes.reduce(
    (top, s) => (!top || s.lockedAmount > top.lockedAmount ? s : top),
    null as (typeof activeStakes)[number] | null
  );
  const topTier = biggest
    ? stakes
      ? findLevelDef(stakes.levels, biggest.level)?.tier
      : undefined
    : undefined;

  const currentAp = me?.activityPoints ?? 0;
  const currentRefs = me?.referralsCount ?? 0;
  const currentTier = computeActivityTier(currentAp, currentRefs);
  const nextThreshold = computeNextTierThreshold(currentAp, currentRefs);
  const currentTierThreshold = GlobalConstants.apTierThresholds[currentTier];
  const nextTierApGap = nextThreshold !== null ? Math.max(0, nextThreshold - currentAp) : undefined;
  // The tier gate has an AP half AND a friends half (DOCS §5.1). With enough AP
  // but too few friends the AP gap is 0 while the tier stays locked, so the bar
  // and the label have to follow whichever half is still blocking.
  const nextTier =
    nextThreshold !== null ? activityTierOrder[activityTierOrder.indexOf(currentTier) + 1] : null;
  const nextTierRefRequired = nextTier ? GlobalConstants.tierReferralRequirements[nextTier] : 0;
  const nextTierRefGap = computeNextTierReferralGap(currentAp, currentRefs);
  const percent = (value: number) => Math.max(0, Math.min(100, Math.round(value)));
  const apProgressPercent =
    nextThreshold !== null && nextThreshold > currentTierThreshold
      ? percent(((currentAp - currentTierThreshold) / (nextThreshold - currentTierThreshold)) * 100)
      : 100;
  const refProgressPercent =
    nextTierRefRequired > 0 ? percent((currentRefs / nextTierRefRequired) * 100) : 100;
  // The two percentages no longer draw anything — the bar they fed is gone with
  // the unpublished AP threshold it measured. They still decide WHICH half the
  // caption names: whichever is furthest from done.
  const apBlocking = (nextTierApGap ?? 0) > 0;
  const refBlocking = nextTierRefGap > 0;
  const tierNeed =
    nextThreshold === null || (!apBlocking && !refBlocking)
      ? null
      : apBlocking && (!refBlocking || apProgressPercent <= refProgressPercent)
        ? { kind: 'ap' as const, amount: nextTierApGap as number }
        : { kind: 'friends' as const, amount: nextTierRefGap };

  const handleClaimAll = async () => {
    let failed = 0;
    let claimed = 0;
    let totalLc = 0;
    for (const id of readyStakeIds) {
      const result = await claimStake({ stakeId: id });
      if ('data' in result && result.data?.success) {
        claimed += 1;
        // Guarded because the sum has to survive an older server that answers
        // with a bare `{ success }`: one missing field turns the whole toast
        // into "+NaN LC" for every stake in the batch.
        totalLc += (result.data.principalReturned ?? 0) + (result.data.yieldLC ?? 0);
      } else {
        failed += 1;
      }
    }
    // Partial success is the normal outcome of a loop of N requests, and it used
    // to render as a flat "action failed" — the player was told nothing worked
    // while their balance had already moved for the ones that did.
    if (claimed > 0)
      toast.success(t('claimed {n} ready stakes', { n: claimed, lc: formatCompact(totalLc) }));
    if (failed > 0) toast.error(t('{n} stakes could not be claimed', { n: failed }));
  };

  return (
    <div className="relative flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div className="text-pink-secondary text-[10px] font-bold uppercase tracking-wider">
          {t('lock LC earn rewards')}
        </div>
        <div className="flex items-center gap-1.5">
          <SkeletonSuspense
            loading={isLoading}
            skeleton={<Skeleton variant="rounded-rectangle" className="h-7 w-14" />}
          >
            <Link
              href={routes.wallet}
              aria-label={t('go to wallet to buy stars')}
              className="hover:bg-back-button-background/80 tap-target relative inline-flex items-center gap-1 rounded-full border border-white/10 bg-back-button-background/60 px-2.5 py-1.5 transition-colors"
            >
              <Image sizes="14px" src={icons.telegramStar} alt="" className="h-3.5 w-auto" />
              <span className="text-gold text-[12px] font-extrabold tabular-nums">
                {formatCompact(me?.telegramStars ?? 0)}
              </span>
            </Link>
          </SkeletonSuspense>
          <StakesWalletPill balance={balance} locked={totalLocked} />
        </div>
      </div>

      <SkeletonSuspense
        loading={isLoading}
        skeleton={<Skeleton className="h-22 w-full rounded-2xl" />}
      >
        <div data-tour="stakes">
          <StakesSummaryCard
            activeCount={activeStakes.length}
            lockedAmount={totalLocked}
            readyCount={readyCount}
            lifetimeEarned={lifetimeEarned}
            topTier={topTier}
            nextTierNeed={tierNeed}
          />
        </div>
      </SkeletonSuspense>

      {readyCount >= 2 && (
        <button
          type="button"
          onClick={handleClaimAll}
          disabled={claimingAll}
          aria-busy={claimingAll || undefined}
          className="bg-success/15 hover:bg-success/20 border-success/40 text-success flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-[13px] font-extrabold uppercase tracking-wider transition-colors disabled:opacity-60"
        >
          {/* One request per stake, in sequence — seconds, not a round trip. */}
          {claimingAll && <ButtonSpinner size={14} />}
          <span>{t('claim all ready')}</span>
          <span className="bg-success/30 rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums">
            {readyCount}
          </span>
        </button>
      )}

      {dataReady && stakes.enabled !== false && freeStartsRemaining > 0 && (
        <Link
          href={routes.stakes.new}
          className="border-bronze/35 bg-bronze/10 hover:bg-bronze/15 flex items-center gap-2.5 rounded-2xl border px-3.5 py-2.5 transition-colors"
        >
          <div className="flex-center border-bronze/40 bg-bronze/20 h-8 w-8 shrink-0 rounded-full border">
            <Gift size={14} className="text-bronze" strokeWidth={2.4} />
          </div>
          <div className="flex-1 leading-tight">
            <div className="flex items-center gap-2">
              <div className="text-[12px] font-extrabold text-white">
                {t('{n} free stakes left', { n: freeStartsRemaining })}
              </div>
              {/* REMAINING out of total — the same reading as the badge on the
                  confirm button. It used to be used-out-of-total here, so the
                  identical-looking chip said "0/1" next to a sentence saying
                  "1 left", and "1/1" one screen over for the same state. */}
              {/* White digits, not `text-bronze`: bronze on the page background
                  measured 3.68:1 at 9px, under the 4.5:1 floor. The bronze
                  identity survives in the chip's fill and the card around it. */}
              <span className="rounded-full border border-bronze/50 bg-bronze/25 px-1.5 py-0.5 text-[9px] font-bold text-white tabular-nums">
                {freeStartsRemaining}/{stakeCfg.freeStartCount}
              </span>
            </div>
            <div className="text-white-secondary mt-0.5 text-[10px]">
              {t('open a stake of any amount without paying the fee')}
            </div>
          </div>
          <ChevronRight size={14} className="text-bronze shrink-0" strokeWidth={2.4} />
        </Link>
      )}

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
                // A bandless stake (level 0) has no levelDef and must still
                // show up — it is locked LC like any other.
                const levelDef = stakes ? findLevelDef(stakes.levels, stake.level) : null;
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
              {historyPreview.map(entry => (
                <StakesHistoryRow key={entry.id} entry={entry} levels={stakes?.levels ?? []} />
              ))}
              {hasMoreHistory && (
                <Link
                  href={routes.stakes.history}
                  className="text-pink-secondary hover:text-white tap-target relative inline-flex items-center justify-center gap-1 self-center rounded-full border border-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-colors"
                >
                  {t('see all')}
                  <ChevronRight size={12} strokeWidth={2.4} />
                </Link>
              )}
            </div>
          )}
        </SkeletonSuspense>
      </div>

      {/* `stakes.enabled === true`, not `!== false`: before the query lands
          `stakes` is undefined and the loose check showed the button even with
          the admin kill switch on, for as long as the request took. */}
      {stakes?.enabled === true && <StakesNewStakeFab />}
    </div>
  );
}
