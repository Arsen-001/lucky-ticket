import { useGetPublicConfigQuery } from '@/api/config.api';
import { appConfig } from '@/config/app.config';

/**
 * The live admin-controlled LC→USD rate (DOCS §6.1). Falls back to the bundled
 * anchor while the `GET /config` query is in flight or if it fails, so the
 * wallet estimate always renders — the backend stays authoritative on the
 * actual payout regardless.
 */
export function useLcUsdRate(): number {
  const { data } = useGetPublicConfigQuery();
  return data?.lcUsdRate ?? appConfig.wallet.lcUsdRate;
}
