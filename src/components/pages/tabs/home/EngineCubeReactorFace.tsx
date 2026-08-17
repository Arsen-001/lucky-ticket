'use client';

import { Package, Zap } from 'lucide-react';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { MultiplierBadge } from '@/components/shared/badges/MultiplierBadge';
import { ENGINE_BOOST_COLOR, ENGINE_BOOST_LABEL_KEY } from '@/constants/engine-boosts';
import type { MessageIds } from '@/types/types/i18n.types';
import {
  type EngineCapacityKey,
  type EngineCapacitySource,
  type EngineSpeedBoostSource,
  activeCapacitySources,
  activeSpeedBoostSources,
  isMultiplierBoost,
  totalSpeedBoostPct,
} from '@/utils/global/engine-boosts.utils';
import { formatTicketRate } from '@/utils/global/number.utils';
import { formatCycleTime } from '@/utils/global/ticket-engine.utils';
import '@/styles/components/engine-cube-faces.css';

const SPEED_ACCENT = '#C5B0F8';
const CAPACITY_ACCENT = '#FFE08A';

const CAPACITY_LABEL_KEY: Record<EngineCapacityKey, MessageIds> = {
  factory: 'base',
  engineLevel: 'engine level',
  capacityLevel: 'capacity upgrades',
  chip: 'chip',
  badge: 'tester badge',
  booster: 'booster',
};

const CAPACITY_COLOR: Record<EngineCapacityKey, string> = {
  factory: 'rgba(255,255,255,0.22)',
  engineLevel: 'var(--color-electric-purple)',
  capacityLevel: CAPACITY_ACCENT,
  chip: 'var(--color-teal)',
  // Gold — the same colour the crown carries everywhere else on this screen.
  badge: 'var(--color-gold)',
  booster: 'var(--color-orange)',
};

export interface EngineCubeReactorFaceProps {
  engineLevel: number;
  /** Batch-normalised cycle before any boost — what the boost divides. */
  baseCycleSeconds: number;
  /** Cycle the engine actually runs. */
  cycleSeconds: number;
  capacity: number;
  ticketsPerHour: number;
  boosts: readonly EngineSpeedBoostSource[];
  capacitySources: readonly EngineCapacitySource[];
  accent?: string;
}

/** One ring: coloured arcs whose angles are each source's share of the whole. */
function ring(segments: { color: string; value: number }[], total: number) {
  if (total <= 0) return 'conic-gradient(rgba(255,255,255,0.12) 0 100%)';
  let cursor = 0;
  const stops = segments.map(segment => {
    const from = (cursor / total) * 100;
    cursor += segment.value;
    const to = (cursor / total) * 100;
    return `${segment.color} ${from}% ${to}%`;
  });
  return `conic-gradient(from -90deg, ${stops.join(', ')})`;
}

/**
 * "Реактор" — the whole engine maths as two dials: the speed stack (base ×1
 * plus every boost arc) around the cycle it produces, and the capacity ladder
 * around the batch it mints. Every arc is a term the engine actually applies.
 */
export function EngineCubeReactorFace({
  engineLevel,
  baseCycleSeconds,
  cycleSeconds,
  capacity,
  ticketsPerHour,
  boosts,
  capacitySources,
  accent = 'var(--color-electric-pink)',
}: EngineCubeReactorFaceProps) {
  const t = useAppTranslations();
  const activeBoosts = activeSpeedBoostSources(boosts);
  const totalPct = totalSpeedBoostPct(activeBoosts);
  const speedSegments = [
    { color: 'rgba(255,255,255,0.22)', value: 100 },
    ...activeBoosts.map(source => ({ color: ENGINE_BOOST_COLOR[source.key], value: source.pct })),
  ];

  const activeCapacity = activeCapacitySources(capacitySources);
  const absoluteTickets = activeCapacity.reduce((sum, source) => sum + source.tickets, 0);
  const scaledTickets = Math.max(0, capacity - absoluteTickets);
  const scalers = activeCapacity.filter(source => source.pct > 0);
  const scalerTotalPct = scalers.reduce((sum, source) => sum + source.pct, 0);
  const capacitySegments = [
    ...activeCapacity
      .filter(source => source.tickets > 0)
      .map(source => ({ color: CAPACITY_COLOR[source.key], value: source.tickets })),
    // The percentage scalers own whatever tickets they added on top of the batch.
    ...scalers.map(source => ({
      color: CAPACITY_COLOR[source.key],
      value: scalerTotalPct > 0 ? (scaledTickets * source.pct) / scalerTotalPct : 0,
    })),
  ];

  return (
    <div
      className="cube-hud cube-hud--bare gap-1.5"
      style={{ '--hud-accent': accent } as React.CSSProperties}
    >
      <div className="flex items-center justify-between">
        <span
          className="text-[10px] font-extrabold uppercase tracking-[0.22em]"
          style={{ color: accent }}
        >
          {t('engine stats')}
        </span>
        <span
          className="rounded-full border px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.18em]"
          style={{
            color: accent,
            borderColor: `color-mix(in srgb, ${accent} 70%, transparent)`,
            backgroundColor: `color-mix(in srgb, ${accent} 18%, transparent)`,
          }}
        >
          {t('lvl')} {engineLevel}
        </span>
      </div>

      <div className="flex items-start justify-center gap-5">
        <div className="flex flex-col items-center gap-1">
          <div
            className="relative size-[96px] rounded-full"
            style={{ background: ring(speedSegments, 100 + totalPct) }}
          >
            <div className="bg-background absolute inset-[10px] flex flex-col items-center justify-center rounded-full">
              <Zap size={12} stroke={SPEED_ACCENT} strokeWidth={2.8} />
              <span className="text-[15px] font-black leading-tight tabular-nums text-white">
                {formatCycleTime(cycleSeconds)}
              </span>
              <span className="text-[8px] font-extrabold uppercase tracking-[0.14em] text-white/40">
                {t('cycle')}
              </span>
            </div>
          </div>
          <span className="text-[11px] font-black tabular-nums" style={{ color: SPEED_ACCENT }}>
            +{Math.round(totalPct)}%
          </span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <div
            className="relative size-[96px] rounded-full"
            style={{ background: ring(capacitySegments, Math.max(capacity, 1)) }}
          >
            <div className="bg-background absolute inset-[10px] flex flex-col items-center justify-center rounded-full">
              <Package size={12} stroke={CAPACITY_ACCENT} strokeWidth={2.8} />
              <span className="text-[19px] font-black leading-tight tabular-nums text-white">
                ×{capacity}
              </span>
              <span className="text-[8px] font-extrabold uppercase tracking-[0.14em] text-white/40">
                {t('per cycle')}
              </span>
            </div>
          </div>
          {/* How the batch was built, not what it ended up as — the centre
              already says that: absolute rungs summed, then the % scalers. */}
          <span className="text-[11px] font-black tabular-nums" style={{ color: CAPACITY_ACCENT }}>
            {activeCapacity
              .filter(source => source.tickets > 0)
              .map(source => source.tickets)
              .join('+')}
            {scalerTotalPct > 0 ? ` ×${(1 + scalerTotalPct / 100).toFixed(2)}` : ''}
          </span>
        </div>
      </div>

      <div className="cube-hud-scanline" />

      {/* Centred in whatever space the rings leave, so a two-line legend does not
          hang under the dials with a hole beneath it. */}
      <div className="flex flex-1 flex-col justify-center gap-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <Zap size={10} stroke={SPEED_ACCENT} strokeWidth={2.8} className="shrink-0" />
          {activeBoosts.length > 0 ? (
            activeBoosts.map(source => (
              <span
                key={source.key}
                className="flex items-center gap-1 text-[9px] font-bold text-white/55"
              >
                <span
                  className="size-1.5 rounded-full"
                  style={{ backgroundColor: ENGINE_BOOST_COLOR[source.key] }}
                />
                {t(ENGINE_BOOST_LABEL_KEY[source.key])}
                {/* A multiplier is quoted by its FACTOR, not by the percentage
                    its arc is drawn from: the arc says what it is worth on this
                    engine, the ×N says what it will be worth on every other one.
                    It wears the same gold pill as everywhere else — at 9px a
                    bare `×` against a `+` is not a difference anyone sees. */}
                {isMultiplierBoost(source) ? (
                  <MultiplierBadge multiplier={source.multiplier ?? 1} size="xs" />
                ) : (
                  <span className="tabular-nums text-white">+{Math.round(source.pct)}%</span>
                )}
              </span>
            ))
          ) : (
            <span className="text-[9px] font-bold text-white/35">{t('no speed boosts yet')}</span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <Package size={10} stroke={CAPACITY_ACCENT} strokeWidth={2.8} className="shrink-0" />
          {activeCapacity.map(source => (
            <span
              key={source.key}
              className="flex items-center gap-1 text-[9px] font-bold text-white/55"
            >
              <span
                className="size-1.5 rounded-full"
                style={{ backgroundColor: CAPACITY_COLOR[source.key] }}
              />
              {t(CAPACITY_LABEL_KEY[source.key])}
              <span className="tabular-nums text-white">
                {source.tickets > 0 ? `+${source.tickets}` : `+${source.pct}%`}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* One line, so a long legend can never push the face past its 300px square:
          the equation on the left, what it resolves to on the right. */}
      <div className="mt-auto flex items-center justify-between gap-2 border-t border-white/8 pt-1.5">
        <span className="text-[9px] font-bold tabular-nums text-white/45">
          {formatCycleTime(baseCycleSeconds)} ÷ {(1 + totalPct / 100).toFixed(2)} ={' '}
          {formatCycleTime(baseCycleSeconds / (1 + totalPct / 100))}
        </span>
        <span className="text-[10px] font-black tabular-nums" style={{ color: accent }}>
          {formatTicketRate(ticketsPerHour)} {t('t/h')}
          {` · ${formatTicketRate(ticketsPerHour * 24)}${t('per day short')}`}
        </span>
      </div>
    </div>
  );
}
