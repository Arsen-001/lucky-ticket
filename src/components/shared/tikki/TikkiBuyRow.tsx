'use client';

import Image from 'next/image';
import { twMerge } from 'tailwind-merge';
import { CoinIcon } from '@/components/shared/icons/CoinIcon';
import { tikkiImages } from './tikki.images';
import { tikkiBuyPaybackDays, type TikkiTier } from './tikki.constants';
import { tikkiTierBase } from './tikki.utils';
import { tierAccentColors } from '@/constants/tier-colors';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { formatCompact, formatNumber } from '@/utils/global/number.utils';

export interface TikkiBuyRowProps {
  tier: TikkiTier;
  balance: number;
  /** Цена с сервера: та самая, по которой он и спишет. */
  price: number;
  onBuy: () => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Один тир в списке покупки.
 *
 * Срок окупаемости написан у каждого, и он у всех пяти одинаковый: старший тир
 * не выгоднее младшего, он просто крупнее. Без этой строки лестница читается
 * как «копи на алмаз», хотя копить на него ровно так же долго.
 */
export function TikkiBuyRow({ tier, balance, price, onBuy, className, style }: TikkiBuyRowProps) {
  const t = useAppTranslations();
  const affordable = balance >= price;

  return (
    <button
      type="button"
      onClick={onBuy}
      disabled={!affordable}
      className={twMerge(
        'flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/4 p-2.5 text-left',
        'focus-visible:outline-teal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        !affordable && 'opacity-45',
        className
      )}
      style={style}
    >
      <Image
        src={tikkiImages[tier].idle}
        alt=""
        width={40}
        height={44}
        className="h-11 w-10 flex-none object-contain"
      />

      <span className="flex flex-available flex-col gap-0.5">
        <span className="text-sm font-bold capitalize" style={{ color: tierAccentColors[tier] }}>
          {t(tier)}
        </span>
        <span className="text-muted text-[11px] leading-tight">
          {t('{amount} per hour, pays back in {days} days', {
            amount: formatNumber(tikkiTierBase(tier)),
            days: tikkiBuyPaybackDays,
          })}
        </span>
      </span>

      <span className="flex flex-none items-center gap-1 text-sm font-extrabold tabular-nums">
        <CoinIcon size={15} />
        {formatCompact(price)}
      </span>
    </button>
  );
}
