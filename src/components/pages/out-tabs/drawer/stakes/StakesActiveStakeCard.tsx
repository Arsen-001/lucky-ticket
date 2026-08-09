'use client';

import '@/styles/components/stakes.css';
import Image from 'next/image';
import { ChevronRight, Clock } from 'lucide-react';
import Link from 'next/link';
import { useGetMeQuery } from '@/api/me.api';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { BoltIcon } from '@/components/shared/icons/BoltIcon';
import { icons } from '@/constants/icons';
import { routes } from '@/constants/routes';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useStakesDisplayConfig } from '@/hooks/useStakesDisplayConfig';
import { useCountDown } from '@/hooks/useCountDown';
import { formatCompact } from '@/utils/global/number.utils';
import {
  computeStakeCompletionBonusAp,
  computeStakeCompletionStars,
  computeStakeMonths,
  computeStakeReturnCoins,
  isStakeReady,
} from '@/utils/global/stakes.utils';
import { StakesLevelChip } from '@/components/pages/out-tabs/drawer/stakes/StakesLevelChip';
import type { ActiveStake, StakeLevelDefinition } from '@/types/interfaces/stakes.interfaces';
import { twMerge } from 'tailwind-merge';

export interface StakesActiveStakeCardProps {
  stake: ActiveStake;
  levelDef: StakeLevelDefinition;
}

export function StakesActiveStakeCard({ stake, levelDef }: StakesActiveStakeCardProps) {
  const t = useAppTranslations();
  const { data: me } = useGetMeQuery();
  const stakeKnobs = useStakesDisplayConfig();
  const countdown = useCountDown(stake.endDate);
  const ready = countdown.expired || isStakeReady(stake.endDate);
  const months = computeStakeMonths(stake.startDate, stake.endDate);
  const yieldLC = computeStakeReturnCoins(
    stake.lockedAmount,
    months,
    me?.isLuckyPlayer ?? false,
    me?.isVIP ?? false,
    stakeKnobs,
    me?.statusPerks
  );
  const stakeBonusAp = computeStakeCompletionBonusAp(stake.lockedAmount, months, stakeKnobs);
  const completionStars = computeStakeCompletionStars(months, levelDef);

  return (
    <Link
      href={ready ? routes.stakes.getReadyById(stake.id) : routes.stakes.getById(stake.id)}
      className={twMerge(
        'stake-card-shell stake-card-border relative block p-3 text-left transition-transform duration-200',
        ready && 'stakes-ready-glow -translate-y-0.5'
      )}
      style={{ ['--stake-card-accent' as string]: `var(--color-${levelDef.tier})` }}
    >
      <div className="relative">
        <div className="flex min-h-[22px] items-start justify-between">
          <StakesLevelChip level={levelDef.level} tier={levelDef.tier} />
          {ready && (
            <span className="rounded-full bg-success/90 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white shadow-[0_0_12px_rgba(74,222,128,0.6)]">
              {t('ready')}
            </span>
          )}
        </div>

        <div className="relative mt-2.5 flex h-14 flex-col items-center justify-center gap-0.5 overflow-hidden rounded-xl bg-black/20">
          <span className="text-pink-secondary text-[9px] font-bold uppercase tracking-wider">
            {t('yield')}
          </span>
          <span className="text-success inline-flex items-center gap-1 text-[16px] font-extrabold leading-none tabular-nums">
            +{formatCompact(yieldLC)}
            <LcLabel size={15} />
          </span>
        </div>

        <div className="mt-2.5">
          <div className="text-pink-secondary text-[9px] font-bold uppercase tracking-wider">
            {t('locked')}
          </div>
          <div className="mt-0.5 flex items-center gap-1">
            <LcLabel size={22} />
            <span className="text-gold text-[18px] font-extrabold leading-none tabular-nums">
              {formatCompact(stake.lockedAmount)}
            </span>
          </div>
        </div>

        <div className="mt-2.5">
          <div className="text-pink-secondary text-[9px] font-bold uppercase tracking-wider">
            {t('ap completion bonus')}
          </div>
          <div className="mt-0.5 flex items-center gap-1">
            <BoltIcon size={16} className="text-teal" />
            <span className="text-teal text-[15px] font-extrabold leading-none tabular-nums">
              +{stakeBonusAp}
            </span>
          </div>
        </div>

        <div className="mt-2.5">
          <div className="text-pink-secondary text-[9px] font-bold uppercase tracking-wider">
            {t('stars on completion')}
          </div>
          <div className="mt-0.5 flex items-center gap-1">
            <Image src={icons.telegramStar} alt="" className="h-4 w-auto" />
            <span className="text-gold text-[15px] font-extrabold leading-none tabular-nums">
              +{completionStars}
            </span>
          </div>
        </div>

        <div
          className={twMerge(
            'relative mt-3 flex items-center justify-center gap-1.5 rounded-lg border px-2.5 py-2',
            ready ? 'border-success/40 bg-success/15' : 'border-white/5 bg-black/30'
          )}
        >
          <span
            className={twMerge(
              'inline-flex items-center gap-1.5 text-[11px] font-extrabold tabular-nums',
              ready ? 'text-success uppercase tracking-wider' : 'text-white-secondary'
            )}
          >
            {ready ? (
              <>{t('claim now')}</>
            ) : (
              <>
                <Clock size={11} className="text-pink-secondary" strokeWidth={2.4} />
                {countdown.leftTimeShort}
              </>
            )}
          </span>
          <ChevronRight
            size={12}
            strokeWidth={2.4}
            className={twMerge(
              'absolute right-2.5 top-1/2 -translate-y-1/2',
              ready ? 'text-success' : 'text-pink-secondary'
            )}
          />
        </div>
      </div>
    </Link>
  );
}
