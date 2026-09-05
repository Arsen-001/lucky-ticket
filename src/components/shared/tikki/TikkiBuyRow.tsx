'use client';

import Image from 'next/image';
import { twMerge } from 'tailwind-merge';
import { CoinIcon } from '@/components/shared/icons/CoinIcon';
import { tikkiImages } from './tikki.images';
import type { TikkiTier } from './tikki.constants';
import { tierAccentColors } from '@/constants/tier-colors';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { formatCompact, formatNumber } from '@/utils/global/number.utils';

export interface TikkiBuyRowProps {
  tier: TikkiTier;
  balance: number;
  /** Цена с сервера: та самая, по которой он и спишет. */
  price: number;
  /** Доход тира в час — тоже с сервера, не из констант. */
  perHour: number;
  onBuy: () => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Один тир в списке покупки: имя, доход в час, цена.
 *
 * 🔴 Срока окупаемости здесь НЕТ — и не должно быть нигде на экране игрока
 * (решение 05.09.2026). До того строка писала «окупится за 395 дней»: это
 * механика ценообразования (цена = доход в день × срок), а не то, что игроку
 * обещают. Сервер поле `buyPaybackDays` по-прежнему присылает — экран его не
 * читает.
 *
 * 🔴 Ни одно число здесь не считается на месте. Доход в час приезжает тем же
 * ответом, что и цена: база тира — ручка в панели, а подпись, посчитанная
 * константой, разошлась бы с ценой в ту же минуту, как её подвинут.
 */
export function TikkiBuyRow({
  tier,
  balance,
  price,
  perHour,
  onBuy,
  className,
  style,
}: TikkiBuyRowProps) {
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
          {t('{amount} per hour', { amount: formatNumber(perHour) })}
        </span>
      </span>

      <span className="flex flex-none items-center gap-1 text-sm font-extrabold tabular-nums">
        <CoinIcon size={15} />
        {formatCompact(price)}
      </span>
    </button>
  );
}
