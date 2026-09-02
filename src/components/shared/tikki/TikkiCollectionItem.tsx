'use client';

import Image from 'next/image';
import { twMerge } from 'tailwind-merge';
import { tikkiImages } from './tikki.images';
import type { TikkiUnit } from './tikki.constants';
import { tikkiClickerRate, tikkiPassiveRate } from './tikki.utils';
import { tierAccentColors } from '@/constants/tier-colors';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { formatCompact } from '@/utils/global/number.utils';

export interface TikkiCollectionItemProps {
  unit: TikkiUnit;
  active: boolean;
  /** Кликер полон — доход встал, и это должно быть видно, не открывая Тикки. */
  full: boolean;
  onSelect: () => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Один Тикки в ленте коллекции.
 *
 * Под картинкой стоит доход в час, а не уровень: у сплавленного уровень первый,
 * а даёт он больше любого выкачанного из тех, кого в него положили — уровнем
 * коллекция не сравнивается.
 */
export function TikkiCollectionItem({
  unit,
  active,
  full,
  onSelect,
  className,
  style,
}: TikkiCollectionItemProps) {
  const t = useAppTranslations();
  const accent = tierAccentColors[unit.tier];
  const perHour = tikkiClickerRate(unit) + tikkiPassiveRate(unit);

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      aria-label={`${t(unit.tier)} · ${t('level')} ${unit.level}`}
      className={twMerge(
        'relative flex w-[74px] flex-none flex-col items-center gap-1 rounded-2xl border px-1.5 pb-1.5 pt-2',
        'focus-visible:outline-teal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        active ? 'bg-white/8' : 'border-white/10 bg-white/4',
        className
      )}
      style={{ borderColor: active ? accent : undefined, ...style }}
    >
      <Image
        src={tikkiImages[unit.tier].idle}
        alt=""
        width={44}
        height={48}
        className="h-12 w-11 object-contain"
      />
      <span
        className="text-[10px] font-extrabold tabular-nums leading-none"
        style={{ color: accent }}
      >
        {formatCompact(perHour)}
      </span>

      {full && (
        <span
          aria-label={t('tikki is full')}
          className="bg-gold absolute right-1.5 top-1.5 size-2 rounded-full"
        />
      )}
    </button>
  );
}
