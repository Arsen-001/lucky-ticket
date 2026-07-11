import { useGetPublicConfigQuery } from '@/api/config.api';
import { appConfig } from '@/config/app.config';

/**
 * The advertiser-cabinet master switch from `GET /config` (admin-editable —
 * launching partners no longer needs a frontend redeploy). Falls back to the
 * bundled flag while loading or on an older backend. When false the partners
 * section renders in "coming soon" preview mode.
 */
export function usePartnersEnabled(): boolean {
  const { data } = useGetPublicConfigQuery();
  return data?.partnersEnabled ?? appConfig.partners.enabled;
}
