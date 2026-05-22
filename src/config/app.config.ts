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
  { level: 1, minDeposit: 100_000, tier: 'bronze', starsChance: 5, starsMin: 5, starsMax: 15 },
  { level: 2, minDeposit: 500_000, tier: 'silver', starsChance: 10, starsMin: 15, starsMax: 40 },
  { level: 3, minDeposit: 1_000_000, tier: 'gold', starsChance: 20, starsMin: 40, starsMax: 100 },
  {
    level: 4,
    minDeposit: 2_500_000,
    tier: 'platinum',
    starsChance: 30,
    starsMin: 70,
    starsMax: 250,
  },
  {
    level: 5,
    minDeposit: 5_000_000,
    tier: 'diamond',
    starsChance: 40,
    starsMin: 100,
    starsMax: 500,
  },
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
    /** Telegram Stars penalty per stake level when cancelling early. */
    cancelStarsPerLevel: 5,
    /** Bounds of the duration slider on the "new stake" screen (months). */
    durationMinMonths: 1,
    durationMaxMonths: 12,
    /** Total-period yield rate mapped across the duration slider (percent). */
    aprMinPercent: 1,
    aprMaxPercent: 5,
    /** Divisor in the stake AP formula: `deposit × months ÷ apDivisor` (DOCS §5.3 / §18.3). */
    apDivisor: 10_000_000,
    /** Bonus added to the stake AP base when it completes (forfeited on cancel). */
    apCompletionBonusPercent: 50,
    /** Stake tier definitions — deposit thresholds + bonus-draw values. */
    levels: stakeLevels,
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
};

export type AppConfig = typeof appConfig;
