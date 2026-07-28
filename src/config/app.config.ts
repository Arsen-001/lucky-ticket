import type { StakeLevelDefinition } from '@/types/interfaces/stakes.interfaces';
import type { StarsPackage, SupportedWallet } from '@/types/interfaces/wallet.interfaces';
import { WalletProvider } from '@/types/enums/wallet.enums';

/**
 * Single source of truth for business / config values across the app.
 *
 * Both the mock "backend" (`src/mock/*`) and the UI read from here — change a
 * value once and it propagates everywhere. Add a new domain section as each
 * domain is migrated onto this config. Migrated domains: `stakes`, `wallet`.
 */

const stakeLevels: StakeLevelDefinition[] = [
  { level: 1, minDeposit: 10_000, tier: 'bronze', completionStarsPerMonth: 2 },
  { level: 2, minDeposit: 50_000, tier: 'silver', completionStarsPerMonth: 3 },
  { level: 3, minDeposit: 100_000, tier: 'gold', completionStarsPerMonth: 4 },
  { level: 4, minDeposit: 250_000, tier: 'platinum', completionStarsPerMonth: 5 },
  { level: 5, minDeposit: 500_000, tier: 'diamond', completionStarsPerMonth: 6 },
];

const supportedWallets: SupportedWallet[] = [
  { provider: WalletProvider.TONKEEPER, name: 'Tonkeeper', iconBg: '#0098EA', emoji: 'TK' },
  { provider: WalletProvider.MYTONWALLET, name: 'MyTonWallet', iconBg: '#3B6FE3', emoji: 'MT' },
  {
    provider: WalletProvider.TELEGRAM_WALLET,
    name: 'Telegram Wallet',
    iconBg: '#229ED9',
    emoji: 'TG',
  },
  { provider: WalletProvider.TONHUB, name: 'Tonhub', iconBg: '#7C5CFF', emoji: 'TH' },
];

/** Bundled TON→USD anchor — a fallback only; the live rate comes from `GET /config`. */
const FALLBACK_TON_USD_RATE = 1.5;

/**
 * Fallback catalog for the mock layer — the real one comes from
 * `GET /wallet/stars-packages`, priced off the live TON feed. The TON cost is
 * the fixed attribute (hence the ids); the stars are derived here the same way
 * the backend derives them, so the mock can't drift into quoting a count no
 * rate produces. Ids used to be `pkg_171`… — the star counts at the retired
 * 3.42 anchor.
 */
const STARS_USD_ANCHOR = 0.02;
const starsPackages: StarsPackage[] = (
  [
    { id: 'pkg_ton_1', tonCost: 1 },
    { id: 'pkg_ton_5', tonCost: 5, bonusPercent: 5, popular: true },
    { id: 'pkg_ton_10', tonCost: 10, bonusPercent: 10 },
    { id: 'pkg_ton_50', tonCost: 50, bonusPercent: 15 },
  ] as Omit<StarsPackage, 'stars'>[]
).map(pkg => ({
  ...pkg,
  stars: Math.round(
    ((pkg.tonCost * FALLBACK_TON_USD_RATE) / STARS_USD_ANCHOR) * (1 + (pkg.bonusPercent ?? 0) / 100)
  ),
}));

/**
 * Where this deployment is reachable from the outside — the origin every
 * absolute URL the app hands to a third party is built on (social-card and
 * icon URLs in `metadata`, the TON Connect manifest a wallet fetches). Relative
 * paths are not an option there: the consumer is not a browser on our page.
 *
 * Vercel exposes the production domain at build time; the explicit env var
 * wins so a custom domain can be pointed at without a code change, and the
 * literal is the last resort for a plain `next build` outside Vercel.
 */
const publicOrigin = (() => {
  // `??` is not enough: a var declared-but-empty in `.env` reads as `''`, and
  // `new URL('')` throws — an empty value has to mean "unset", not "no origin".
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit;

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel}`;

  return 'https://lucky-ticket-nu.vercel.app';
})();

export const appConfig = {
  /** @see publicOrigin */
  publicOrigin,

  stakes: {
    /** Bounds of the duration slider on the "new stake" screen (months). */
    durationMinMonths: 1,
    durationMaxMonths: 12,
    /**
     * Total-period yield rate mapped across the duration slider (percent).
     * Tuned so parking LC in a long stake stays competitive once the player's
     * marginal engine payback (geometric repeat pricing, DOCS §14.2) has
     * decayed past the early game.
     */
    aprMinPercent: 3,
    aprMaxPercent: 10,
    /** Divisor in the stake AP formula: `deposit × months ÷ apDivisor` (DOCS §5.3 / §18.3). */
    apDivisor: 5_000,
    /** Bonus added to the stake AP base when it completes (forfeited on cancel). */
    apCompletionBonusPercent: 50,
    /** LC required to add 1 ⭐ to the base stake fee (`base = ceil(deposit / feeStep)`). */
    feeStep: 10_000,
    /** Discount % per stake month — applied to the base fee. */
    feeMonthDiscountPercent: 1,
    /**
     * Volume-discount brackets applied on top of the month discount. The user
     * gets the percent of the largest bracket whose `threshold` they meet.
     * Lucky Player holders get the boosted set.
     */
    feeVolumeDiscount: {
      default: [
        { threshold: 100_000, percent: 10 },
        { threshold: 250_000, percent: 12 },
        { threshold: 500_000, percent: 15 },
        { threshold: 1_000_000, percent: 20 },
      ],
      luckyPlayer: [
        { threshold: 100_000, percent: 20 },
        { threshold: 250_000, percent: 22 },
        { threshold: 500_000, percent: 25 },
        { threshold: 1_000_000, percent: 30 },
      ],
    },
    /** Stake fee never drops below this floor (in Stars). */
    feeMinStars: 1,
    /** Cancel fee never drops below this floor (in Stars). */
    cancelFeeMinStars: 2,
    /** Cancel fee = `cancelFeeMultiplier × base` (no discounts). */
    cancelFeeMultiplier: 2,
    /** First N stakes opened at the Bronze tier are free (cancel fee still applies). */
    bronzeFreeStartCount: 10,
    /** Stake tier definitions — deposit thresholds + bonus-draw values. */
    levels: stakeLevels,
  },
  engines: {
    /**
     * Base cycle time (seconds) for a freshly-purchased engine at engineLevel=1
     * with no chips/boosters and capacityLevel=0 — i.e. the time to mint 1
     * ticket of that tier. Geometric: each tier doubles the previous one.
     */
    baseCycleSecondsByTier: {
      bronze: 7_200, // 2h
      silver: 14_400, // 4h
      gold: 28_800, // 8h
      platinum: 57_600, // 16h
      diamond: 115_200, // 32h
    },
  },
  /**
   * Progression-economy knobs (DOCS §14.2) — the single source of truth for
   * every LC price ladder and growth curve. The mock market and the economy
   * guardrail simulation (`tests/economy-sim.test.ts`) both read from here;
   * the real backend must implement the same formulas. Derivation helpers live
   * in `src/utils/global/economy.utils.ts`.
   */
  economy: {
    /**
     * House edge on the ticket money loop: a Market ticket costs this multiple
     * of the average LC it returns in a tournament (`EV = price ÷ multiplier`).
     * Keeps bought tickets EV-negative; engine-produced tickets are the free roll.
     */
    tournamentHouseEdgeMultiplier: 1.5,
    /** Market LC ticket prices per tier (~×2.5 ladder). */
    ticketPriceLcByTier: {
      bronze: 6_000,
      silver: 15_000,
      gold: 37_500,
      platinum: 90_000,
      diamond: 225_000,
    },
    /**
     * Fixed Lucky-Stars ticket prices — a flat 1⭐→5⭐ by-tier ladder,
     * deliberately OFF LC parity (product decision). Tickets keep their LC
     * economy price; only the Stars alternative is this fixed ladder. Mirrors
     * the backend `MARKET_TICKET_STAR_PRICES`. (Engines stay on LS parity.)
     */
    ticketPriceStarsByTier: {
      bronze: 1,
      silver: 2,
      gold: 3,
      platinum: 4,
      diamond: 5,
    },
    /**
     * LC price of the FIRST engine of each tier. Tuned so first-purchase
     * payback (price ÷ daily LC value at perfect claims) rises gently with the
     * tier: ≈4 / 6 / 9 / 13 / 20 days — progression up the tiers stays
     * rewarding, never a trap.
     */
    engineBasePriceLcByTier: {
      bronze: 200_000,
      silver: 360_000,
      gold: 675_000,
      platinum: 1_170_000,
      diamond: 2_250_000,
    },
    /**
     * Geometric repeat-purchase pricing: the n-th engine of a tier costs
     * `base × growth^(n-1)`. This is the core anti-inflation valve — it turns
     * exponential engine-spam growth into logarithmic growth and makes the
     * next tier's first engine the rational buy after ~3 repeats of the
     * previous tier.
     */
    engineRepeatPriceGrowth: 1.6,
    /**
     * LS cost of the permanent per-engine upgrades (paid in Lucky Stars). Cost
     * rises with the boost sub-level AND the engine level, then scales by tier —
     * each engine level adds `perEngineLevel` to every price, and the whole cost
     * is multiplied by `tierCostMultiplier[tier]`:
     *   speed    = (speedBase    + subLevel × perSubLevel + (engineLevel − 1) × perEngineLevel) × tierMult
     *   capacity = (capacityBase + subLevel × perSubLevel + (engineLevel − 1) × perEngineLevel) × tierMult
     * Bronze (mult 1) at the default knobs: level-1 engine → speed 1…10,
     * capacity 2…11; level-5 engine → speed 5…14, capacity 6…15. Full max of one
     * Bronze engine (all 5 levels, 100 upgrades) = 800 LS; higher tiers cost that
     * × their multiplier (Silver 1,600 / Gold 3,200 / Platinum 6,400 / Diamond 12,800 LS).
     */
    engineUpgrades: {
      speedBase: 1,
      capacityBase: 2,
      perSubLevel: 1,
      perEngineLevel: 1,
      /**
       * Per-tier cost multiplier on the whole upgrade price — every tier is
       * DOUBLE the previous one (product rule): Silver ×2 Bronze, Gold ×2
       * Silver, Platinum ×2 Gold, Diamond ×2 Platinum → 1/2/4/8/16.
       */
      tierCostMultiplier: {
        bronze: 1,
        silver: 2,
        gold: 4,
        platinum: 8,
        diamond: 16,
      },
    },
    /**
     * Guards on the LC → TON exit (backend-enforced). The conversion fee and
     * the daily withdrawal cap are the hard bound on real-money outflow no
     * matter how the internal LC faucet is tuned.
     */
    lcConversion: {
      feePercent: 15,
      dailyCapUsd: 10,
    },
  },
  wallet: {
    /**
     * Fallback TON→USD anchor. The live value comes from `GET /config`
     * (`useTonUsdRate`), which the backend prices with; this is only used
     * before that query resolves or if it fails, so it tracks the market
     * loosely rather than being authoritative.
     */
    tonUsdRate: FALLBACK_TON_USD_RATE,
    /** Flat TON network fee charged on a withdrawal. */
    withdrawFeeTon: 0.05,
    /**
     * Fallback minimum for an LC→TON conversion. The live value is served by
     * `GET /config` (see `useWalletLimits`) — the backend rejects anything
     * below it, so the form must validate against the same number.
     */
    minWithdrawLc: 10_000,
    /** USD value of one LC — used to price the LC → TON conversion (DOCS §6.1): $1 = 1,000,000 LC. */
    lcUsdRate: 0.000001,
    /** USD anchor of one Lucky Star (LS) — the Stars packages are priced off it. */
    lsUsdRate: 0.02,
    /**
     * Fallback invite gate on binding a wallet: how many friends a player must
     * have invited before TON Connect is offered. The live value is served with
     * the wallet state (`walletConfig.connectMinReferrals`, admin-editable) and
     * the backend enforces it — this only feeds the mock layer and the copy
     * shown before that query resolves.
     */
    connectMinReferrals: 3,
    /** Wallet apps the user can connect. */
    supportedWallets,
    /** Stars purchase packages — price catalog. */
    starsPackages,
    /**
     * Public URL of the TON Connect manifest (served from `public/`). Wallets
     * fetch it to show the app name/icon in the connect sheet. Must be an
     * absolute HTTPS URL reachable by wallets; the manifest's own `url` field
     * is also the domain the backend checks in `ton_proof`. Override per
     * deployment via `NEXT_PUBLIC_TONCONNECT_MANIFEST_URL`.
     */
    tonConnectManifestUrl:
      process.env.NEXT_PUBLIC_TONCONNECT_MANIFEST_URL ?? `${publicOrigin}/tonconnect-manifest.json`,
  },
  onboardingTour: {
    /**
     * Master switch for the first-run guided tour. When `false` the tour never
     * auto-starts — so you can test the whole app freely — but the manual
     * "replay" entry in Settings still works regardless of this flag.
     */
    autoStart: true,
    /**
     * Free starter gifts granted when the player claims them after the first-run
     * language step. One Bronze engine is always part of the pack (built in
     * `engines.api`); these are the additional amounts.
     */
    welcomePack: { bronzeTickets: 5, activityPoints: 1 },
  },
  jackpot: {
    /**
     * Percent of EVERY tournament's prize pool skimmed into the single global
     * jackpot pot (DOCS §20). This is an EV-neutral redistribution — no new LC
     * is minted; the skim is paid back out when the pot drops, so the house
     * edge (DOCS §14) is preserved.
     */
    accrualPercent: 10,
    /**
     * When the pot drops, this percent is split EQUALLY among ALL participants
     * as a consolation. **0 by default** — the jackpot pays the top-3 ONLY, so a
     * real player parked deep in the fake field (267/500) can't win it. Mirrors
     * the backend `JACKPOT.participantsSharePercent`; raising it (admin-tunable)
     * re-enables the consolation spread. Display-only anchor — the backend
     * `GET /config` value is authoritative.
     */
    participantsSharePercent: 0,
    /** The remaining percent of the dropped pot, paid to the top-3 podium. */
    podiumSharePercent: 100,
    /**
     * How the podium share splits across 1st / 2nd / 3rd (percent OF the podium
     * share). Whole-pot equivalents (via `getJackpotWholePotSplit`) at the
     * default: 1st 50%, 2nd 30%, 3rd 20%.
     */
    podiumSplitPercent: { first: 50, second: 30, third: 20 },
  },
  leaderboard: {
    /**
     * Master switch for the public leaderboard (DOCS §16). When `false` the drawer
     * entry, the profile card and the board itself render locked ("opens after the
     * test period") — a ranking over a handful of closed-beta testers would read as
     * the real standings. Bundled fallback only: `GET /config`'s `leaderboardEnabled`
     * wins, so the launch is an admin toggle, not a redeploy.
     */
    enabled: false,
  },
  partners: {
    /**
     * Master switch for the advertiser (sponsor) cabinet. When `false` it renders
     * in "preview" mode: the dashboard + create form are browsable on demo data,
     * but a "coming soon" banner sits on top and submitting surfaces a Coming Soon
     * toast instead of creating. Flip to `true` to make it live.
     */
    enabled: false,
    /** Page size for the advertiser's "my tournaments" list. */
    listPageSize: 5,
    /**
     * "Create sponsored tournament" builder (DOCS §11.8) — bounds + the
     * advertiser's cost. The advertiser pays a flat launch fee and funds the LC
     * prize pool (priced into TON via `wallet.lcUsdRate` / `wallet.tonUsdRate`).
     */
    sponsoredTournament: {
      /** Flat platform fee to launch a sponsored tournament, in TON. */
      createFeeTon: 50,
      /**
       * Markup on the LC prize pool when funding a tournament — the advertiser
       * pays this multiple of the pool's raw TON value (2 = coins cost 2× more).
       */
      prizeFundingMultiplier: 2,
      /** Prize-pool bounds (in LC) the advertiser funds, stepped by `prizePoolStep`. */
      prizePoolMin: 10_000,
      prizePoolMax: 10_000_000,
      prizePoolStep: 5_000,
      defaultPrizePool: 50_000,
      /** Team-size (seats) bounds. */
      teamSizeMin: 8,
      teamSizeMax: 512,
      defaultTeamSize: 64,
      /** Recommended image sizes (px) surfaced as hints on the branding fields. */
      logoSize: { w: 256, h: 256 },
      bannerSize: { w: 1200, h: 400 },
    },
    /** Name-length bounds for the tournament name / brand fields. */
    form: {
      titleMinLength: 3,
      titleMaxLength: 60,
    },
  },
  account: {
    /**
     * Demo/mock master switch for the WHOLE app. When `true` every screen is
     * served as a brand-new "level zero" account (empty holdings, zero
     * stats/history, nothing earned); when `false` it serves the full rich
     * demo fixtures. No fixture data is ever deleted — the rich data lives in
     * the `false` branch of each mock, so the backend still sees the full
     * shape it must produce. Flip this one flag to switch the project zero↔demo.
     */
    fresh: false,
  },
  maintenance: {
    /**
     * Master switch for the full-screen "under maintenance" overlay. When
     * `true`, every screen is blocked until it's flipped back. On a real
     * backend this would be driven by a 503 response; here it's a manual/admin
     * flag. The "no internet" overlay is separate — it's driven by the browser's
     * `navigator.onLine`, not this flag.
     */
    enabled: false,
  },
};

export type AppConfig = typeof appConfig;
