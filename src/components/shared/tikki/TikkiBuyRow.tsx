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
 * 🔴 Строка живая ПРИ ЛЮБОМ счёте. До 05.09.2026 при нехватке она была
 * `disabled`: пять тусклых строк и мёртвый тап, и на проде это прочли как
 * «покупка не работает» — сервер за шесть часов не увидел ни одного
 * `POST /tikki/buy`, потому что нажать было некуда (счёт 238 979 против цены
 * 418 700). Теперь недоступный тир пишет, сколько не хватает, красит цену в
 * красный, а тап по нему открывает «Недостаточно LC» с выходом в турниры — то
 * решает родитель, строке достаточно позвать `onBuy`.
 *
 * 🔴 Срока окупаемости здесь НЕТ — и не должно быть нигде на экране игрока
 * (решение 05.09.2026): это механика ценообразования, а не обещание. Сервер
 * поле `buyPaybackDays` по-прежнему присылает — экран его не читает.
 *
 * 🔴 Ни одно число здесь не считается на месте, кроме недостачи «цена минус
 * счёт». Доход в час приезжает тем же ответом, что и цена: база тира — ручка
 * в панели, а подпись, посчитанная константой, разошлась бы с ценой в ту же
 * минуту, как её подвинут.
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
  const short = Math.max(0, Math.round(price - balance));

  return (
    <button
      type="button"
      onClick={onBuy}
      className={twMerge(
        'flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/4 p-2.5 text-left',
        'focus-visible:outline-teal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
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
        {!affordable && (
          <span className="text-error-text text-[11px] font-semibold leading-tight">
            {t('not enough by {amount}', { amount: formatNumber(short) })}
          </span>
        )}
      </span>

      <span
        className={twMerge(
          'flex flex-none items-center gap-1 text-sm font-extrabold tabular-nums',
          !affordable && 'text-error-text'
        )}
      >
        <CoinIcon size={15} />
        {formatCompact(price)}
      </span>
    </button>
  );
}
