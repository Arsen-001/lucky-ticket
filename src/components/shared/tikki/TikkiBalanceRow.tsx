'use client';

import { CoinIcon } from '@/components/shared/icons/CoinIcon';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { formatNumber } from '@/utils/global/number.utils';

export interface TikkiBalanceRowProps {
  balance: number;
  /** Пассив со всей коллекции — он идёт на счёт сам, забирать нечего. */
  perHour: number;
}

/**
 * Счёт и доход в час — ОДНОЙ строкой, через тонкую черту.
 *
 * Двумя этажами это занимало ~30 px в самом верху сцены, где стоит персонаж.
 * Слово «LC» не пишется нигде: впереди числа стоит монета, как на всех
 * остальных экранах.
 */
export function TikkiBalanceRow({ balance, perHour }: TikkiBalanceRowProps) {
  const t = useAppTranslations();

  return (
    <div className="flex items-baseline justify-center gap-3 whitespace-nowrap">
      <span className="flex items-baseline gap-1.5 text-[26px] font-extrabold tabular-nums leading-none">
        <CoinIcon size={22} className="translate-y-0.5" />
        {formatNumber(Math.floor(balance))}
      </span>

      <span aria-hidden className="h-5 w-px self-center bg-white/15" />

      <span className="text-gold flex items-baseline gap-1 text-[19px] font-extrabold tabular-nums leading-none">
        +
        <CoinIcon size={16} className="translate-y-0.5" />
        {formatNumber(Math.round(perHour))}
        <span className="text-muted text-[11px] font-bold uppercase tracking-wide">
          {t('per hour')}
        </span>
      </span>
    </div>
  );
}
