'use client';

import '@/styles/components/stakes.css';
import { Star } from 'lucide-react';
import { GlobalConstants } from '@/constants/global.constants';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { GoldenText } from '@/components/shared/typography/GoldenText';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { NewStakeLevelPicker } from '@/components/pages/out-tabs/drawer/stakes/new/NewStakeLevelPicker';
import { StakesLevelChip } from '@/components/pages/out-tabs/drawer/stakes/StakesLevelChip';
import {
  computeStakeAprPercent,
  computeStakeReturnCoins,
  findNextLevelOver,
} from '@/utils/global/stakes.utils';
import type { StakeLevelDefinition } from '@/types/interfaces/stakes.interfaces';

const DURATION_MIN = GlobalConstants.stakeDurationMinMonths;
const DURATION_MAX = GlobalConstants.stakeDurationMaxMonths;

export interface NewStakeHeroProps {
  levels: StakeLevelDefinition[];
  activeLevel: StakeLevelDefinition;
  deposit: number;
  balance: number;
  sliderMin: number;
  sliderMax: number;
  durationMonths: number;
  onDepositChange: (value: number) => void;
  onDurationChange: (months: number) => void;
}

export function NewStakeHero({
  levels,
  activeLevel,
  deposit,
  balance,
  sliderMin,
  sliderMax,
  durationMonths,
  onDepositChange,
  onDurationChange,
}: NewStakeHeroProps) {
  const t = useAppTranslations();
  const next = findNextLevelOver(levels, deposit);
  const clampedDeposit = Math.min(Math.max(deposit, sliderMin), sliderMax);
  const sliderRange = Math.max(1, sliderMax - sliderMin);
  const sliderProgress = ((clampedDeposit - sliderMin) / sliderRange) * 100;
  const clampedDuration = Math.min(Math.max(durationMonths, DURATION_MIN), DURATION_MAX);
  const durationProgress = ((clampedDuration - DURATION_MIN) / (DURATION_MAX - DURATION_MIN)) * 100;
  const aprPercent = computeStakeAprPercent(clampedDuration);
  const aprReturn = computeStakeReturnCoins(clampedDeposit, clampedDuration);
  const aprLabel = aprPercent.toFixed(aprPercent % 1 === 0 ? 0 : 1);

  return (
    <div
      className="stake-card-shell stake-card-border px-5 py-5"
      style={{ ['--stake-card-accent' as string]: `var(--color-${activeLevel.tier})` }}
    >
      <div className="relative text-center">
        <StakesLevelChip level={activeLevel.level} tier={activeLevel.tier} size="lg" />
        <div className="mt-3.5">
          <div className="text-pink-secondary text-[10px] font-bold uppercase tracking-widest">
            {t('you will lock')}
          </div>
          <div className="mt-1 flex items-baseline justify-center gap-1.5">
            <GoldenText className="text-[38px] font-extrabold leading-none tabular-nums tracking-tight">
              {deposit.toLocaleString()}
            </GoldenText>
            <LcLabel size={20} />
          </div>
          <div className="text-white-secondary mt-1 text-[11px]">
            {t('of {amount} {coin} available', {
              amount: balance.toLocaleString(),
              coin: GlobalConstants.coinName,
            })}
          </div>
        </div>

        {next && (
          <div className="border-electric-purple/30 bg-electric-purple/15 text-electric-purple mt-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-bold tracking-wide">
            <Star size={11} fill="currentColor" strokeWidth={0} />
            {t('+{amount} {coin} for level {level}', {
              amount: (next.minDeposit - deposit).toLocaleString(),
              coin: GlobalConstants.coinName,
              level: next.level,
            })}
          </div>
        )}

        <input
          type="range"
          min={sliderMin}
          max={sliderMax}
          step={1}
          value={clampedDeposit}
          onChange={e => onDepositChange(Number(e.target.value))}
          className="stakes-slider mt-4 w-full"
          style={{
            background: `linear-gradient(90deg, var(--color-electric-pink) 0%, var(--color-electric-purple) ${sliderProgress}%, rgba(255,255,255,0.08) ${sliderProgress}%)`,
          }}
        />

        <NewStakeLevelPicker
          levels={levels}
          balance={balance}
          activeLevel={activeLevel.level}
          onSelect={onDepositChange}
          className="mt-4"
        />

        <div className="mt-5 flex items-center justify-between">
          <span className="text-pink-secondary text-[10px] font-bold uppercase tracking-widest">
            {t('pick duration')}
          </span>
          <span className="text-gold text-[11px] font-extrabold tabular-nums">
            {t('{n} months', { n: clampedDuration })}
          </span>
        </div>
        <input
          type="range"
          min={DURATION_MIN}
          max={DURATION_MAX}
          step={1}
          value={clampedDuration}
          onChange={e => onDurationChange(Number(e.target.value))}
          aria-label={t('pick duration')}
          className="stakes-slider mt-2 w-full"
          style={{
            background: `linear-gradient(90deg, var(--color-electric-pink) 0%, var(--color-electric-purple) ${durationProgress}%, rgba(255,255,255,0.08) ${durationProgress}%)`,
          }}
        />

        <div className="border-gold/30 bg-gold/10 mt-4 flex items-center justify-between rounded-xl border px-3 py-2.5">
          <div className="flex items-center gap-2 text-left">
            <div className="flex-center border-gold/40 bg-gold/20 h-7 w-7 rounded-full border">
              <Star size={12} className="text-gold" fill="currentColor" strokeWidth={0} />
            </div>
            <div className="leading-tight">
              <div className="text-pink-secondary text-[9px] font-bold uppercase tracking-wider">
                {t('annual return')}
              </div>
              <div className="text-gold text-[10px] font-semibold">
                {t('apr range {min}–{max}%', {
                  min: GlobalConstants.stakeAprMinPercent,
                  max: GlobalConstants.stakeAprMaxPercent,
                })}
              </div>
            </div>
          </div>
          <div className="text-right leading-tight">
            <div className="text-gold text-[15px] font-extrabold tabular-nums">{aprLabel}%</div>
            <div className="text-white-secondary text-[10px] font-semibold tabular-nums">
              {t('+{amount} {coin} back', {
                amount: aprReturn.toLocaleString(),
                coin: GlobalConstants.coinName,
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
