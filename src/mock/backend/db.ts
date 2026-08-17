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
import { appConfig } from '@/config/app.config';
import type { Advertiser } from '@/types/interfaces/partners.interfaces';

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();
const minutesFromNow = (m: number) => new Date(Date.now() + m * 60_000).toISOString();
const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();

/**
 * Master demo switch (mirrors `appConfig.account.fresh`). `true` → serve a
 * brand-new "level zero" account everywhere; `false` → the full rich demo.
 * Rich values live in the `: …` branch of each field below, so nothing is ever
 * deleted — the backend can read both shapes from this single place.
 */
const fresh = appConfig.account.fresh;

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
/* ─── Partner cabinet: advertiser balance (DOCS §11.8) ───────────────────
 * The advertiser (casino) account behind the partner cabinet. Its TON balance
 * is debited when a sponsored tournament is created. */
const demoAdvertiser: Advertiser = {
  id: 'adv-demo-casino',
  username: 'demo_casino',
  // Fresh advertiser starts with a small promo credit; the rich demo has a top-up.
  balanceTon: fresh ? 1_000 : 24_000,
};

export const mockDb = {
  user: {
    id: faker.string.uuid(),
    username: 'Arsen 001',
    // What the player wrote for themselves in Telegram — deliberately the ugly
    // real case, not a pretty one: this exact name exists in production, it can
    // never be a `username` (the handle pattern rejects the parentheses), and a
    // one-character name is what breaks name-shaped layouts and initials.
    displayName: '(.)',
    email: 'arsen@gmai.com',
    // Account scalars switch with `fresh`: level-zero on the left, full demo on
    // the right. Nothing deleted — the rich values stay in the `: …` branch.
    isLuckyPlayer: !fresh,
    luckyPlayerExpiresAt: new Date(Date.now() + 18 * 24 * 3_600_000).toISOString(),
    isVIP: !fresh,
    vipLevel: fresh ? 0 : 2,
    // The backend always resolves these and the UI prefers them over the flat
    // code constants, so the mock has to send them too — otherwise dev only
    // ever exercises the fallback.
    //
    // Copied verbatim from the LIVE VIP **level 2** row (prod
    // `PlatformConfig.statusConfig`, read 09.08.2026). Every number here was
    // invented before and every one of them was wrong — the market discount
    // read 2% where production charges 1.4%, so dev was validating prices the
    // server would never quote. The counted perks are BONUSES over the free
    // numbers: `adsDailyBonus: 2` means 10 + 2 = 12 views. Two fields are NOT
    // the VIP row: the demo account also holds Lucky Player, and since
    // 17.08.2026 the server resolves the ad skip and bulk claim outside the
    // "VIP row wins" rule — a subscriber keeps both at any VIP level (DOCS
    // §7.3), so `me` reports the subscription's 10 skips and «Claim all».
    statusPerks: fresh
      ? undefined
      : {
          engineSpeedBoostPct: 1.9,
          // VIP's summand above, Lucky Player's MULTIPLIER here — `/me` sends
          // both (`resolveEngineSpeedStatus`) because since 17.08.2026 the two
          // stack, and this demo account holds both statuses.
          engineSpeedMultiplierPct: 30,
          stakeYieldBoostPct: 0.3,
          tournamentRewardBoostPct: 0,
          tournamentJoinApBoostPct: 0,
          marketDiscountPct: 1.4,
          referralPct: 25,
          adsDailyBonus: 2,
          // Lucky Player's 10, kept as a VIP (the VIP 2 row itself says 0).
          adsSkipDaily: 10,
          stakeFeeDiscountBonusPct: 0,
          ticketSendDailyBonus: {
            BRONZE: 3,
            SILVER: 2,
            GOLD: 0,
            PLATINUM: 0,
            DIAMOND: 0,
          },
          // Lucky Player's, kept as a VIP under 15 (the VIP 2 row says false).
          bulkClaimEnabled: true,
        },
    isVerified: !fresh,
    avatar: images.avatar.src,
    avatarId: 'avatar-10',
    coins: fresh ? 0 : 1_600_000,
    points: fresh ? 0 : 750,
    phoneNumber: '+37411111111',
    twoFactorAuth: true,
    activityPoints: fresh ? 0 : 18_500,
    // Keep in sync with referral.mock.ts invitedFriendsMock (7 rich-demo
    // friends): the demo account caps at Gold under the referral tier gate.
    referralsCount: fresh ? 0 : 7,
    telegramStars: fresh ? 0 : 10_000,
    lastActivityAt: new Date(Date.now() - 2 * 24 * 3_600_000).toISOString(),
    // Lifetime stake starts — metered against `freeStartCount` (DOCS §18.5).
    freeStakeStartsUsed: 0,
    // First-run onboarding tour: auto-shows only for a level-zero account
    // (activityPoints === 0) that hasn't seen it.
    hasSeenTour: false,
    // Blocking the bot wipes the account, and the returning player is told once
    // why it is empty. `false` here because the demo account never blocked
    // anything — flip it to see the modal. @see BlockWipeNoticeWatcher
    blockWipeNotice: false,
  } as MeResponse,

  // Own-profile history & stats — single source so a level change shows up on
  // the profile too. Switches with `fresh`: zero for a new account, rich demo
  // otherwise (nothing deleted — rich lives in the `: …` branch).
  accountStats: {
    ticketsEarned: fresh ? 0 : 120,
    streak: fresh ? { days: 0, active: false } : { days: 30, active: true },
    activityBest: fresh
      ? {
          day: 0,
          dayRank: 0,
          week: 0,
          weekRank: 0,
          month: 0,
          monthRank: 0,
          allTime: 0,
          allTimeRank: 0,
        }
      : {
          day: 32,
          dayRank: 24,
          week: 98,
          weekRank: 11,
          month: 240,
          monthRank: 9,
          allTime: 143,
          allTimeRank: 7,
        },
    friendsCount: fresh ? 0 : 12,
    tournamentsPlayed: fresh ? 0 : 12,
    tournamentsWon: fresh ? 0 : 3,
    stakesCompleted: fresh ? 0 : 8,
    ticketsSent: fresh ? 0 : 17,
    earnedAchievements: fresh ? 0 : 24,
    likesReceived: fresh ? 0 : 234,
    ton: fresh ? 0 : 0.42,
    ticketsByTier: fresh
      ? { bronze: 0, silver: 0, gold: 0, platinum: 0, diamond: 0 }
      : { bronze: 154, silver: 41, gold: 8, platinum: 4, diamond: 2 },
  },

  stakes: {
    activeStakes: (fresh
      ? []
      : [
          // `durationMonths` is what the server stores and charges by; the
          // dates here are squeezed into minutes so the demo has something
          // ticking and something claimable. Deriving the duration from those
          // dates would call both stakes "1 month" — the field has to be sent.
          {
            id: 'stake-mid',
            level: 2,
            lockedAmount: 50_000,
            durationMonths: 3,
            startDate: minutesAgo(65),
            endDate: minutesFromNow(115),
            status: StakeStatus.ACTIVE,
            claimed: false,
          },
          {
            id: 'stake-ready',
            level: 3,
            lockedAmount: 150_000,
            durationMonths: 6,
            startDate: hoursAgo(4),
            endDate: minutesAgo(60),
            status: StakeStatus.COMPLETED,
            claimed: false,
          },
        ]) as ActiveStake[],
    history: (fresh
      ? []
      : [
          {
            id: 'h1',
            level: 5,
            amount: 500_000,
            durationMonths: 12,
            yieldLC: 25_000,
            bonusLS: 72,
            apAwarded: 1800,
            outcome: 'completed',
            completedAt: hoursAgo(8),
          },
          {
            id: 'h2',
            level: 2,
            amount: 50_000,
            durationMonths: 3,
            yieldLC: 1_500,
            bonusLS: 9,
            apAwarded: 45,
            outcome: 'completed',
            completedAt: hoursAgo(26),
          },
          {
            id: 'h3',
            level: 1,
            amount: 10_000,
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
            amount: 250_000,
            durationMonths: 6,
            yieldLC: 7_500,
            bonusLS: 30,
            apAwarded: 450,
            outcome: 'completed',
            completedAt: hoursAgo(73),
          },
          {
            id: 'h5',
            level: 3,
            amount: 100_000,
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
            amount: 75_000,
            durationMonths: 6,
            yieldLC: 2_250,
            bonusLS: 18,
            apAwarded: 135,
            outcome: 'completed',
            completedAt: hoursAgo(120),
          },
          {
            id: 'h7',
            level: 1,
            amount: 20_000,
            durationMonths: 2,
            yieldLC: 600,
            bonusLS: 4,
            apAwarded: 12,
            outcome: 'completed',
            completedAt: hoursAgo(168),
          },
          {
            id: 'h8',
            level: 5,
            amount: 500_000,
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
            amount: 150_000,
            durationMonths: 6,
            yieldLC: 4_500,
            bonusLS: 24,
            apAwarded: 270,
            outcome: 'completed',
            completedAt: hoursAgo(240),
          },
          {
            id: 'h10',
            level: 4,
            amount: 300_000,
            durationMonths: 7,
            yieldLC: 9_000,
            bonusLS: 35,
            apAwarded: 630,
            outcome: 'completed',
            completedAt: hoursAgo(288),
          },
          {
            id: 'h11',
            level: 2,
            amount: 50_000,
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
            amount: 10_000,
            durationMonths: 1,
            yieldLC: 300,
            bonusLS: 2,
            apAwarded: 3,
            outcome: 'completed',
            completedAt: hoursAgo(408),
          },
        ]) as StakeHistoryEntry[],
  },

  wallet: {
    isConnected: !fresh,
    address: (fresh ? undefined : 'EQAbCdEfGhIjKlMnOpQrStUvWxYzAaBbCcDdEeFfGgHhIiJjKx9k2') as
      | string
      | undefined,
    provider: (fresh ? undefined : WalletProvider.TONKEEPER) as WalletProvider | undefined,
    tonBalance: fresh ? 0 : 12.4583,
    network: 'mainnet' as 'mainnet' | 'testnet',
    // Stars balance is NOT stored here — it lives on `user.telegramStars`.
    transactions: (fresh
      ? []
      : [
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
        ]) as WalletTransaction[],
  },

  lc: {
    lifetimeEarned: fresh ? 0 : 948_300,
    lifetimeSpent: fresh ? 0 : 788_300,
    transactions: (fresh
      ? []
      : [
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
            balanceAfter: 1_320_000,
            sourceId: 'mkt_chip_cap_l2',
          },
          {
            id: 'lctx_003',
            type: LcTransactionType.STAKE_REWARD,
            direction: LcTransactionDirection.CREDIT,
            amount: 95_000,
            description: 'Stake reward · Level 2',
            createdAt: hoursAgo(8),
            balanceAfter: 1_440_000,
            sourceId: 'stake-mid',
          },
          {
            id: 'lctx_004',
            type: LcTransactionType.TASK_REWARD,
            direction: LcTransactionDirection.CREDIT,
            amount: 40_000,
            description: 'Daily task · Watch ad',
            createdAt: hoursAgo(11),
            balanceAfter: 1_345_000,
          },
          {
            id: 'lctx_005',
            type: LcTransactionType.CONVERT_FROM_STARS,
            direction: LcTransactionDirection.CREDIT,
            amount: 500_000,
            description: 'Converted 250 Stars → 500,000 LC',
            createdAt: hoursAgo(26),
            balanceAfter: 1_305_000,
          },
          {
            id: 'lctx_006',
            // Time-limited engine Speed Boost — bought with LC (DOCS §10.1).
            // NOT a permanent speed-LEVEL upgrade: those are paid in Lucky Stars
            // (§10.2), so they would never appear in the LC ledger (audit L4).
            type: LcTransactionType.ENGINE_UPGRADE,
            direction: LcTransactionDirection.DEBIT,
            amount: 320_000,
            description: 'Speed Boost · 3h',
            createdAt: hoursAgo(40),
            balanceAfter: 805_000,
          },
          {
            id: 'lctx_007',
            type: LcTransactionType.REFERRAL,
            direction: LcTransactionDirection.CREDIT,
            amount: 62_000,
            description: 'Referral bonus · @luckyfriend',
            createdAt: hoursAgo(54),
            balanceAfter: 1_125_000,
          },
          {
            id: 'lctx_008',
            type: LcTransactionType.MARKET_SALE,
            direction: LcTransactionDirection.CREDIT,
            amount: 180_000,
            description: 'Sold Speed Chip · L1',
            createdAt: hoursAgo(72),
            balanceAfter: 1_063_000,
          },
          {
            id: 'lctx_009',
            type: LcTransactionType.JACKPOT,
            direction: LcTransactionDirection.CREDIT,
            amount: 450_000,
            description: 'Jackpot payout · Weekly draw',
            createdAt: hoursAgo(96),
            balanceAfter: 883_000,
            sourceId: 'jackpot_weekly',
          },
          {
            id: 'lctx_010',
            type: LcTransactionType.PROMO,
            direction: LcTransactionDirection.CREDIT,
            amount: 25_000,
            description: 'Promo code · WELCOME25',
            createdAt: hoursAgo(120),
            balanceAfter: 433_000,
          },
          {
            id: 'lctx_011',
            type: LcTransactionType.ADMIN_ADJUST,
            direction: LcTransactionDirection.CREDIT,
            amount: 10_000,
            description: 'Balance correction',
            createdAt: hoursAgo(150),
            balanceAfter: 408_000,
          },
          {
            id: 'lctx_012',
            type: LcTransactionType.AD_EXTRA_VIEWS,
            direction: LcTransactionDirection.DEBIT,
            amount: 5_000,
            description: 'Extra ad views · 1',
            createdAt: hoursAgo(170),
            balanceAfter: 398_000,
          },
        ]) as LcTransaction[],
  },

  /**
   * The advertiser (casino) account behind the partner cabinet (DOCS §11.8).
   * Its TON balance is debited when a sponsored tournament is created.
   */
  advertiser: demoAdvertiser,
};
