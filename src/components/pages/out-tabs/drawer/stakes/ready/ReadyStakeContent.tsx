'use client';

import '@/styles/components/stakes.css';
import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowDownToLine, Sparkles } from 'lucide-react';
import { BoltIcon } from '@/components/shared/icons/BoltIcon';
import { icons } from '@/constants/icons';
import { useClaimStakeMutation, useGetStakesQuery } from '@/api/stakes.api';
import { useGetMeQuery } from '@/api/me.api';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { GoldenText } from '@/components/shared/typography/GoldenText';
import { routes } from '@/constants/routes';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useStakesDisplayConfig } from '@/hooks/useStakesDisplayConfig';
import { useToast } from '@/hooks/useToast';
import { formatCompact } from '@/utils/global/number.utils';
import {
  computeStakeEffectiveAprPercent,
  computeStakeCompletionBonusAp,
  computeStakeCompletionStars,
  computeStakeMonths,
  computeStakeReturnCoins,
  findLevelDef,
  isStakeReady,
} from '@/utils/global/stakes.utils';
import { StakesClaimSuccessModal } from '@/components/pages/out-tabs/drawer/stakes/StakesClaimSuccessModal';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { Button } from '@/components/shared/buttons/Button';
import { QueryErrorState } from '@/components/shared/error/QueryErrorState';
import { staggerMs } from '@/utils/global/animation.utils';

interface PrizeCardProps {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  accentClass: string;
  delayMs?: number;
}

function PrizeCard({ icon, label, value, accentClass, delayMs = 0 }: PrizeCardProps) {
  return (
    <div
      className={`animate-fade-in animate-slide-in-bottom flex flex-col items-center gap-2 rounded-2xl border p-3.5 text-center ${accentClass}`}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <div className="flex-center h-13 w-13 rounded-full bg-black/25">{icon}</div>
      <div className="text-pink-secondary text-[9px] font-bold uppercase tracking-wider">
        {label}
      </div>
      <div className="text-center leading-none">{value}</div>
    </div>
  );
}

export interface ReadyStakeContentProps {
  stakeId: string;
}

export function ReadyStakeContent({ stakeId }: ReadyStakeContentProps) {
  const t = useAppTranslations();
  const toast = useToast();
  const router = useRouter();
  const { data: stakes, isLoading, isError, refetch } = useGetStakesQuery();
  const { data: me } = useGetMeQuery();
  const stakeKnobs = useStakesDisplayConfig();
  const [claimStake, { isLoading: claiming }] = useClaimStakeMutation();

  const stake = stakes?.activeStakes.find(s => s.id === stakeId);
  // A bandless stake still matures and still pays its principal + APR, so the
  // claim screen must open for it; only a missing stake is "not found".
  const levelDef = stake && stakes ? findLevelDef(stakes.levels, stake.level) : null;
  const ready = stake ? isStakeReady(stake.endDate) : false;

  const [claimedSnapshot, setClaimedSnapshot] = useState<{
    amount: number;
    stars: number;
    ap: number;
  } | null>(null);

  useEffect(() => {
    if (claimedSnapshot !== null) return;
    if (!isLoading && stake && !ready) {
      router.replace(routes.stakes.getById(stake.id));
    }
  }, [isLoading, stake, ready, router, claimedSnapshot]);

  if (claimedSnapshot !== null) {
    return (
      <StakesClaimSuccessModal
        open
        onClose={() => {
          setClaimedSnapshot(null);
          router.replace(routes.stakes.index);
        }}
        amount={claimedSnapshot.amount}
        stars={claimedSnapshot.stars}
        ap={claimedSnapshot.ap}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-24 rounded-2xl" />
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

  const months = computeStakeMonths(stake.startDate, stake.endDate);
  const yieldLC = computeStakeReturnCoins(
    stake.lockedAmount,
    months,
    me?.isLuckyPlayer ?? false,
    me?.isVIP ?? false,
    stakeKnobs,
    me?.statusPerks,
    levelDef?.yieldBoostPct ?? 0
  );
  const ratePercent = computeStakeEffectiveAprPercent(
    months,
    levelDef?.yieldBoostPct ?? 0,
    stakeKnobs
  );
  const rateLabel = ratePercent.toFixed(ratePercent % 1 === 0 ? 0 : 1);
  const bonusAp = computeStakeCompletionBonusAp(stake.lockedAmount, months, stakeKnobs);
  const completionStars = computeStakeCompletionStars(months, levelDef);

  const handleClaim = async () => {
    const result = await claimStake({ stakeId: stake.id });
    if ('data' in result && result.data?.success) {
      // Show the amounts the backend actually credited, not the client projection.
      const r = result.data;
      setClaimedSnapshot({
        amount: r.principalReturned + r.yieldLC,
        stars: r.completionStars,
        ap: r.apBonus,
      });
    } else {
      // e.g. "Stake has not matured yet" (400) — never fail silently.
      toast.error(t('action failed'));
    }
  };

  // List of prizes — easy to add more entries later; the grid auto-wraps.
  const prizes: Omit<PrizeCardProps, 'delayMs'>[] = [
    {
      icon: <ArrowDownToLine size={26} className="text-white/80" />,
      label: t('principal returned'),
      accentClass: 'border-white/15 bg-white/[0.04]',
      value: (
        <span className="text-gold inline-flex items-center gap-1 text-[16px] font-extrabold tabular-nums">
          {formatCompact(stake.lockedAmount)}
          <LcLabel size={14} />
        </span>
      ),
    },
    {
      icon: <LcLabel size={28} />,
      label: t('apr yield'),
      accentClass: 'border-success/40 bg-success/10',
      value: (
        <div className="flex flex-col items-center gap-1">
          <span className="text-success inline-flex items-center gap-1 text-[16px] font-extrabold tabular-nums">
            +{formatCompact(yieldLC)}
            <LcLabel size={14} />
          </span>
          <span className="text-white-secondary text-[9px] font-semibold">
            {t('rate {rate}% for {n} months', { rate: rateLabel, n: months })}
          </span>
        </div>
      ),
    },
    {
      icon: <BoltIcon size={26} className="text-teal" />,
      label: t('ap completion bonus'),
      accentClass: 'border-teal/40 bg-teal/10',
      value: (
        <span className="text-teal inline-flex items-center gap-1 text-[18px] font-extrabold tabular-nums">
          +{bonusAp}
          <BoltIcon size={14} />
        </span>
      ),
    },
    {
      icon: <Image src={icons.telegramStar} alt="" className="h-7 w-auto" />,
      label: t('stars on completion'),
      accentClass: 'border-gold/40 bg-gold/10',
      value: (
        <span className="text-gold inline-flex items-center gap-1 text-[18px] font-extrabold tabular-nums">
          +{completionStars}
          <Image src={icons.telegramStar} alt="" className="h-3.5 w-auto" />
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5 pb-4">
      <div
        className="animate-fade-in relative overflow-hidden rounded-3xl border border-success/30 px-5 py-7 text-center"
        style={{
          background:
            'radial-gradient(circle at 50% 0%, rgba(74,222,128,0.25) 0%, transparent 55%),' +
            'linear-gradient(180deg, #1F2A28 0%, #151F35 100%)',
        }}
      >
        <div className="pointer-events-none absolute -top-4 left-1/2 -translate-x-1/2">
          <Sparkles size={56} className="text-success/30" strokeWidth={1.5} />
        </div>
        <div className="relative">
          <div className="border-success/35 bg-success/15 text-success inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest">
            <span className="bg-success h-1.5 w-1.5 rounded-full shadow-[0_0_8px_var(--color-success)]" />
            {t('stake complete')}
          </div>
          <h2 className="mt-4 text-[14px] font-bold uppercase tracking-widest text-white/70">
            {t('you earned')}
          </h2>
          <div className="mt-2 flex items-center justify-center gap-2">
            <GoldenText className="text-[32px] font-extrabold leading-none tabular-nums tracking-tight">
              +{formatCompact(yieldLC)}
            </GoldenText>
            <LcLabel size={30} />
          </div>
        </div>
      </div>

      <div>
        <div className="text-pink-secondary mb-2 text-[11px] font-bold uppercase tracking-wider">
          {t('your prizes')}
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {prizes.map((prize, i) => (
            <PrizeCard key={i} {...prize} delayMs={staggerMs(i, 80)} />
          ))}
        </div>
      </div>

      <div className="to-background sticky bottom-0 -mx-5 mt-2 bg-gradient-to-b from-transparent px-5 pb-2 pt-6">
        <Button
          type="button"
          onClick={handleClaim}
          disabled={claiming}
          className="border-success/30 flex w-full items-center justify-center rounded-2xl border px-5 py-4 text-[13px] font-extrabold uppercase tracking-wider text-white shadow-[0_3px_9px_rgba(74,222,128,0.15),inset_0_1px_0_rgba(255,255,255,0.08)] disabled:opacity-60"
          style={{
            background:
              'radial-gradient(circle at 50% 0%, rgba(74,222,128,0.25) 0%, transparent 55%),' +
              'linear-gradient(180deg, #1F2A28 0%, #151F35 100%)',
          }}
        >
          {t('claim')}
        </Button>
      </div>
    </div>
  );
}
