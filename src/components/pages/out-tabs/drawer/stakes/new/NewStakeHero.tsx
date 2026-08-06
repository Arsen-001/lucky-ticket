'use client';

import '@/styles/components/stakes.css';
import { useState } from 'react';
import { Lock, Star } from 'lucide-react';
import { useGetMeQuery } from '@/api/me.api';
import { GlobalConstants } from '@/constants/global.constants';
import { tierNameId } from '@/constants/tier-names';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useStakesDisplayConfig } from '@/hooks/useStakesDisplayConfig';
import { formatCompact } from '@/utils/global/number.utils';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { NewStakeAmountField } from '@/components/pages/out-tabs/drawer/stakes/new/NewStakeAmountField';
import { NewStakeLimitNotice } from '@/components/pages/out-tabs/drawer/stakes/new/NewStakeLimitNotice';
import { NewStakeLevelPicker } from '@/components/pages/out-tabs/drawer/stakes/new/NewStakeLevelPicker';
import { StakesLevelChip } from '@/components/pages/out-tabs/drawer/stakes/StakesLevelChip';
import {
  computeStakeAprPercent,
  computeStakeReturnCoins,
  findNextLevelOver,
} from '@/utils/global/stakes.utils';
import type { StakeLevelDefinition } from '@/types/interfaces/stakes.interfaces';

export interface NewStakeHeroProps {
  levels: StakeLevelDefinition[];
  activeLevel: StakeLevelDefinition;
  deposit: number;
  balance: number;
  sliderMin: number;
  sliderMax: number;
  /**
   * Hard ceiling on the deposit: the balance, and never into a level the
   * player's tier has not opened. Every control here stops at it.
   */
  maxStakeable: number;
  /** Cheapest level the tier does not open — `null` when nothing is gated. */
  lockedLevel: StakeLevelDefinition | null;
  /** What is still missing for `lockedLevel`, already localized. */
  lockedLevelHint?: string;
  /** Opens the gate explainer from the ceiling notice. */
  onExplainLock?: () => void;
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
  maxStakeable,
  lockedLevel,
  lockedLevelHint,
  onExplainLock,
  durationMonths,
  onDepositChange,
  onDurationChange,
}: NewStakeHeroProps) {
  const t = useAppTranslations();
  const { data: me } = useGetMeQuery();
  const stakeKnobs = useStakesDisplayConfig();
  const DURATION_MIN = stakeKnobs.durationMinMonths;
  const DURATION_MAX = stakeKnobs.durationMaxMonths;
  const [depositTooltip, setDepositTooltip] = useState(false);
  const [durationTooltip, setDurationTooltip] = useState(false);
  const next = findNextLevelOver(levels, deposit);
  const clampedDeposit = Math.min(Math.max(deposit, sliderMin), sliderMax);
  const sliderRange = Math.max(1, sliderMax - sliderMin);
  const sliderProgress = ((clampedDeposit - sliderMin) / sliderRange) * 100;
  // The wall. The track still spans the whole balance so the locked part stays
  // visible — the thumb is what stops, which is the clearest "no" a slider can
  // give. `hardMax` never drops under the slider floor: with a balance below
  // the first level there is nothing to drag through anyway.
  const hardMax = Math.max(sliderMin, Math.min(maxStakeable, sliderMax));
  const commitDeposit = (value: number) => onDepositChange(Math.min(value, hardMax));
  const ceilingBites = !!lockedLevel && hardMax < sliderMax;
  const lockProgress = ((hardMax - sliderMin) / sliderRange) * 100;
  // Every control clamps, so this only holds for an amount that arrived from
  // outside — a `?amount=` re-stake link written when the tier was higher.
  const depositBlocked = deposit > hardMax;
  const clampedDuration = Math.min(Math.max(durationMonths, DURATION_MIN), DURATION_MAX);
  const durationProgress = ((clampedDuration - DURATION_MIN) / (DURATION_MAX - DURATION_MIN)) * 100;
  const aprPercent = computeStakeAprPercent(clampedDuration, stakeKnobs);
  // Same status flags the rewards preview below uses — computing the yield
  // without them made this card quote a different number for the same stake.
  const aprReturn = computeStakeReturnCoins(
    clampedDeposit,
    clampedDuration,
    me?.isLuckyPlayer ?? false,
    me?.isVIP ?? false,
    stakeKnobs
  );
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
          <div className="mt-1 flex items-center justify-center gap-1.5">
            <NewStakeAmountField
              value={deposit}
              max={hardMax}
              onChange={onDepositChange}
              className={depositBlocked ? 'text-error-text border-error/50' : undefined}
            />
            <LcLabel size={20} />
          </div>
          <div className="text-white-secondary mt-1 text-[11px]">
            {t('of {amount} {coin} available', {
              amount: balance.toLocaleString(),
              coin: GlobalConstants.coinName,
            })}
          </div>
        </div>

        {ceilingBites && lockedLevel && (
          <NewStakeLimitNotice
            className="mt-3"
            tone={depositBlocked ? 'blocked' : 'info'}
            title={t('your tier caps the stake at {amount} {coin}', {
              amount: hardMax.toLocaleString(),
              coin: GlobalConstants.coinName,
            })}
            detail={[
              t('level {level} needs {tier} tier', {
                level: lockedLevel.level,
                tier: t(tierNameId[lockedLevel.tier]),
              }),
              lockedLevelHint,
            ]
              .filter(Boolean)
              .join(' · ')}
            onClick={onExplainLock}
          />
        )}

        {/* An invitation to raise the deposit is only honest while the level it
            points at is reachable — above the wall the notice speaks instead. */}
        {next && !(lockedLevel && next.level >= lockedLevel.level) && (
          <div className="border-electric-purple/30 bg-electric-purple/15 text-electric-purple mt-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-bold tracking-wide">
            {t('+{amount} {coin} for level {level}', {
              amount: (next.minDeposit - deposit).toLocaleString(),
              coin: GlobalConstants.coinName,
              level: next.level,
            })}
          </div>
        )}

        <div className="relative mt-4">
          {depositTooltip && (
            <div
              className="border-electric-pink/40 bg-background pointer-events-none absolute -top-7 -translate-x-1/2 rounded-md border px-2 py-0.5 text-[10px] font-extrabold text-white shadow-lg tabular-nums"
              style={{ left: `${sliderProgress}%` }}
            >
              {formatCompact(clampedDeposit)}
            </div>
          )}
          {ceilingBites && (
            <Lock
              size={11}
              strokeWidth={2.8}
              aria-hidden
              className="text-error-text pointer-events-none absolute -top-4 -translate-x-1/2"
              style={{ left: `${lockProgress}%` }}
            />
          )}
          <input
            type="range"
            min={sliderMin}
            max={sliderMax}
            step={1}
            value={clampedDeposit}
            onChange={e => commitDeposit(Number(e.target.value))}
            onPointerDown={() => setDepositTooltip(true)}
            onPointerUp={() => setDepositTooltip(false)}
            onPointerLeave={() => setDepositTooltip(false)}
            aria-label={t('pick level amount')}
            // The thumb stops at the tier ceiling, so that — not `max` — is the
            // highest value this control can report.
            aria-valuemax={hardMax}
            className="stakes-slider w-full"
            style={{
              background: ceilingBites
                ? `linear-gradient(90deg, var(--color-electric-pink) 0%, var(--color-electric-purple) ${sliderProgress}%, rgba(255,255,255,0.08) ${sliderProgress}%, rgba(255,255,255,0.08) ${lockProgress}%, color-mix(in srgb, var(--color-error) 70%, transparent) ${lockProgress}%)`
                : `linear-gradient(90deg, var(--color-electric-pink) 0%, var(--color-electric-purple) ${sliderProgress}%, rgba(255,255,255,0.08) ${sliderProgress}%)`,
            }}
          />
        </div>

        <div className="mt-2 flex gap-1.5">
          {[
            // Clamp every preset to [sliderMin, hardMax] — a preset must never
            // hand back an amount the player is not allowed to stake. "Max" in
            // particular means "the most you can stake", not "your balance".
            {
              label: '25%',
              value: Math.max(sliderMin, Math.floor(balance * 0.25)),
            },
            {
              label: '50%',
              value: Math.max(sliderMin, Math.floor(balance * 0.5)),
            },
            { label: t('max'), value: balance },
          ].map(preset => (
            <button
              key={preset.label}
              type="button"
              onClick={() => commitDeposit(Math.min(sliderMax, preset.value))}
              className="border-electric-pink/25 bg-electric-pink/10 text-electric-pink hover:bg-electric-pink/15 flex-1 rounded-full border px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>

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
        <div className="relative mt-2">
          {durationTooltip && (
            <div
              className="border-electric-pink/40 bg-background pointer-events-none absolute -top-7 -translate-x-1/2 rounded-md border px-2 py-0.5 text-[10px] font-extrabold text-white shadow-lg tabular-nums"
              style={{ left: `${durationProgress}%` }}
            >
              {t('{n} months', { n: clampedDuration })}
            </div>
          )}
          <input
            type="range"
            min={DURATION_MIN}
            max={DURATION_MAX}
            step={1}
            value={clampedDuration}
            onChange={e => onDurationChange(Number(e.target.value))}
            onPointerDown={() => setDurationTooltip(true)}
            onPointerUp={() => setDurationTooltip(false)}
            onPointerLeave={() => setDurationTooltip(false)}
            aria-label={t('pick duration')}
            className="stakes-slider w-full"
            style={{
              background: `linear-gradient(90deg, var(--color-electric-pink) 0%, var(--color-electric-purple) ${durationProgress}%, rgba(255,255,255,0.08) ${durationProgress}%)`,
            }}
          />
        </div>

        <div className="mt-3 flex items-end justify-between gap-0.5">
          {Array.from({ length: DURATION_MAX - DURATION_MIN + 1 }, (_, i) => {
            const month = DURATION_MIN + i;
            const apr = computeStakeAprPercent(month, stakeKnobs);
            const minHeight = 6;
            const maxHeight = 26;
            const aprRange = stakeKnobs.aprMaxPercent - stakeKnobs.aprMinPercent;
            const ratio = aprRange > 0 ? (apr - stakeKnobs.aprMinPercent) / aprRange : 0;
            const heightPx = minHeight + ratio * (maxHeight - minHeight);
            const isActive = month === clampedDuration;
            return (
              <button
                key={month}
                type="button"
                onClick={() => onDurationChange(month)}
                aria-label={t('{n} months', { n: month })}
                className="group flex flex-1 flex-col items-center gap-1"
              >
                <div
                  className={
                    isActive
                      ? 'bg-electric-pink w-full rounded-sm transition-all duration-200'
                      : 'bg-electric-purple/30 group-hover:bg-electric-purple/50 w-full rounded-sm transition-all duration-200'
                  }
                  style={{ height: `${heightPx}px` }}
                />
                <span
                  className={
                    isActive
                      ? 'text-electric-pink text-[8px] font-extrabold tabular-nums'
                      : 'text-white/30 text-[8px] font-bold tabular-nums'
                  }
                >
                  {month}
                </span>
              </button>
            );
          })}
        </div>

        <div className="border-gold/30 bg-gold/10 mt-4 flex items-center justify-between rounded-xl border px-3 py-2.5">
          <div className="flex min-w-0 items-center gap-2 text-left">
            <div className="flex-center border-gold/40 bg-gold/20 h-7 w-7 rounded-full border">
              <Star size={12} className="text-gold" fill="currentColor" strokeWidth={0} />
            </div>
            <div className="leading-tight">
              <div className="text-pink-secondary text-[9px] font-bold uppercase tracking-wider">
                {t('annual return')}
              </div>
              <div className="text-gold text-[10px] font-semibold">
                {t('apr range {min}–{max}%', {
                  min: stakeKnobs.aprMinPercent,
                  max: stakeKnobs.aprMaxPercent,
                })}
              </div>
            </div>
          </div>
          <div className="shrink-0 text-right leading-tight">
            <div className="text-gold text-[15px] font-extrabold tabular-nums">{aprLabel}%</div>
            <div className="text-white-secondary whitespace-nowrap text-[10px] font-semibold tabular-nums">
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
