import { appConfig } from '@/config/app.config';
import type { PublicConfig } from '@/types/interfaces/config.interfaces';

/**
 * Public economy anchors (`GET /config`). In mock mode these come straight from
 * the local `appConfig.wallet` constants — the real backend serves the same
 * shape, with `lcUsdRate` overridable from the admin panel.
 */
const getPublicConfig = (): PublicConfig => ({
  lcUsdRate: appConfig.wallet.lcUsdRate,
  tonUsdRate: appConfig.wallet.tonUsdRate,
  lsUsdRate: appConfig.wallet.lsUsdRate,
});

export const configMock = {
  config: getPublicConfig,
};
