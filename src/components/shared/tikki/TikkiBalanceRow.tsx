'use client';

import { CoinIcon } from '@/components/shared/icons/CoinIcon';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { formatCompact, formatNumber } from '@/utils/global/number.utils';

export interface TikkiBalanceRowProps {
  balance: number;
  /** Пассив со всей коллекции — он идёт на счёт сам, забирать нечего. */
  perHour: number;
}

/**
 * Счёт и доход в час — ОДНОЙ строкой, через тонкую черту, ровно как в макете:
 * 26 px счёт, 19 px золотой приток, разделитель 1×20.
 *
 * Двумя этажами это занимало ~30 px в самом верху сцены, где стоит персонаж.
 * Слово «LC» не пишется нигде: впереди числа стоит монета, как на всех
 * остальных экранах.
 *
 * Крупные числа НЕ ломают строку: счёт мельчает по длине, а приток уходит в
 * компактную запись. У выкачанного алмазного счёт идёт на миллиарды, и на
 * 320 px строка вылезала за оба края экрана вместе с подписью «в час».
 */
export function TikkiBalanceRow({ balance, perHour }: TikkiBalanceRowProps) {
  const t = useAppTranslations();

  const whole = Math.floor(balance);
  const text = formatNumber(whole);
  const size = text.length > 13 ? 'text-[19px]' : text.length > 10 ? 'text-[22px]' : 'text-[26px]';

  return (
    <div>
      <div className="flex items-baseline justify-center gap-[11px] whitespace-nowrap">
        <span
          className={`flex items-baseline font-extrabold leading-none tracking-[-0.02em] tabular-nums ${size}`}
        >
          <CoinIcon size={18} className="me-[0.26em] self-center" />
          {text}
        </span>

        <span aria-hidden className="h-5 w-px flex-none self-center bg-white/14" />

        <span className="flex items-baseline gap-1">
          <span className="text-gold text-[15px] font-extrabold leading-none opacity-85">+</span>
          <CoinIcon size={16} className="self-center" />
          <span className="tikki-gold-text text-[19px] font-extrabold leading-[1.1] tracking-[-0.02em] tabular-nums">
            {formatCompact(Math.round(perHour))}
          </span>
          <span className="text-muted text-[9px] font-extrabold uppercase tracking-[0.09em]">
            {t('per hour')}
          </span>
        </span>
      </div>

      <div aria-hidden className="tikki-rule mb-[7px] mt-2" />
    </div>
  );
}
