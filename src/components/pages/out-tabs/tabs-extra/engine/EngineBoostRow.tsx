'use client';

import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import {
  ENGINE_BOOST_COLOR,
  ENGINE_BOOST_ICON,
  ENGINE_BOOST_LABEL_KEY,
} from '@/constants/engine-boosts';
import { MultiplierBadge } from '@/components/shared/badges/MultiplierBadge';
import { type EngineSpeedBoostSource, isMultiplierBoost } from '@/utils/global/engine-boosts.utils';

export interface EngineBoostRowProps {
  source: EngineSpeedBoostSource;
  /** Largest `pct` in the whole stack — bar widths are relative to it. */
  strongest: number;
  className?: string;
}

/**
 * One contributor to the speed stack: icon, name, its share of the bar, its
 * worth.
 *
 * A multiplier (speed chip, Lucky Player) leads with its FACTOR — `×1.3` — and
 * only then with the percentage that factor is worth on this engine. That order
 * is the whole point: the factor is the part that does not change as the engine
 * grows, while the percentage next to it is the part that does.
 */
export function EngineBoostRow({ source, strongest, className }: EngineBoostRowProps) {
  const t = useAppTranslations();
  const Icon = ENGINE_BOOST_ICON[source.key];
  const color = ENGINE_BOOST_COLOR[source.key];
  const isMultiplier = isMultiplierBoost(source);

  return (
    <li className={twMerge('flex items-center gap-2', className)}>
      <Icon size={13} stroke={color} strokeWidth={2.4} className="shrink-0" />
      <span className="w-[92px] shrink-0 truncate text-[11px] font-bold text-white/70">
        {t(ENGINE_BOOST_LABEL_KEY[source.key])}
      </span>
      <span className="bg-background h-1.5 flex-1 overflow-hidden rounded-full">
        <span
          className="block h-full rounded-full"
          style={{
            width: `${strongest > 0 ? (source.pct / strongest) * 100 : 0}%`,
            // Two fabrics, so the classes are told apart even with the text
            // ignored: a summand is a solid bar, a multiplier a hatched one.
            background: isMultiplier
              ? `repeating-linear-gradient(115deg, ${color} 0 4px, color-mix(in srgb, ${color} 35%, transparent) 4px 8px)`
              : color,
          }}
        />
      </span>
      {isMultiplier ? (
        <span className="flex w-16 shrink-0 flex-col items-end gap-0.5 leading-none">
          <MultiplierBadge multiplier={source.multiplier ?? 1} size="sm" />
          {/* What the factor is worth HERE — the same number the arcs and the
              total are built from, kept quiet so it reads as the consequence of
              the factor rather than as a second boost. */}
          <span className="text-[9px] font-bold tabular-nums text-white/40">
            +{Math.round(source.pct)}%
          </span>
        </span>
      ) : (
        <span className="w-16 shrink-0 text-end text-[11px] font-black tabular-nums text-white">
          +{Math.round(source.pct)}%
        </span>
      )}
    </li>
  );
}
