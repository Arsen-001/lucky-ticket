import { appConfig } from '@/config/app.config';

const { lcUsdRate, tonUsdRate } = appConfig.wallet;

/** USD value of an LC amount. */
export const lcToUsd = (lc: number): number => lc * lcUsdRate;

/**
 * TON value of an LC amount — LC is priced in USD, then converted at the live
 * TON→USD rate. This is the LC → TON conversion rate used by the wallet (DOCS §15).
 */
export const lcToTon = (lc: number): number => lcToUsd(lc) / tonUsdRate;
