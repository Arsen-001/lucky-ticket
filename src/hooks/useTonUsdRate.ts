import { useGetPublicConfigQuery } from '@/api/config.api';
import { appConfig } from '@/config/app.config';

/**
 * The TON→USD rate the backend prices with, read from `GET /config`. The
 * bundled anchor is only a fallback while the query is in flight or if it
 * fails — quoting an exchange from a hardcoded copy of a number the backend
 * owns means the preview silently stops matching the charge the day it moves.
 */
export function useTonUsdRate(): number {
  const { data } = useGetPublicConfigQuery();
  return data?.tonUsdRate ?? appConfig.wallet.tonUsdRate;
}
