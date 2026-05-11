'use client';

import Image from 'next/image';
import { twMerge } from 'tailwind-merge';
import { GlobalConstants } from '@/constants/global.constants';
import { icons } from '@/constants/icons';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { MarketPriceType } from '@/types/enums/market.enums';
import type { MarketPrice } from '@/types/interfaces/market.interfaces';

export interface SettingsStatusPriceRowProps {
  prices: MarketPrice[];
  label?: string;
  className?: string;
}

export function SettingsStatusPriceRow({ prices, label, className }: SettingsStatusPriceRowProps) {
  const t = useAppTranslations();

  if (!prices.length) return null;

  return (
    <div className={twMerge('flex flex-col gap-2', className)}>
      {label && (
        <span className="text-white/40 text-[11px] font-bold uppercase tracking-wider">
          {label}
        </span>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {prices.map(price => (
          <div
            key={price.type}
            className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5"
          >
            <span className="text-sm font-bold tabular-nums text-white">{price.amount}</span>
            {price.type === MarketPriceType.LTC && (
              <span className="text-gold text-xs font-bold">{GlobalConstants.coinName}</span>
            )}
            {price.type === MarketPriceType.TELEGRAM_STARS && (
              <Image src={icons.telegramStar} alt={t('stars')} width={14} height={14} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
