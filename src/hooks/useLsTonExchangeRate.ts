import { useGetPublicConfigQuery } from '@/api/config.api';
import { appConfig } from '@/config/app.config';

/**
 * What one Lucky Star COSTS in USD when bought with TON (100 LS = $1.88), read
 * from `GET /config`. Not `lsUsdRate` — that is what an LS is WORTH, the anchor
 * the market prices items against; this is the sale price of the TON exchange
 * and is deliberately lower.
 *
 * The bundled value is only a fallback while the query is in flight or if it
 * fails, and an older backend that doesn't serve the field falls back to it
 * too — quoting the exchange from a hardcoded copy means the preview silently
 * stops matching the charge the day the price moves.
 */
export function useLsTonExchangeRate(): number {
  const { data } = useGetPublicConfigQuery();
  return data?.lsTonExchangeUsdRate ?? appConfig.wallet.lsTonExchangeUsdRate;
}
