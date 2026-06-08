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
  { level: 1, minDeposit: 100_000, tier: 'bronze', completionStarsPerMonth: 2 },
  { level: 2, minDeposit: 500_000, tier: 'silver', completionStarsPerMonth: 3 },
  { level: 3, minDeposit: 1_000_000, tier: 'gold', completionStarsPerMonth: 4 },
  { level: 4, minDeposit: 2_500_000, tier: 'platinum', completionStarsPerMonth: 5 },
  { level: 5, minDeposit: 5_000_000, tier: 'diamond', completionStarsPerMonth: 6 },
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

// LS packages anchored to 1 LS = $0.02 at tonUsdRate, with a single volume bonus.
const starsPackages: StarsPackage[] = [
  { id: 'pkg_171', stars: 171, tonCost: 1 },
  { id: 'pkg_898', stars: 898, tonCost: 5, bonusPercent: 5, popular: true },
  { id: 'pkg_1881', stars: 1881, tonCost: 10, bonusPercent: 10 },
  { id: 'pkg_9833', stars: 9833, tonCost: 50, bonusPercent: 15 },
];

export const appConfig = {
  stakes: {
    /** Bounds of the duration slider on the "new stake" screen (months). */
    durationMinMonths: 1,
    durationMaxMonths: 12,
    /** Total-period yield rate mapped across the duration slider (percent). */
    aprMinPercent: 1,
    aprMaxPercent: 5,
    /** Divisor in the stake AP formula: `deposit × months ÷ apDivisor` (DOCS §5.3 / §18.3). */
    apDivisor: 50_000,
    /** Bonus added to the stake AP base when it completes (forfeited on cancel). */
    apCompletionBonusPercent: 50,
    /** LC required to add 1 ⭐ to the base stake fee (`base = ceil(deposit / feeStep)`). */
    feeStep: 100_000,
    /** Discount % per stake month — applied to the base fee. */
    feeMonthDiscountPercent: 1,
    /**
     * Volume-discount brackets applied on top of the month discount. The user
     * gets the percent of the largest bracket whose `threshold` they meet.
     * Lucky Player holders get the boosted set.
     */
    feeVolumeDiscount: {
      default: [
        { threshold: 1_000_000, percent: 10 },
        { threshold: 2_500_000, percent: 12 },
        { threshold: 5_000_000, percent: 15 },
        { threshold: 10_000_000, percent: 20 },
      ],
      luckyPlayer: [
        { threshold: 1_000_000, percent: 20 },
        { threshold: 2_500_000, percent: 22 },
        { threshold: 5_000_000, percent: 25 },
        { threshold: 10_000_000, percent: 30 },
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
  wallet: {
    /** TON → USD conversion rate shown in the wallet. */
    tonUsdRate: 3.42,
    /** Flat TON network fee charged on a withdrawal. */
    withdrawFeeTon: 0.05,
    /** USD value of one LC — used to price the LC → TON conversion (DOCS §6.1). */
    lcUsdRate: 0.00001,
    /** Wallet apps the user can connect. */
    supportedWallets,
    /** Stars purchase packages — price catalog. */
    starsPackages,
  },
  onboardingTour: {
    /**
     * Master switch for the first-run guided tour. When `false` the tour never
     * auto-starts — so you can test the whole app freely — but the manual
     * "replay" entry in Settings still works regardless of this flag.
     */
    autoStart: false,
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
     * When the pot drops on the secretly-charged tournament instance, this
     * percent is split EQUALLY among ALL of that instance's participants
     * (consolation — nobody walks away with a jackpot-zero).
     */
    participantsSharePercent: 20,
    /** The remaining percent of the dropped pot, paid to the top-3 podium. */
    podiumSharePercent: 80,
    /**
     * How the podium share splits across 1st / 2nd / 3rd (percent OF the podium
     * share). Whole-pot equivalents (via `getJackpotWholePotSplit`): 1st 40%,
     * 2nd 24%, 3rd 16%.
     */
    podiumSplitPercent: { first: 50, second: 30, third: 20 },
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
    fresh: true,
  },
};

export type AppConfig = typeof appConfig;
