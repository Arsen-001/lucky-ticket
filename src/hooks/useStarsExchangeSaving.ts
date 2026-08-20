'use client';

import { useGetPublicConfigQuery } from '@/api/config.api';
import { appConfig } from '@/config/app.config';

export interface StarsExchangeSaving {
  /** How much cheaper the TON exchange is than paying Telegram, in percent. */
  percent: number;
  /** USD the exchange charges for 100 Lucky Stars. */
  exchangeUsdPer100: number;
  /** USD the same 100 cost as Telegram Stars. */
  telegramUsdPer100: number;
}

/**
 * What the TON exchange saves against buying Stars inside Telegram.
 *
 * Two published numbers, not one: `lsTonExchangeUsdRate` is the SALE price of a
 * Lucky Star bought with TON ($0.0179 → $1.79 per 100), `lsUsdRate` is what one
 * is worth — and it is exactly what Telegram charges for the star that buys it
 * ($0.02 → $2.00 per 100). The gap between them is the discount, so it is
 * derived here rather than typed into copy: the admin moves the sale price, and
 * a hardcoded «−10%» would go on claiming yesterday's saving.
 *
 * Returns 0 when the exchange is not actually cheaper — the screen then says
 * nothing instead of advertising a discount that isn't there.
 */
export function useStarsExchangeSaving(): StarsExchangeSaving {
  const { data } = useGetPublicConfigQuery();
  const exchange = data?.lsTonExchangeUsdRate ?? appConfig.wallet.lsTonExchangeUsdRate;
  const telegram = data?.lsUsdRate ?? appConfig.wallet.lsUsdRate;

  const percent =
    telegram > 0 && exchange > 0 && exchange < telegram
      ? Math.round((1 - exchange / telegram) * 100)
      : 0;

  return {
    percent,
    exchangeUsdPer100: exchange * 100,
    telegramUsdPer100: telegram * 100,
  };
}
