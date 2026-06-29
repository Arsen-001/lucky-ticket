import { appConfig } from '@/config/app.config';

/** Round a TON amount to 4 dp to shake off float noise from `rate × n`. */
export const roundTon = (ton: number): number => Math.round(ton * 1e4) / 1e4;

/** TON amount → trimmed localized number, e.g. "1,860" or "0.8" (no symbol). */
export function formatTon(ton: number): string {
  return roundTon(ton).toLocaleString('en-US', { maximumFractionDigits: 2 });
}

/** Best-effort host for display; returns the raw string if it won't parse. */
export function urlHost(rawUrl: string): string {
  try {
    return new URL(rawUrl.trim()).hostname.replace(/^www\./, '');
  } catch {
    return rawUrl;
  }
}

/** Cost an advertiser pays to launch a sponsored tournament — every figure in TON. */
export interface SponsoredTournamentCost {
  /** Flat platform launch fee. */
  feeTon: number;
  /** Prize pool (LC) priced into TON via the wallet rates. */
  prizeTon: number;
  /** feeTon + prizeTon — debited at creation. */
  totalTon: number;
}

/**
 * Single source of truth for sponsored-tournament pricing (DOCS §11.8) — used by
 * both the live form preview AND the mock `create` handler. The advertiser pays
 * a flat launch fee plus the LC prize pool converted to TON (LC → USD → TON) and
 * marked up by `prizeFundingMultiplier` (coins cost more when funding a pool).
 */
export function computeSponsoredTournamentCost(prizePool: number): SponsoredTournamentCost {
  const { createFeeTon, prizeFundingMultiplier } = appConfig.partners.sponsoredTournament;
  const { lcUsdRate, tonUsdRate } = appConfig.wallet;

  const lc = Number.isFinite(prizePool) && prizePool > 0 ? Math.floor(prizePool) : 0;
  const prizeTon = roundTon(((lc * lcUsdRate) / tonUsdRate) * prizeFundingMultiplier);

  return { feeTon: createFeeTon, prizeTon, totalTon: roundTon(createFeeTon + prizeTon) };
}
