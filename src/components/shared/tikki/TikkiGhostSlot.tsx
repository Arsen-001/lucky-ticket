'use client';

import Image from 'next/image';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { TikkiTier } from './tikki.constants';
import { tikkiImages } from './tikki.images';
import { LongPressShield } from '@/components/shared/content-protection/LongPressShield';

export interface TikkiGhostSlotProps {
  tier: TikkiTier;
  onClick: () => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Пустое место в ленте — та же коробка 52×52, что у Тикки, только пунктиром и
 * с бледным силуэтом того тира, которого не хватает до сплава.
 *
 * С одним Тикки лента читалась как сирота и две кнопки через дыру. Призраки
 * до четырёх делают из неё стойку на четверых: видно и сколько есть, и сколько
 * нужно. Тап по призраку открывает покупку — это и есть его смысл.
 */
export function TikkiGhostSlot({ tier, onClick, className, style }: TikkiGhostSlotProps) {
  const t = useAppTranslations();

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={t('buy tikki')}
      data-testid="tikki-ghost"
      className={twMerge(
        'relative flex size-[52px] flex-none flex-col items-center justify-center gap-px rounded-[13px] px-0.5 py-1',
        'border-[1.5px] border-dashed border-white/16',
        'focus-visible:outline-teal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        className
      )}
      style={style}
    >
      <Image
        src={tikkiImages[tier].idle}
        alt=""
        width={28}
        height={30}
        className="h-[30px] w-7 object-contain opacity-22"
      />
      <span
        aria-hidden
        className="absolute end-1.5 top-1 text-[11px] font-extrabold leading-none text-[#7d7391]"
      >
        +
      </span>
      <LongPressShield />
    </button>
  );
}
