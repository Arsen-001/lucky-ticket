'use client';

import { Sparkles } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { EngineBoostRow } from '@/components/pages/out-tabs/tabs-extra/engine/EngineBoostRow';
import { SuperBoostBadge } from '@/components/shared/badges/SuperBoostBadge';
import {
  activeSpeedBoostSources,
  additiveSpeedBoostSources,
  type EngineSpeedBoostSource,
  superSpeedBoostSources,
  totalSpeedBoostPct,
} from '@/utils/global/engine-boosts.utils';
import { formatCompact, formatTicketRate } from '@/utils/global/number.utils';
import { formatCycleTime } from '@/utils/global/ticket-engine.utils';

export interface EngineStatsLedgerProps {
  accent: string;
  ticketsPerHour: number;
  capacity: number;
  cycleSeconds: number;
  /** Cycle before any boost — the "from" side of the speed line. */
  baseCycleSeconds: number;
  lifetimeProduced: number;
  boosts: readonly EngineSpeedBoostSource[];
  className?: string;
}

/**
 * "Разбор" — the speed stack itemised: every boost that shortened this cycle,
 * with its own share of the bar, and the before→after cycle underneath. Answers
 * "why is my engine this fast?", which nothing on the screen answered before.
 *
 * Split in two since 17.08.2026, because the stack is: the boosts that ADD up,
 * then the ones that MULTIPLY what they built (speed chip, Lucky Player). One
 * flat list of `+%` rows said they were the same kind of thing and they are not
 * — a +30 % row is worth ×1.04 on a maxed engine while a ×1.3 row is worth ×1.3
 * on every engine there will ever be.
 */
export function EngineStatsLedger({
  accent,
  ticketsPerHour,
  capacity,
  cycleSeconds,
  baseCycleSeconds,
  lifetimeProduced,
  boosts,
  className,
}: EngineStatsLedgerProps) {
  const t = useAppTranslations();
  const active = activeSpeedBoostSources(boosts);
  const total = totalSpeedBoostPct(active);
  const strongest = active.reduce((max, source) => Math.max(max, source.pct), 0);
  const additive = additiveSpeedBoostSources(active);
  const supers = superSpeedBoostSources(active);
  // What the super boosts multiply the whole stack by, together — the headline
  // of their block, and the one number a player can carry between engines.
  const superFactor = supers.reduce((product, source) => product * (source.multiplier ?? 1), 1);

  return (
    <section
      className={twMerge(
        'bg-background-overlay flex flex-col gap-3 rounded-2xl p-4',
        'animate-slide-in-bottom',
        className
      )}
    >
      <div className="flex items-end justify-between gap-2">
        <span className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-white/45">
          {t('speed boost')}
        </span>
        <span className="text-xl font-black leading-none tabular-nums" style={{ color: accent }}>
          +{Math.round(total)}%
        </span>
      </div>

      {active.length === 0 && (
        <p className="text-[11px] font-semibold text-white/35">{t('no speed boosts yet')}</p>
      )}

      {additive.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {/* The heading only earns its line once there is a second group to
              tell this one apart from — and then it has to carry half the
              contrast, so it gets a rule of its own rather than sitting at 35%
              opacity where it read as a caption. */}
          {supers.length > 0 && (
            <span className="flex items-center gap-2 text-[9px] font-extrabold uppercase tracking-[0.18em] text-white/55">
              {t('adds up')}
              <span className="h-px flex-1 bg-white/10" />
            </span>
          )}
          <ul className="flex flex-col gap-1.5">
            {additive.map(source => (
              <EngineBoostRow key={source.key} source={source} strongest={strongest} />
            ))}
          </ul>
        </div>
      )}

      {/* Gold frame, gold pills, hatched bars: the block is meant to be
          recognisable before a word of it is read. */}
      {supers.length > 0 && (
        <div
          className="border-gold/25 flex flex-col gap-2 rounded-xl border p-2.5"
          style={{
            background:
              'linear-gradient(180deg, color-mix(in srgb, var(--color-gold) 10%, transparent), transparent)',
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-gold flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-[0.18em]">
              <Sparkles size={11} stroke="var(--color-gold)" strokeWidth={2.6} />
              {t('super boosts')}
            </span>
            <SuperBoostBadge multiplier={superFactor} size="md" />
          </div>
          <ul className="flex flex-col gap-1.5">
            {supers.map(source => (
              <EngineBoostRow key={source.key} source={source} strongest={strongest} />
            ))}
          </ul>
          <p className="text-[10px] font-semibold leading-snug text-white/40">
            {t('super boosts explained')}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between gap-2 border-t border-white/8 pt-2.5">
        <span className="text-[11px] font-semibold text-white/40">{t('cycle')}</span>
        <span className="flex items-center gap-1.5 text-[12px] font-bold tabular-nums">
          {/* The "was → now" pair only reads as a win while the boost actually
              shortens the cycle — with no speed boost equipped, baseline and
              cycle are the same number and the struck-through twin is noise. */}
          {cycleSeconds < baseCycleSeconds && (
            <span className="text-white/35 line-through">{formatCycleTime(baseCycleSeconds)}</span>
          )}
          <span style={{ color: accent }}>{formatCycleTime(cycleSeconds)}</span>
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { value: formatTicketRate(ticketsPerHour), label: t('per hour') },
          { value: String(capacity), label: t('per cycle') },
          { value: formatCompact(lifetimeProduced), label: t('all time') },
        ].map(stat => (
          <div key={stat.label} className="flex flex-col gap-0.5">
            <span className="text-base font-black leading-none tabular-nums text-white">
              {stat.value}
            </span>
            <span className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-white/40">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
