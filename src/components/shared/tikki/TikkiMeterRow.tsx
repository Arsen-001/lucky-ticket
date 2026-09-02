'use client';

import { ArrowUp } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import type { TikkiUnit } from './tikki.constants';
import { tikkiMaxHours } from './tikki.constants';
import { tikkiCapacity, tikkiTimeToFullMs, tikkiWindowHours } from './tikki.utils';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { formatCompact } from '@/utils/global/number.utils';
import { TikkiFillBar } from './TikkiFillBar';

export interface TikkiMeterRowProps {
  unit: TikkiUnit;
  accent: string;
  onUpgradeClicker: () => void;
  onUpgradeWindow: () => void;
}

const pill =
  'flex flex-none items-center gap-1 rounded-full border border-white/12 bg-white/6 px-2.5 py-1.5 ' +
  'text-[11px] font-extrabold tabular-nums ' +
  'focus-visible:outline-teal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2';

/**
 * Полоса кликера с двумя точками прокачки по краям.
 *
 * Слева — сколько лежит из того, что влезает: это уровень кликера, он двигает
 * оба числа сразу. Справа — сколько осталось до полной: это окно, и когда оно
 * доходит до потолка, стрелка пропадает, а не показывает цену в пустоту.
 */
export function TikkiMeterRow({
  unit,
  accent,
  onUpgradeClicker,
  onUpgradeWindow,
}: TikkiMeterRowProps) {
  const t = useAppTranslations();
  const capacity = tikkiCapacity(unit);
  const left = tikkiTimeToFullMs(unit);
  const windowMaxed = tikkiWindowHours(unit) >= tikkiMaxHours;

  const hours = Math.floor(left / 3_600_000);
  const minutes = Math.floor((left % 3_600_000) / 60_000);
  const countdown =
    left <= 0
      ? t('full')
      : hours > 0
        ? `${hours}${t('hour short')} ${String(minutes).padStart(2, '0')}${t('minute short')}`
        : `${minutes}${t('minute short')}`;

  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={onUpgradeClicker} className={twMerge(pill)}>
        <span>
          {formatCompact(Math.floor(unit.fill))}
          <span className="text-muted font-bold">/{formatCompact(capacity)}</span>
        </span>
        <ArrowUp size={12} strokeWidth={3} className="text-success" aria-hidden />
      </button>

      <TikkiFillBar
        fill={unit.fill}
        capacity={capacity}
        accent={accent}
        className="flex-available"
      />

      <button
        type="button"
        onClick={onUpgradeWindow}
        disabled={windowMaxed}
        className={twMerge(pill, windowMaxed && 'opacity-60')}
      >
        {countdown}
        {!windowMaxed && <ArrowUp size={12} strokeWidth={3} className="text-success" aria-hidden />}
      </button>
    </div>
  );
}
