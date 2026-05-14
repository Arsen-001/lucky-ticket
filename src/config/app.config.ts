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
  {
    level: 1,
    minDeposit: 100,
    guaranteedTicket: 'bronze',
    allTickets: ['bronze'],
    bonusPrizes: ['LC bonus', 'Speed Boost'],
    starsChance: 5,
    starsMin: 5,
    starsMax: 15,
  },
  {
    level: 2,
    minDeposit: 500,
    guaranteedTicket: 'silver',
    allTickets: ['bronze', 'silver'],
    bonusPrizes: ['LC bonus', 'Speed Boost', 'Capacity Upgrade'],
    starsChance: 10,
    starsMin: 15,
    starsMax: 40,
  },
  {
    level: 3,
    minDeposit: 1000,
    guaranteedTicket: 'gold',
    allTickets: ['bronze', 'silver', 'gold'],
    bonusPrizes: ['LC bonus', 'Speed Boost', 'Capacity Upgrade', 'Badge'],
    starsChance: 20,
    starsMin: 40,
    starsMax: 100,
  },
  {
    level: 4,
    minDeposit: 2500,
    guaranteedTicket: 'platinum',
    allTickets: ['bronze', 'silver', 'gold', 'platinum'],
    bonusPrizes: ['LC bonus', 'Speed Boost', 'Capacity Upgrade', 'Premium Badge'],
    starsChance: 30,
    starsMin: 70,
    starsMax: 250,
  },
  {
    level: 5,
    minDeposit: 5000,
    guaranteedTicket: 'diamond',
    allTickets: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
    bonusPrizes: ['Large LC bonus', 'Boosts & Upgrades', 'Exclusive Badge'],
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

const starsPackages: StarsPackage[] = [
  { id: 'pkg_75', stars: 75, tonCost: 1 },
  { id: 'pkg_400', stars: 400, tonCost: 5, bonusPercent: 7, popular: true },
  { id: 'pkg_850', stars: 850, tonCost: 10, bonusPercent: 13 },
  { id: 'pkg_4700', stars: 4700, tonCost: 50, bonusPercent: 25 },
];

export const appConfig = {
  stakes: {
    /** Hours a stake stays locked before it can be claimed. */
    durationHours: 3,
    /** Telegram Stars penalty per stake level when cancelling early. */
    cancelStarsPerLevel: 5,
    /** Bounds of the duration slider on the "new stake" screen (months). */
    durationMinMonths: 1,
    durationMaxMonths: 12,
    /** APR range mapped across the duration slider (percent). */
    aprMinPercent: 1,
    aprMaxPercent: 5,
    /** Stake tier definitions — deposit thresholds, ticket & bonus rewards. */
    levels: stakeLevels,
  },
  wallet: {
    /** TON → USD conversion rate shown in the wallet. */
    tonUsdRate: 3.42,
    /** Flat TON network fee charged on a withdrawal. */
    withdrawFeeTon: 0.05,
    /** Wallet apps the user can connect. */
    supportedWallets,
    /** Stars purchase packages — price catalog. */
    starsPackages,
  },
};

export type AppConfig = typeof appConfig;
