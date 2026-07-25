import { appConfig } from '@/config/app.config';

const { lcUsdRate: defaultLcUsdRate, tonUsdRate: defaultTonUsdRate } = appConfig.wallet;

/**
 * USD value of an LC amount. `lcUsdRate` is admin-controllable (DOCS §6.1) — the
 * live value from `GET /config` should be passed in; it defaults to the bundled
 * anchor so pure/SSR callers stay correct without the query.
 */
export const lcToUsd = (lc: number, lcUsdRate: number = defaultLcUsdRate): number => lc * lcUsdRate;

/**
 * TON value of an LC amount — LC is priced in USD, then converted at the TON→USD
 * rate. This is the LC → TON conversion the wallet quotes (DOCS §15). Both rates
 * are live values from `GET /config` (see `useLcUsdRate` / `useTonUsdRate`); the
 * bundled anchors are fallbacks so pure/SSR callers stay correct without them.
 */
export const lcToTon = (
  lc: number,
  lcUsdRate: number = defaultLcUsdRate,
  tonUsdRate: number = defaultTonUsdRate
): number => lcToUsd(lc, lcUsdRate) / tonUsdRate;
