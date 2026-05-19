'use client';

import '@/styles/components/stakes.css';
import { ChevronRight, Clock } from 'lucide-react';
import Link from 'next/link';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { routes } from '@/constants/routes';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useCountDown } from '@/hooks/useCountDown';
import { computeStakeProgress, isStakeReady } from '@/utils/global/stakes.utils';
import { StakesLevelChip } from '@/components/pages/out-tabs/drawer/stakes/StakesLevelChip';
import { StakesTicketStack } from '@/components/pages/out-tabs/drawer/stakes/StakesTicketStack';
import type { ActiveStake, StakeLevelDefinition } from '@/types/interfaces/stakes.interfaces';
import { twMerge } from 'tailwind-merge';

export interface StakesActiveStakeCardProps {
  stake: ActiveStake;
  levelDef: StakeLevelDefinition;
}

export function StakesActiveStakeCard({ stake, levelDef }: StakesActiveStakeCardProps) {
  const t = useAppTranslations();
  const countdown = useCountDown(stake.endDate);
  const ready = countdown.expired || isStakeReady(stake.endDate);
  const progress = computeStakeProgress(stake.startDate, stake.endDate);

  return (
    <Link
      href={ready ? routes.stakes.getReadyById(stake.id) : routes.stakes.getById(stake.id)}
      className={twMerge(
        'stake-card-shell stake-card-border relative block p-3 text-left transition-transform duration-200',
        ready && '-translate-y-0.5'
      )}
    >
      <div className="relative">
        <div className="flex min-h-[22px] items-start justify-between">
          <StakesLevelChip level={levelDef.level} tier={levelDef.guaranteedTicket} />
          {ready && (
            <span className="rounded-full bg-success/90 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white shadow-[0_0_12px_rgba(74,222,128,0.6)]">
              {t('ready')}
            </span>
          )}
        </div>

        <div className="relative mt-2.5 flex h-14 items-center justify-center overflow-hidden rounded-xl">
          <StakesTicketStack tiers={levelDef.allTickets} size={42} />
        </div>

        <div className="mt-2.5">
          <div className="text-pink-secondary text-[9px] font-bold uppercase tracking-wider">
            {t('locked')}
          </div>
          <div className="mt-0.5 flex items-baseline gap-1">
            <LcLabel size={22} className="self-center" />
            <span className="text-gold text-[18px] font-extrabold leading-none tabular-nums">
              {stake.lockedAmount.toLocaleString()}
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
                {countdown.leftTime}
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

        {!ready && (
          <div className="bg-background-overlay/60 mt-2 h-0.5 overflow-hidden rounded-full">
            <div
              className="bg-pink-gradient h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </Link>
  );
}
