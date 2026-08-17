'use client';

import '@/styles/components/stakes.css';
import { useState } from 'react';
import { Star } from 'lucide-react';
import { useGetMeQuery } from '@/api/me.api';
import { GlobalConstants } from '@/constants/global.constants';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useStakesDisplayConfig } from '@/hooks/useStakesDisplayConfig';
import { formatCompact, formatNumber } from '@/utils/global/number.utils';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { NewStakeAmountField } from '@/components/pages/out-tabs/drawer/stakes/new/NewStakeAmountField';
import { NewStakeDurationScale } from '@/components/pages/out-tabs/drawer/stakes/new/NewStakeDurationScale';
import { NewStakeLevelPicker } from '@/components/pages/out-tabs/drawer/stakes/new/NewStakeLevelPicker';
import {
  StakesLevelChip,
  stakeAccent,
} from '@/components/pages/out-tabs/drawer/stakes/StakesLevelChip';
import {
  computeStakeAprPercent,
  computeStakeEffectiveAprPercent,
  computeStakeReturnCoins,
  findNextLevelOver,
  formatStakeRatePercent,
} from '@/utils/global/stakes.utils';
import type { StakeLevelDefinition } from '@/types/interfaces/stakes.interfaces';

export interface NewStakeHeroProps {
  levels: StakeLevelDefinition[];
  /** The band the deposit falls in — `null` when it clears none. */
  activeLevel: StakeLevelDefinition | null;
  deposit: number;
  balance: number;
  durationMonths: number;
  onDepositChange: (value: number) => void;
  onDurationChange: (months: number) => void;
}

export function NewStakeHero({
  levels,
  activeLevel,
  deposit,
  balance,
  durationMonths,
  onDepositChange,
  onDurationChange,
}: NewStakeHeroProps) {
  const t = useAppTranslations();
  const { data: me } = useGetMeQuery();
  const stakeKnobs = useStakesDisplayConfig();
  const [depositTooltip, setDepositTooltip] = useState(false);

  const next = findNextLevelOver(levels, deposit);
  // The balance is the only ceiling left. There used to be a second one — the
  // cheapest band the player's AP tier had not reached — which stopped the
  // thumb mid-track and needed a lock icon and a notice to explain itself.
  // Bands gate nobody now, so the track simply runs to what the player holds.
  const sliderMax = Math.max(1, balance);
  const clampedDeposit = Math.min(Math.max(deposit, 0), sliderMax);
  const sliderProgress = (clampedDeposit / sliderMax) * 100;

  const clampedDuration = Math.min(
    Math.max(durationMonths, stakeKnobs.durationMinMonths),
    stakeKnobs.durationMaxMonths
  );
  const boostPct = activeLevel?.yieldBoostPct ?? 0;
  const baseAprPercent = computeStakeAprPercent(clampedDuration, stakeKnobs);
  const aprPercent = computeStakeEffectiveAprPercent(clampedDuration, boostPct, stakeKnobs);
  // Same status flags the rewards preview below uses — computing the yield
  // without them made this card quote a different number for the same stake.
  const aprReturn = computeStakeReturnCoins(
    clampedDeposit,
    clampedDuration,
    me?.isLuckyPlayer ?? false,
    me?.isVIP ?? false,
    stakeKnobs,
    me?.statusPerks,
    boostPct
  );

  return (
    <div
      className="stake-card-shell stake-card-border px-5 py-5"
      style={{ ['--stake-card-accent' as string]: stakeAccent(activeLevel) }}
    >
      <div className="relative text-center">
        {/* Not a refusal — a statement. A bandless stake is real, it just earns
            the plain duration rate, and the chip is where that gets said before
            the player commits. */}
        <StakesLevelChip
          level={activeLevel?.level ?? 0}
          tier={activeLevel?.tier ?? null}
          size="lg"
        />
        <div className="mt-3.5">
          <div className="text-pink-secondary text-[10px] font-bold uppercase tracking-widest">
            {t('you will lock')}
          </div>
          <div className="mt-1 flex items-center justify-center gap-1.5">
            <NewStakeAmountField value={deposit} max={balance} onChange={onDepositChange} />
            <LcLabel size={20} />
          </div>
          <div className="text-white-secondary mt-1 text-[11px]">
            {t('of {amount} {coin} available', {
              amount: formatNumber(balance),
              coin: GlobalConstants.coinName,
            })}
          </div>
        </div>

        {/* Always honest now: every band is reachable, so "add N more" can no
            longer point at something the player is not allowed to have. */}
        {next && (
          <div className="border-electric-purple/30 bg-electric-purple/15 text-electric-purple mt-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-bold tracking-wide">
            {t('+{amount} {coin} for level {level} and +{boost}% apr', {
              amount: formatNumber(Math.max(0, next.minDeposit - deposit)),
              coin: GlobalConstants.coinName,
              level: next.level,
              boost: formatStakeRatePercent(next.yieldBoostPct),
            })}
          </div>
        )}

        <div className="relative mt-4">
          {depositTooltip && (
            <div
              className="border-electric-pink/40 bg-background pointer-events-none absolute -top-7 -translate-x-1/2 rounded-md border px-2 py-0.5 text-[10px] font-extrabold text-white shadow-lg tabular-nums"
              // Follows the thumb from the same edge the track fills from. A
              // native range input mirrors itself under `direction: rtl`, so a
              // physical `left` left the bubble on the opposite side of the
              // handle in Arabic and Persian.
              style={{ insetInlineStart: `${sliderProgress}%` }}
            >
              {formatCompact(clampedDeposit)}
            </div>
          )}
          <input
            type="range"
            min={0}
            max={sliderMax}
            step={1}
            value={clampedDeposit}
            onChange={e => onDepositChange(Number(e.target.value))}
            onPointerDown={() => setDepositTooltip(true)}
            onPointerUp={() => setDepositTooltip(false)}
            onPointerLeave={() => setDepositTooltip(false)}
            aria-label={t('you will lock')}
            className="stakes-slider w-full"
            style={{
              background: `linear-gradient(90deg, var(--color-electric-pink) 0%, var(--color-electric-purple) ${sliderProgress}%, rgba(255,255,255,0.08) ${sliderProgress}%)`,
            }}
          />
        </div>

        <div className="mt-2 flex gap-1.5">
          {[
            { label: '25%', value: Math.floor(balance * 0.25) },
            { label: '50%', value: Math.floor(balance * 0.5) },
            { label: t('max'), value: balance },
          ].map(preset => (
            <button
              key={preset.label}
              type="button"
              onClick={() => onDepositChange(preset.value)}
              className="border-electric-pink/25 bg-electric-pink/10 text-electric-pink hover:bg-electric-pink/15 tap-target relative flex-1 rounded-full border px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>

        <NewStakeLevelPicker
          levels={levels}
          balance={balance}
          activeLevel={activeLevel?.level ?? 0}
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
        <NewStakeDurationScale
          months={clampedDuration}
          knobs={stakeKnobs}
          onChange={onDurationChange}
          className="mt-1"
        />

        <div className="border-gold/30 bg-gold/10 mt-4 flex items-center justify-between rounded-xl border px-3 py-2.5">
          <div className="flex min-w-0 items-center gap-2 text-start">
            <div className="flex-center border-gold/40 bg-gold/20 h-7 w-7 rounded-full border">
              <Star size={12} className="text-gold" fill="currentColor" strokeWidth={0} />
            </div>
            <div className="leading-tight">
              {/* NOT "annual return". `computeStakeReturnCoins` pays
                  `deposit × rate / 100` flat, with no per-year scaling — the
                  rate is the yield for the WHOLE lock (`aprMinPercent` at the
                  shortest duration, `aprMaxPercent` at the longest). Calling a
                  1-month 3% stake "3% годовых" understates it by ~12×, in the
                  one place on the screen where the player reads a price. */}
              <div className="text-pink-secondary text-[9px] font-bold uppercase tracking-wider">
                {t('yield for the whole term')}
              </div>
              {/* The band's contribution is spelled out rather than folded into
                  one number — a rate that silently includes a boost gives the
                  player no reason to reach for the next band. */}
              <div className="text-gold text-[10px] font-semibold">
                {boostPct > 0
                  ? t('{base}% + {boost}% for level {level}', {
                      base: formatStakeRatePercent(baseAprPercent),
                      boost: formatStakeRatePercent(boostPct),
                      level: activeLevel?.level ?? 0,
                    })
                  : t('rate range {min}–{max}% by term', {
                      min: stakeKnobs.aprMinPercent,
                      max: stakeKnobs.aprMaxPercent,
                    })}
              </div>
            </div>
          </div>
          <div className="shrink-0 text-end leading-tight">
            <div className="text-gold text-[15px] font-extrabold tabular-nums">
              {formatStakeRatePercent(aprPercent)}%
            </div>
            <div className="text-white-secondary whitespace-nowrap text-[10px] font-semibold tabular-nums">
              {t('+{amount} {coin} back', {
                amount: formatNumber(aprReturn),
                coin: GlobalConstants.coinName,
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
