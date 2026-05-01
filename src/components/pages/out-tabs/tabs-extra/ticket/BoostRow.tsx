'use client';

import { twMerge } from 'tailwind-merge';
import Image from 'next/image';
import { icons } from '@/constants/icons';
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
  className,
}: BoostRowProps) {
  const t = useAppTranslations();
  const maxed = level >= max;

  return (
    <div
      className={twMerge(
        'flex items-center gap-2.5 p-2 px-2.5 rounded-xl bg-black/28 border border-white/5',
        className
      )}
    >
      <div
        className="w-6.5 h-6.5 rounded-lg flex-center shrink-0"
        style={{
          background: `${accent}1a`,
          border: `1px solid ${accent}55`,
        }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-white tracking-wide">{label}</span>
          <span
            className="text-[9px] font-extrabold tabular-nums tracking-wider px-1 py-px rounded"
            style={{ color: accent, background: `${accent}1f` }}
          >
            {level}/{max}
          </span>
          <span className="ml-auto text-[10px] font-semibold text-pink-secondary truncate">
            {valueText}
          </span>
        </div>
        <BoostMeter level={level} max={max} accent={accent} />
      </div>
      <button
        onClick={onUpgrade}
        disabled={maxed}
        className={twMerge(
          'min-w-16 shrink-0 h-7.5 px-2.5 rounded-lg text-[10px] font-extrabold tracking-wider flex-center gap-1 transition-all duration-100',
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
            <Image src={icons.telegramStar} alt="" height={11} width={11} />
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
