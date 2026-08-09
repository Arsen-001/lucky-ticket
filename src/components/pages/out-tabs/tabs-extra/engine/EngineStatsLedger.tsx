'use client';

import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import {
  ENGINE_BOOST_COLOR,
  ENGINE_BOOST_ICON,
  ENGINE_BOOST_LABEL_KEY,
} from '@/constants/engine-boosts';
import {
  activeSpeedBoostSources,
  type EngineSpeedBoostSource,
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
  atSpeedCap?: boolean;
  className?: string;
}

/**
 * "Разбор" — the speed stack itemised: every boost that shortened this cycle,
 * with its own share of the bar, and the before→after cycle underneath. Answers
 * "why is my engine this fast?", which nothing on the screen answered before.
 */
export function EngineStatsLedger({
  accent,
  ticketsPerHour,
  capacity,
  cycleSeconds,
  baseCycleSeconds,
  lifetimeProduced,
  boosts,
  atSpeedCap = false,
  className,
}: EngineStatsLedgerProps) {
  const t = useAppTranslations();
  const active = activeSpeedBoostSources(boosts);
  const total = totalSpeedBoostPct(active);
  const strongest = active.reduce((max, source) => Math.max(max, source.pct), 0);

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

      {active.length > 0 ? (
        <ul className="flex flex-col gap-1.5">
          {active.map(source => {
            const Icon = ENGINE_BOOST_ICON[source.key];
            const color = ENGINE_BOOST_COLOR[source.key];
            return (
              <li key={source.key} className="flex items-center gap-2">
                <Icon size={13} stroke={color} strokeWidth={2.4} className="shrink-0" />
                <span className="w-[104px] shrink-0 truncate text-[11px] font-bold text-white/70">
                  {t(ENGINE_BOOST_LABEL_KEY[source.key])}
                </span>
                <span className="bg-background h-1.5 flex-1 overflow-hidden rounded-full">
                  <span
                    className="block h-full rounded-full"
                    style={{
                      width: `${strongest > 0 ? (source.pct / strongest) * 100 : 0}%`,
                      backgroundColor: color,
                    }}
                  />
                </span>
                <span className="w-12 shrink-0 text-right text-[11px] font-black tabular-nums text-white">
                  +{Math.round(source.pct)}%
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-[11px] font-semibold text-white/35">{t('no speed boosts yet')}</p>
      )}

      <div className="flex items-center justify-between gap-2 border-t border-white/8 pt-2.5">
        <span className="text-[11px] font-semibold text-white/40">{t('cycle')}</span>
        <span className="flex items-center gap-1.5 text-[12px] font-bold tabular-nums">
          {/* The "was → now" pair only reads as a win while the boost actually
              shortens the cycle. Past the per-ticket floor a bigger batch makes
              the cycle LONGER (throughput stays capped), so drop the comparison
              and say what is really happening instead. */}
          {cycleSeconds < baseCycleSeconds && (
            <span className="text-white/35 line-through">{formatCycleTime(baseCycleSeconds)}</span>
          )}
          <span style={{ color: accent }}>{formatCycleTime(cycleSeconds)}</span>
          {atSpeedCap && (
            <span className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-white/35">
              {t('at speed cap')}
            </span>
          )}
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
