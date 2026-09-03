'use client';

import Image from 'next/image';
import { twMerge } from 'tailwind-merge';
import { CoinIcon } from '@/components/shared/icons/CoinIcon';
import { tikkiImages } from './tikki.images';
import type { TikkiUnit } from '@/types/interfaces/tikki.interfaces';
import { tierAccentColors } from '@/constants/tier-colors';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { formatNumber } from '@/utils/global/number.utils';

export interface TikkiMergeCardProps {
  unit: TikkiUnit;
  checked: boolean;
  /** Какой по счёту отмечен — по этому числу читается, что уйдёт в сплав. */
  order: number;
  onToggle: () => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Карточка в отборе на сплав.
 *
 * Под каждым стоит доход в час — ровно то, что переедет в нового. Уровень
 * написан рядом, но решает не он: складываются цифры, а не уровни.
 */
export function TikkiMergeCard({
  unit,
  checked,
  order,
  onToggle,
  className,
  style,
}: TikkiMergeCardProps) {
  const t = useAppTranslations();
  const accent = tierAccentColors[unit.tier];

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={checked}
      className={twMerge(
        'relative flex flex-col items-center gap-1 rounded-2xl border p-2',
        'focus-visible:outline-teal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        checked ? 'bg-white/8' : 'border-white/10 bg-white/4',
        className
      )}
      style={{ borderColor: checked ? accent : undefined, ...style }}
    >
      <Image
        src={tikkiImages[unit.tier].idle}
        alt=""
        width={56}
        height={62}
        className="h-[62px] w-14 object-contain"
      />

      <span className="text-[11px] font-bold leading-none" style={{ color: accent }}>
        {t('level')} {unit.level}
      </span>
      <span className="flex items-center gap-1 text-[11px] font-extrabold tabular-nums leading-none">
        <CoinIcon size={12} />
        {formatNumber(unit.clickerPerHour)}
      </span>

      {checked && (
        <span className="bg-pink-gradient absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full text-[10px] font-extrabold">
          {order}
        </span>
      )}
    </button>
  );
}
