import { faker } from '@faker-js/faker';
import { images } from '@/constants/images';
import { StakeStatus } from '@/types/enums/stakes.enums';
import {
  WalletCurrency,
  WalletProvider,
  WalletTransactionStatus,
  WalletTransactionType,
} from '@/types/enums/wallet.enums';
import { LcTransactionDirection, LcTransactionType } from '@/types/enums/lc.enums';
import type { MeResponse } from '@/types/interfaces/user.interfaces';
import type { ActiveStake, StakeHistoryEntry } from '@/types/interfaces/stakes.interfaces';
import type { WalletTransaction } from '@/types/interfaces/wallet.interfaces';
import type { LcTransaction } from '@/types/interfaces/lc.interfaces';

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();
const minutesFromNow = (m: number) => new Date(Date.now() + m * 60_000).toISOString();
const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();

/**
 * Single canonical state for the mock "backend".
 *
 * Every domain mock reads and writes here, so a mutation in one domain (e.g.
 * starting a stake locks LC) is immediately visible to queries in another
 * (e.g. the `me` balance). Always mutate IN PLACE — never reassign the
 * top-level keys — so live references held by other mocks stay valid.
 *
 * Migrated domains: `user`, `stakes`, `wallet`. Add a section per domain as
 * it moves onto the shared backend.
 *
 * Note: the user's Stars balance lives on `user.telegramStars` only — the
 * wallet reads it from there, it is not duplicated under `wallet`.
 */
export const mockDb = {
  user: {
    id: faker.string.uuid(),
    username: 'Arsen 001',
    email: 'arsen@gmai.com',
    isLuckyPlayer: true,
    luckyPlayerExpiresAt: new Date(Date.now() + 18 * 24 * 3_600_000).toISOString(),
    isVIP: true,
    vipLevel: 2,
    isVerified: true,
    avatar: images.avatar.src,
    avatarId: 'avatar-10',
    coins: 1_600_000,
    points: 750,
    phoneNumber: '+37411111111',
    twoFactorAuth: true,
    activityPoints: 18_500,
    telegramStars: 10000,
    lastActivityAt: new Date(Date.now() - 2 * 24 * 3_600_000).toISOString(),
    // Lifetime count of Bronze-tier stakes opened — gates "first 10 Bronze free" (DOCS §18.4).
    bronzeStakesOpened: 0,
  } as MeResponse,

  stakes: {
    activeStakes: [
      {
        id: 'stake-mid',
        level: 2,
        lockedAmount: 500_000,
        startDate: minutesAgo(65),
        endDate: minutesFromNow(115),
        status: StakeStatus.ACTIVE,
        claimed: false,
      },
      {
        id: 'stake-ready',
        level: 3,
        lockedAmount: 1_500_000,
        startDate: hoursAgo(4),
        endDate: minutesAgo(60),
        status: StakeStatus.COMPLETED,
        claimed: false,
      },
    ] as ActiveStake[],
    history: [
      {
        id: 'h1',
        level: 5,
        amount: 5_000_000,
        durationMonths: 12,
        yieldLC: 250_000,
        bonusLS: 72,
        apAwarded: 1800,
        outcome: 'completed',
        completedAt: hoursAgo(8),
      },
      {
        id: 'h2',
        level: 2,
        amount: 500_000,
        durationMonths: 3,
        yieldLC: 15_000,
        bonusLS: 9,
        apAwarded: 45,
        outcome: 'completed',
        completedAt: hoursAgo(26),
      },
      {
        id: 'h3',
        level: 1,
        amount: 100_000,
        durationMonths: 1,
        yieldLC: 0,
        bonusLS: 0,
        apAwarded: 2,
        outcome: 'cancelled',
        completedAt: hoursAgo(49),
      },
      {
        id: 'h4',
        level: 4,
        amount: 2_500_000,
        durationMonths: 6,
        yieldLC: 75_000,
        bonusLS: 30,
        apAwarded: 450,
        outcome: 'completed',
        completedAt: hoursAgo(73),
      },
      {
        id: 'h5',
        level: 3,
        amount: 1_000_000,
        durationMonths: 6,
        yieldLC: 0,
        bonusLS: 0,
        apAwarded: 120,
        outcome: 'cancelled',
        completedAt: hoursAgo(96),
      },
      {
        id: 'h6',
        level: 2,
        amount: 750_000,
        durationMonths: 6,
        yieldLC: 22_500,
        bonusLS: 18,
        apAwarded: 135,
        outcome: 'completed',
        completedAt: hoursAgo(120),
      },
      {
        id: 'h7',
        level: 1,
        amount: 200_000,
        durationMonths: 2,
        yieldLC: 6_000,
        bonusLS: 4,
        apAwarded: 12,
        outcome: 'completed',
        completedAt: hoursAgo(168),
      },
      {
        id: 'h8',
        level: 5,
        amount: 5_000_000,
        durationMonths: 6,
        yieldLC: 0,
        bonusLS: 0,
        apAwarded: 600,
        outcome: 'cancelled',
        completedAt: hoursAgo(192),
      },
      {
        id: 'h9',
        level: 3,
        amount: 1_500_000,
        durationMonths: 6,
        yieldLC: 45_000,
        bonusLS: 24,
        apAwarded: 270,
        outcome: 'completed',
        completedAt: hoursAgo(240),
      },
      {
        id: 'h10',
        level: 4,
        amount: 3_000_000,
        durationMonths: 7,
        yieldLC: 90_000,
        bonusLS: 35,
        apAwarded: 630,
        outcome: 'completed',
        completedAt: hoursAgo(288),
      },
      {
        id: 'h11',
        level: 2,
        amount: 500_000,
        durationMonths: 6,
        yieldLC: 0,
        bonusLS: 0,
        apAwarded: 60,
        outcome: 'cancelled',
        completedAt: hoursAgo(336),
      },
      {
        id: 'h12',
        level: 1,
        amount: 100_000,
        durationMonths: 1,
        yieldLC: 3_000,
        bonusLS: 2,
        apAwarded: 3,
        outcome: 'completed',
        completedAt: hoursAgo(408),
      },
    ] as StakeHistoryEntry[],
  },

  wallet: {
    isConnected: true,
    address: 'EQAbCdEfGhIjKlMnOpQrStUvWxYzAaBbCcDdEeFfGgHhIiJjKx9k2' as string | undefined,
    provider: WalletProvider.TONKEEPER as WalletProvider | undefined,
    tonBalance: 12.4583,
    network: 'mainnet' as 'mainnet' | 'testnet',
    // Stars balance is NOT stored here — it lives on `user.telegramStars`.
    transactions: [
      {
        id: 'wtx_001',
        type: WalletTransactionType.BUY_STARS,
        description: 'Bought 500 Stars for 0.25 TON',
        amount: 500,
        currency: WalletCurrency.STARS,
        status: WalletTransactionStatus.COMPLETED,
        createdAt: minutesAgo(4),
        txHash: '7f3c1ab9e1d7af2401b6b3a5a3dbf512a98b2c1d5e7f6a4b3c2d1e0f9a8b7c6d',
        fee: 0.005,
      },
      {
        id: 'wtx_002',
        type: WalletTransactionType.DEPOSIT_TON,
        description: 'Deposited 5 TON',
        amount: 5,
        currency: WalletCurrency.TON,
        status: WalletTransactionStatus.COMPLETED,
        createdAt: hoursAgo(2),
        txHash: '8e2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
        counterparty: 'EQDc...mP31',
      },
      {
        id: 'wtx_003',
        type: WalletTransactionType.WITHDRAW_TON,
        description: 'Withdrew 2.5 TON',
        amount: 2.5,
        currency: WalletCurrency.TON,
        status: WalletTransactionStatus.PENDING,
        createdAt: hoursAgo(6),
        txHash: '9c8b7a6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
        counterparty: 'EQAv...8t1q',
        fee: 0.05,
      },
      {
        id: 'wtx_004',
        type: WalletTransactionType.BUY_STARS,
        description: 'Bought 100 Stars for 0.05 TON',
        amount: 100,
        currency: WalletCurrency.STARS,
        status: WalletTransactionStatus.COMPLETED,
        createdAt: hoursAgo(24),
        txHash: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
        fee: 0.005,
      },
      {
        id: 'wtx_005',
        type: WalletTransactionType.DEPOSIT_TON,
        description: 'Deposited 10 TON',
        amount: 10,
        currency: WalletCurrency.TON,
        status: WalletTransactionStatus.COMPLETED,
        createdAt: hoursAgo(48),
        txHash: 'b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3',
        counterparty: 'EQDc...mP31',
      },
      {
        id: 'wtx_006',
        type: WalletTransactionType.WITHDRAW_TON,
        description: 'Withdrew 1 TON',
        amount: 1,
        currency: WalletCurrency.TON,
        status: WalletTransactionStatus.FAILED,
        createdAt: hoursAgo(96),
        counterparty: 'EQDz...4m9p',
        fee: 0.05,
      },
    ] as WalletTransaction[],
  },

  lc: {
    lifetimeEarned: 9_483_000,
    lifetimeSpent: 7_883_000,
    transactions: [
      {
        id: 'lctx_001',
        type: LcTransactionType.TOURNAMENT_PRIZE,
        direction: LcTransactionDirection.CREDIT,
        amount: 280_000,
        description: 'Tournament prize · Evening Bronze',
        createdAt: minutesAgo(18),
        balanceAfter: 1_600_000,
        sourceId: 'trn_evening_bronze',
      },
      {
        id: 'lctx_002',
        type: LcTransactionType.MARKET_PURCHASE,
        direction: LcTransactionDirection.DEBIT,
        amount: 120_000,
        description: 'Bought Capacity Chip · L2',
        createdAt: hoursAgo(3),
        balanceAfter: 257_000,
        sourceId: 'mkt_chip_cap_l2',
      },
      {
        id: 'lctx_003',
        type: LcTransactionType.STAKE_REWARD,
        direction: LcTransactionDirection.CREDIT,
        amount: 95_000,
        description: 'Stake reward · Level 2',
        createdAt: hoursAgo(8),
        balanceAfter: 377_000,
        sourceId: 'stake-mid',
      },
      {
        id: 'lctx_004',
        type: LcTransactionType.TASK_REWARD,
        direction: LcTransactionDirection.CREDIT,
        amount: 40_000,
        description: 'Daily task · Watch ad',
        createdAt: hoursAgo(11),
        balanceAfter: 282_000,
      },
      {
        id: 'lctx_005',
        type: LcTransactionType.CONVERT_FROM_STARS,
        direction: LcTransactionDirection.CREDIT,
        amount: 500_000,
        description: 'Converted 250 Stars → 500,000 LC',
        createdAt: hoursAgo(26),
        balanceAfter: 242_000,
      },
      {
        id: 'lctx_006',
        type: LcTransactionType.ENGINE_UPGRADE,
        direction: LcTransactionDirection.DEBIT,
        amount: 320_000,
        description: 'Upgraded engine speed · L3',
        createdAt: hoursAgo(40),
        balanceAfter: -258_000,
      },
      {
        id: 'lctx_007',
        type: LcTransactionType.REFERRAL,
        direction: LcTransactionDirection.CREDIT,
        amount: 62_000,
        description: 'Referral bonus · @luckyfriend',
        createdAt: hoursAgo(54),
        balanceAfter: 62_000,
      },
      {
        id: 'lctx_008',
        type: LcTransactionType.MARKET_SALE,
        direction: LcTransactionDirection.CREDIT,
        amount: 180_000,
        description: 'Sold Speed Chip · L1',
        createdAt: hoursAgo(72),
        balanceAfter: 0,
      },
    ] as LcTransaction[],
  },

  platform: {
    /**
     * Total active players on the platform — drives the tournament-tier
     * activation gate (DOCS §11.2.2). Seeded above the Diamond threshold
     * (1,000,000) so every tier is live; lower it to watch higher tiers
     * gate off (their tournaments disappear from the list / block joining).
     */
    activePlayers: 1_250_000,
  },
};
