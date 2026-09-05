'use client';

import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { formatCompact } from '@/utils/global/number.utils';
import type { TikkiUnit } from '@/types/interfaces/tikki.interfaces';
import { formatTikkiCountdown, tikkiMsToFull } from './tikki.countdown';
import { TikkiFillBar } from './TikkiFillBar';

export interface TikkiMeterRowProps {
  unit: TikkiUnit;
  onUpgradeClicker: () => void;
  onUpgradeWindow: () => void;
  className?: string;
}

const pill =
  'flex flex-none items-center gap-[5px] rounded-full px-[11px] py-[5px] text-[11px] ' +
  'font-extrabold leading-none tabular-nums whitespace-nowrap bg-white/5 ' +
  'shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)] ' +
  'focus-visible:outline-teal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2';

/**
 * Полоса кликера с двумя точками прокачки по краям — 11 px, пилюли по бокам.
 *
 * Слева — сколько лежит из того, что влезает: это уровень кликера, он двигает
 * оба числа сразу. Справа — сколько осталось до полной: это окно. Когда любая
 * из лестниц кончается, стрелка пропадает, а не показывает цену в пустоту.
 */
export function TikkiMeterRow({
  unit,
  onUpgradeClicker,
  onUpgradeWindow,
  className,
}: TikkiMeterRowProps) {
  const t = useAppTranslations();
  const capacity = unit.capacity;
  // До полной — по тому же числу, которым нарисована полоса, иначе цифра и
  // полоса расходятся на глазах. Формат общий с репликой Тикки.
  const countdown = formatTikkiCountdown(tikkiMsToFull(unit), t);
  // `null` в цене значит «лестница кончилась», а не «нет денег»: стрелки нет.
  const windowMaxed = unit.cost.window === null;
  const levelMaxed = unit.cost.clicker === null;

  return (
    <div className={twMerge('flex items-center gap-2', className)}>
      <button
        type="button"
        onClick={onUpgradeClicker}
        disabled={levelMaxed}
        aria-label={t('clicker level')}
        className={twMerge(pill, 'text-white', levelMaxed && 'opacity-70')}
      >
        <span>
          {formatCompact(Math.floor(unit.fill))}
          <span className="text-muted">/{formatCompact(capacity)}</span>
        </span>
        {!levelMaxed && (
          <span aria-hidden className="text-[#2f7a5c]">
            ↑
          </span>
        )}
      </button>

      <TikkiFillBar fill={unit.fill} capacity={capacity} className="flex-available" />

      <button
        type="button"
        onClick={onUpgradeWindow}
        disabled={windowMaxed}
        aria-label={t('window')}
        className={twMerge(pill, 'text-muted font-bold', windowMaxed && 'opacity-70')}
      >
        {countdown}
        {!windowMaxed && (
          <span aria-hidden className="text-[#2f7a5c]">
            ↑
          </span>
        )}
      </button>
    </div>
  );
}
