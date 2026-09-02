'use client';

import Image from 'next/image';
import { twMerge } from 'tailwind-merge';
import { tierAccentColors } from '@/constants/tier-colors';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { TikkiUnit } from './tikki.constants';
import { tikkiImages } from './tikki.images';

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
 * Один Тикки в ленте коллекции — карточка 52×52 из макета.
 *
 * Больше в неё ничего не влезает, поэтому под картинкой стоит уровень: он
 * короткий на любом тире. Доход в час и всё остальное игрок читает на сцене,
 * подвезя карточку в центр.
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

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      aria-label={`${t(unit.tier)} · ${t('level')} ${unit.level}`}
      className={twMerge(
        'relative flex size-[52px] flex-none flex-col items-center justify-center gap-px rounded-[13px] px-0.5 py-1',
        'focus-visible:outline-teal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        active ? 'bg-white/8' : 'bg-white/4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]',
        className
      )}
      style={{
        ...(active ? { boxShadow: `inset 0 0 0 1.5px ${accent}, 0 0 18px -6px ${accent}` } : null),
        ...style,
      }}
    >
      <Image
        src={tikkiImages[unit.tier].idle}
        alt=""
        width={28}
        height={30}
        className="h-[30px] w-7 object-contain"
      />
      <span
        className="text-[9px] font-extrabold leading-none tabular-nums"
        style={{ color: accent }}
      >
        {unit.level}
      </span>

      {full && (
        <span
          aria-label={t('tikki is full')}
          className="absolute end-1 top-1 size-2 rounded-full bg-[linear-gradient(180deg,#ffe6a3,#f8bd3e)] shadow-[0_0_0_1.5px_rgba(27,25,48,0.95),0_0_7px_rgba(248,189,62,0.75)]"
        />
      )}
    </button>
  );
}
