'use client';

import { twMerge } from 'tailwind-merge';
import { TelegramStarIcon } from '@/components/shared/icons/TelegramStarIcon';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { ReactNode } from 'react';

export interface BoostRowProps {
  icon: ReactNode;
  label: string;
  valueText: string;
  level: number;
  max: number;
  accent: string;
  costStars: number;
  onUpgrade: () => void;
  compact?: boolean;
  className?: string;
}

export function BoostRow({
  icon,
  label,
  valueText,
  level,
  max,
  accent,
  costStars,
  onUpgrade,
  compact = false,
  className,
}: BoostRowProps) {
  const t = useAppTranslations();
  const maxed = level >= max;

  return (
    <div
      className={twMerge(
        compact
          ? 'flex items-center gap-2 p-1.5 px-2 rounded-lg bg-black/28 border border-white/5'
          : 'flex items-center gap-2.5 p-2 px-2.5 rounded-xl bg-black/28 border border-white/5',
        className
      )}
    >
      <div
        className="w-7 h-7 rounded-lg flex-center shrink-0"
        style={{
          background: `${accent}1a`,
          border: `1px solid ${accent}55`,
        }}
      >
        {icon}
      </div>
      <div className={twMerge('flex-1 min-w-0 flex flex-col', compact ? 'gap-1' : 'gap-1.5')}>
        <div className={twMerge('flex items-center', compact ? 'gap-1' : 'gap-1.5')}>
          {/* 14px, not 15, and that one pixel is load-bearing: the longest
              label is Russian "Вместимость", and at 15px it pushed the "+0"
              value off its own line (6px of the 17px it needs). The value is
              what the row is read FOR — the label is guessable from the icon. */}
          {/* The label is the part allowed to give way. Measured on production
              (RU, capacity 10/10): the line is 142px, the label took 81 and the
              «10/10» badge 39, which left 10px for a value needing 19 — the row
              printed «Вместимость 10/10 +.», eating the one number it exists to
              show. English never hit it («Capacity» is 24px shorter), and no
              mock engine reaches 10/10 with a two-digit bonus, so only the live
              screen showed it. The Russian word has since been shortened to
              «Ёмкость» (52px) and now fits with room to spare — this stays as
              the floor, so the next long label loses letters, never the number. */}
          <span
            className={twMerge(
              'min-w-0 truncate font-bold text-white tracking-wide',
              compact ? 'text-[13px]' : 'text-[11px]'
            )}
          >
            {label}
          </span>
          <span
            className={twMerge(
              'shrink-0 font-extrabold tabular-nums tracking-wider px-1 py-px rounded',
              compact ? 'text-[12px]' : 'text-[9px]'
            )}
            style={{ color: accent, background: `${accent}1f` }}
          >
            {level}/{max}
          </span>
          <span
            className={twMerge(
              'ms-auto shrink-0 whitespace-nowrap font-semibold text-pink-secondary',
              compact ? 'text-[13px]' : 'text-[10px]'
            )}
          >
            {valueText}
          </span>
        </div>
        <BoostMeter level={level} max={max} accent={accent} />
      </div>
      <button
        onClick={onUpgrade}
        disabled={maxed}
        className={twMerge(
          compact
            ? 'min-w-16 shrink-0 h-8 px-2.5 rounded-lg text-[13px] font-extrabold tracking-wider flex-center gap-1 transition-all duration-100'
            : 'min-w-16 shrink-0 h-7.5 px-2.5 rounded-lg text-[10px] font-extrabold tracking-wider flex-center gap-1 transition-all duration-100',
          maxed
            ? 'bg-white/3 border border-white/5 text-pink-secondary cursor-default'
            : 'cursor-pointer hover:brightness-110 active:scale-99'
        )}
        style={
          maxed
            ? undefined
            : {
                background: `${accent}1f`,
                border: `1px solid ${accent}55`,
                color: accent,
              }
        }
      >
        {maxed ? (
          <span>{t('max')}</span>
        ) : (
          <>
            {/* No `filter` halo here: a filter spawns a composited layer inside
                the home cube's 3D context (`preserve-3d` + `backface-visibility`),
                which is where iOS drops the icon. The star reads fine on both
                accents at this size — the button fill is only 12% tint. */}
            <TelegramStarIcon size={compact ? 14 : 12} />
            <span className="tabular-nums">{costStars}</span>
          </>
        )}
      </button>
    </div>
  );
}

interface BoostMeterProps {
  level: number;
  max: number;
  accent: string;
}

function BoostMeter({ level, max, accent }: BoostMeterProps) {
  const filled = Math.min(max, Math.max(0, level));

  return (
    <div className="flex gap-0.5 h-1 items-stretch">
      {Array.from({ length: max }).map((_, index) => {
        const isOn = index < filled;
        return (
          <div
            key={index}
            className="flex-1 rounded-[1.5px] transition-all duration-200"
            style={{
              background: isOn ? accent : 'rgba(255,255,255,0.06)',
              boxShadow: isOn ? `0 0 4px ${accent}88` : 'none',
            }}
          />
        );
      })}
    </div>
  );
}
