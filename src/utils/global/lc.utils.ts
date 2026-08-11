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

/**
 * The same quote read backwards: LC needed to reach `ton`. The wallet's convert
 * modal takes input on both sides, and the TO side needs this — a player asking
 * "how much is 1 TON?" should not have to search for it by trying LC amounts.
 *
 * **Rounded up, and that is the whole point.** LC is a whole unit, so the exact
 * answer rarely lands on one; rounding down would quote a price one LC short of
 * the TON that was asked for, and `lcToTon` of the result would print less than
 * the number the player typed. Rounding up keeps the round trip ≥ the request,
 * which is the direction that cannot disappoint. `tests/lc-ton-roundtrip.test.ts`
 * pins it against `lcToTon` so the pair cannot drift apart.
 */
export const tonToLc = (
  ton: number,
  lcUsdRate: number = defaultLcUsdRate,
  tonUsdRate: number = defaultTonUsdRate
): number => Math.ceil((ton * tonUsdRate) / lcUsdRate);
