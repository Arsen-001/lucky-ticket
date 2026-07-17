import { appConfig } from '@/config/app.config';
import type { TicketType } from '@/types/types/ticket.types';

/**
 * Progression-economy derivations (DOCS §14.2) — every formula that turns the
 * `appConfig.economy` knobs into concrete prices and payback figures. The mock
 * market, the engine UI and the economy guardrail simulation
 * (`tests/economy-sim.test.ts`) all share these; the real backend must
 * implement the same math.
 */

/** Average LC a ticket of this tier returns in a tournament (house-edge rule). */
export const ticketEvLc = (tier: TicketType): number =>
  appConfig.economy.ticketPriceLcByTier[tier] / appConfig.economy.tournamentHouseEdgeMultiplier;

/** Tickets per day one base engine mints at perfect claims (no boosts). */
export const engineTicketsPerDay = (tier: TicketType): number =>
  86_400 / appConfig.engines.baseCycleSecondsByTier[tier];

/** LC value one base engine generates per day at perfect claims. */
export const engineDailyLcValue = (tier: TicketType): number =>
  engineTicketsPerDay(tier) * ticketEvLc(tier);

/**
 * LC price of the next engine of a tier given how many the user already owns —
 * geometric repeat-purchase pricing: `base × growth^owned` (DOCS §14.2).
 */
export const engineMarketPriceLc = (tier: TicketType, ownedCount: number): number =>
  Math.round(
    appConfig.economy.engineBasePriceLcByTier[tier] *
      Math.pow(appConfig.economy.engineRepeatPriceGrowth, Math.max(0, ownedCount))
  );

/** Days for the next engine of a tier to pay itself back at perfect claims. */
export const enginePaybackDays = (tier: TicketType, ownedCount = 0): number =>
  engineMarketPriceLc(tier, ownedCount) / engineDailyLcValue(tier);

/**
 * LS price equivalent of an LC amount at the USD anchors — the no-arbitrage
 * rule: an item must cost the same real value in either currency. Floored at
 * 1 LS: cheap LC items must never round down to a free (0 LS) price tag.
 */
export const lcPriceToLsParity = (lcAmount: number): number =>
  Math.max(1, Math.round((lcAmount * appConfig.wallet.lcUsdRate) / appConfig.wallet.lsUsdRate));

/**
 * Upgrade-price formula knobs — the admin-tunable shape served by `GET /config`
 * (`engines.upgrade`, hook `useEngineConfig`). Defaults to the bundled
 * `appConfig.economy.engineUpgrades` so plain calls (tests, mocks) keep working;
 * the server charges its own config-derived price regardless.
 */
export type EngineUpgradeKnobs = typeof appConfig.economy.engineUpgrades;

/**
 * LS cost of the speed upgrade from sub-`level` to `level + 1` on an engine of
 * `tier` at `engineLevel` (DOCS §10.1). Each engine level adds `perEngineLevel`
 * to the base price, then the whole cost scales by the tier multiplier
 * (Bronze ×1, Silver ×2, Gold ×3, Platinum ×4, Diamond ×5). For Bronze at the
 * default knobs → `level + engineLevel`: 1…10 at engine level 1, 5…14 at level 5.
 */
export const speedUpgradeLsCost = (
  level: number,
  engineLevel: number,
  tier: TicketType,
  knobs: EngineUpgradeKnobs = appConfig.economy.engineUpgrades
): number =>
  Math.round(
    (knobs.speedBase +
      level * knobs.perSubLevel +
      Math.max(0, engineLevel - 1) * knobs.perEngineLevel) *
      knobs.tierCostMultiplier[tier]
  );

/**
 * LS cost of the capacity upgrade from sub-`level` to `level + 1` on an engine of
 * `tier` at `engineLevel` (DOCS §10.2). Each engine level adds `perEngineLevel`
 * to the base price, then the whole cost scales by the tier multiplier
 * (Bronze ×1, Silver ×2, Gold ×3, Platinum ×4, Diamond ×5). For Bronze at the
 * default knobs → `level + engineLevel + 1`: 2…11 at engine level 1, 6…15 at level 5.
 */
export const capacityUpgradeLsCost = (
  level: number,
  engineLevel: number,
  tier: TicketType,
  knobs: EngineUpgradeKnobs = appConfig.economy.engineUpgrades
): number =>
  Math.round(
    (knobs.capacityBase +
      level * knobs.perSubLevel +
      Math.max(0, engineLevel - 1) * knobs.perEngineLevel) *
      knobs.tierCostMultiplier[tier]
  );
