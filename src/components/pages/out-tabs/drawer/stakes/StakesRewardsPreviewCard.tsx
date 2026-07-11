'use client';

import '@/styles/components/stakes.css';
import Image from 'next/image';
import { ArrowDownToLine, TrendingUp } from 'lucide-react';
import { icons } from '@/constants/icons';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { BoltIcon } from '@/components/shared/icons/BoltIcon';
import { useGetMeQuery } from '@/api/me.api';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useStakesDisplayConfig } from '@/hooks/useStakesDisplayConfig';
import {
  computeStakeBaseAp,
  computeStakeCompletionBonusAp,
  computeStakeCompletionStars,
  computeStakeAprPercent,
  computeStakeReturnCoins,
} from '@/utils/global/stakes.utils';
import type { StakeLevelDefinition } from '@/types/interfaces/stakes.interfaces';

export interface StakesRewardsPreviewCardProps {
  levelDef: StakeLevelDefinition;
  deposit: number;
  durationMonths: number;
}

export function StakesRewardsPreviewCard({
  levelDef,
  deposit,
  durationMonths,
}: StakesRewardsPreviewCardProps) {
  const t = useAppTranslations();
  const { data: me } = useGetMeQuery();
  const stakeKnobs = useStakesDisplayConfig();
  const ratePercent = computeStakeAprPercent(durationMonths, stakeKnobs);
  const yieldLC = computeStakeReturnCoins(
    deposit,
    durationMonths,
    me?.isLuckyPlayer ?? false,
    me?.isVIP ?? false,
    stakeKnobs
  );
  const stakeBaseAp = computeStakeBaseAp(deposit, durationMonths, stakeKnobs);
  const stakeBonusAp = computeStakeCompletionBonusAp(deposit, durationMonths, stakeKnobs);
  const completionStars = computeStakeCompletionStars(durationMonths, levelDef);
  const rateLabel = ratePercent.toFixed(ratePercent % 1 === 0 ? 0 : 1);

  return (
    <div
      className="stake-card-shell stake-card-border p-3.5"
      style={{ ['--stake-card-accent' as string]: `var(--color-${levelDef.tier})` }}
    >
      <div className="relative flex flex-col gap-2">
        <div className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-black/30 px-3 py-2.5">
          <div className="flex-center h-7 w-7 shrink-0 rounded-lg border border-white/15 bg-white/5 text-white/70">
            <ArrowDownToLine size={14} />
          </div>
          <span className="text-white-secondary flex-1 text-[11px] font-semibold">
            {t('principal returned')}
          </span>
          <span className="text-gold inline-flex items-center gap-1 text-[12px] font-extrabold tabular-nums">
            {deposit.toLocaleString()}
            <LcLabel size={12} />
          </span>
        </div>

        <div className="border-success/25 bg-success/8 flex items-center gap-2.5 rounded-xl border px-3 py-2.5">
          <div className="flex-center border-success/40 bg-success/15 text-success h-7 w-7 shrink-0 rounded-lg border">
            <TrendingUp size={14} />
          </div>
          <div className="flex-1 leading-tight">
            <div className="text-[11px] font-bold text-white">{t('apr yield')}</div>
            <div className="text-white-secondary text-[10px]">
              {t('rate {rate}% for {n} months', { rate: rateLabel, n: durationMonths })}
            </div>
          </div>
          <span className="text-success inline-flex items-center gap-1 text-[13px] font-extrabold tabular-nums">
            +{yieldLC.toLocaleString()}
            <LcLabel size={12} />
          </span>
        </div>

        <div className="border-teal/25 bg-teal/8 flex items-center gap-2.5 rounded-xl border px-3 py-2.5">
          <div className="flex-center border-teal/40 bg-teal/15 h-7 w-7 shrink-0 rounded-lg border">
            <BoltIcon size={14} />
          </div>
          <div className="flex-1 leading-tight">
            <div className="text-[11px] font-bold text-white">{t('activity points')}</div>
            <div className="text-white-secondary text-[10px]">
              {t('plus {n} ap on completion', { n: stakeBonusAp })}
            </div>
          </div>
          <span className="text-teal inline-flex flex-col items-end gap-0 text-[11px] font-extrabold leading-tight tabular-nums">
            <span>{t('plus {n} ap', { n: stakeBaseAp })}</span>
            <span className="text-white-secondary text-[9px] font-semibold">{t('at start')}</span>
          </span>
        </div>

        <div className="border-gold/25 bg-gold/5 flex items-center gap-2.5 rounded-xl border px-3 py-2.5">
          <div className="flex-center border-gold/35 bg-gold/15 h-7 w-7 shrink-0 rounded-full border">
            <Image src={icons.telegramStar} alt="" className="h-4 w-auto" />
          </div>
          <div className="flex-1 leading-tight">
            <div className="text-[11px] font-bold text-white">{t('stars on completion')}</div>
            <div className="text-white-secondary text-[10px]">{t('on stake completion')}</div>
          </div>
          <span className="text-gold inline-flex items-center gap-1 text-[13px] font-extrabold tabular-nums">
            +{completionStars}
            <Image src={icons.telegramStar} alt="" className="h-3 w-auto" />
          </span>
        </div>
      </div>
    </div>
  );
}
