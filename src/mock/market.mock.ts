import {
  MarketCosmeticType,
  MarketItemCategory,
  MarketPriceType,
  MarketStatusType,
} from '@/types/enums/market.enums';
import { TicketsEnum } from '@/types/enums/ticket.enums';
import { images } from '@/constants/images';
import { appConfig } from '@/config/app.config';
import { lcPriceToLsParity } from '@/utils/global/economy.utils';
import type {
  MarketData,
  MarketPrice,
  MarketStatusSavings,
  StatusPerkBase,
  VipLevelPerks,
} from '@/types/interfaces/market.interfaces';
import { GlobalConstants } from '@/constants/global.constants';

/**
 * Free limits the counted status perks are added to — the backend sends these
 * with every status listing so the app can quote the resulting total.
 */
const STATUS_PERK_BASE: StatusPerkBase = {
  adsDailyLimit: GlobalConstants.apRewards.watchVideoDailyLimit,
  ticketSendDailyLimit: { BRONZE: 1, SILVER: 1, GOLD: 1, PLATINUM: 0, DIAMOND: 0 },
  stakeFeeVolumeDiscountMaxPct: Math.max(
    ...GlobalConstants.stakeFeeVolumeDiscount.map(b => b.percent)
  ),
};

/**
 * The live VIP ladder from prod (`statusConfig.vip.levels`, read 2026-08-09),
 * column order: engine % · stake % · market % · ad views · sends
 * Bronze→Diamond · bulk claim.
 *
 * Copied verbatim rather than generated so the mock reproduces what the screen
 * must survive on real data: fractional percents (0.1, 1.9), tiers that stay
 * closed for the first levels, and the three perks that are ZERO on all twenty
 * — tournament reward, join AP and the stake-fee bonus. None of those may grow
 * a row.
 */
const VIP_LEVEL_PERK_LADDER: VipLevelPerks[] = (
  [
    [1, 0.1, 1, 1, [2, 1, 0, 0, 0], false],
    [1.9, 0.3, 1.4, 2, [3, 2, 0, 0, 0], false],
    [2.7, 0.6, 1.8, 3, [4, 3, 1, 0, 0], false],
    [3.6, 0.8, 2.2, 4, [5, 3, 2, 0, 0], false],
    [4.5, 1, 2.6, 5, [5, 4, 3, 1, 0], false],
    [5.4, 1.2, 3, 5, [6, 5, 3, 2, 0], false],
    [6.2, 1.5, 3.4, 6, [7, 6, 4, 3, 1], false],
    [7.1, 1.7, 3.8, 7, [8, 6, 5, 3, 2], false],
    [8, 1.9, 4.2, 8, [9, 7, 6, 4, 3], false],
    [8.8, 2.2, 4.7, 9, [10, 8, 6, 5, 3], false],
    [9.7, 2.4, 5.1, 10, [10, 9, 7, 6, 4], false],
    [10.6, 2.6, 5.5, 11, [11, 10, 8, 7, 5], false],
    [11.5, 2.8, 5.9, 12, [12, 10, 9, 7, 6], false],
    [12.3, 3.1, 6.3, 13, [13, 11, 9, 8, 6], false],
    [13.2, 3.3, 6.7, 13, [14, 12, 10, 9, 7], true],
    [14.1, 3.5, 7.1, 14, [15, 13, 11, 10, 8], true],
    [15, 3.7, 7.5, 15, [15, 13, 12, 10, 9], true],
    [15.8, 4, 7.9, 16, [16, 14, 12, 11, 9], true],
    [16.7, 4.2, 8.3, 17, [17, 15, 13, 12, 10], true],
    [20, 5, 10, 20, [20, 18, 16, 14, 12], true],
  ] as [number, number, number, number, number[], boolean][]
).map(([engine, stake, market, ads, send, bulk], i) => ({
  level: i + 1,
  perks: {
    engineSpeedBoostPct: engine,
    stakeYieldBoostPct: stake,
    tournamentRewardBoostPct: 0,
    tournamentJoinApBoostPct: 0,
    marketDiscountPct: market,
    referralPct: 25,
    adsDailyBonus: ads,
    // Lucky Player's perk only — VIP grants none by default, and perks do not
    // stack, so a VIP row of 0 is what a VIP+LP player actually resolves to.
    adsSkipDaily: 0,
    stakeFeeDiscountBonusPct: 0,
    ticketSendDailyBonus: {
      BRONZE: send[0],
      SILVER: send[1],
      GOLD: send[2],
      PLATINUM: send[3],
      DIAMOND: send[4],
    },
    bulkClaimEnabled: bulk,
  },
}));

/**
 * LC price ladder + LS parity (DOCS §14.2). Engine and ticket LC prices come
 * from the single economy config; the Telegram-Stars price is derived at the
 * USD anchors so neither currency is an arbitrage on the other.
 */
const lcPricePair = (lcAmount: number): MarketPrice[] => [
  { type: MarketPriceType.LC, amount: lcAmount },
  { type: MarketPriceType.TELEGRAM_STARS, amount: lcPriceToLsParity(lcAmount) },
];

const enginePrices = (tier: TicketsEnum): MarketPrice[] =>
  lcPricePair(appConfig.economy.engineBasePriceLcByTier[tier]);

// Tickets keep their LC economy price but use a FIXED 1⭐→5⭐ by-tier Stars
// ladder (off parity, unlike engines) — mirrors backend `MARKET_TICKET_STAR_PRICES`.
const ticketPrices = (tier: TicketsEnum): MarketPrice[] => [
  { type: MarketPriceType.LC, amount: appConfig.economy.ticketPriceLcByTier[tier] },
  {
    type: MarketPriceType.TELEGRAM_STARS,
    amount: appConfig.economy.ticketPriceStarsByTier[tier],
  },
];

export const marketMock: MarketData = {
  engines: [
    {
      id: 'engine-bronze',
      name: 'Bronze Engine',
      category: MarketItemCategory.ENGINE,
      ticketType: TicketsEnum.BRONZE,
      engineLevel: 1,
      prices: enginePrices(TicketsEnum.BRONZE),
    },
    {
      id: 'engine-silver',
      name: 'Silver Engine',
      category: MarketItemCategory.ENGINE,
      ticketType: TicketsEnum.SILVER,
      engineLevel: 1,
      prices: enginePrices(TicketsEnum.SILVER),
    },
    {
      id: 'engine-gold',
      name: 'Gold Engine',
      category: MarketItemCategory.ENGINE,
      ticketType: TicketsEnum.GOLD,
      engineLevel: 1,
      remainingSupply: 24,
      prices: enginePrices(TicketsEnum.GOLD),
    },
    {
      id: 'engine-platinum',
      name: 'Platinum Engine',
      category: MarketItemCategory.ENGINE,
      ticketType: TicketsEnum.PLATINUM,
      engineLevel: 1,
      remainingSupply: 8,
      prices: enginePrices(TicketsEnum.PLATINUM),
    },
    {
      id: 'engine-diamond',
      name: 'Diamond Engine',
      category: MarketItemCategory.ENGINE,
      ticketType: TicketsEnum.DIAMOND,
      engineLevel: 1,
      remainingSupply: 3,
      isNew: true,
      prices: enginePrices(TicketsEnum.DIAMOND),
    },
  ],

  tickets: [
    {
      id: 't1',
      name: 'Bronze Ticket',
      isNew: true,
      ticketType: TicketsEnum.BRONZE,
      isAvailable: true,
      // Exercises the admin-photo (MarketItemImage) render path in dev + the
      // Playwright smoke; real items get their imageUrl from the backend.
      imageUrl: images.avatar1.src,
      prices: ticketPrices(TicketsEnum.BRONZE),
    },
    {
      id: 't2',
      name: 'Silver Ticket',
      ticketType: TicketsEnum.SILVER,
      isAvailable: true,
      prices: ticketPrices(TicketsEnum.SILVER),
    },
    {
      id: 't3',
      name: 'Gold Ticket',
      ticketType: TicketsEnum.GOLD,
      isAvailable: false,
      prices: ticketPrices(TicketsEnum.GOLD),
    },
    {
      id: 't4',
      name: 'Platinum Ticket',
      ticketType: TicketsEnum.PLATINUM,
      isAvailable: false,
      prices: ticketPrices(TicketsEnum.PLATINUM),
    },
    {
      id: 't5',
      name: 'Diamond Ticket',
      ticketType: TicketsEnum.DIAMOND,
      isAvailable: false,
      prices: ticketPrices(TicketsEnum.DIAMOND),
    },
  ],

  shards: [
    {
      id: 'shard-bronze-speed',
      name: 'Bronze Time Shard',
      category: MarketItemCategory.SHARD,
      type: 'speed',
      quality: TicketsEnum.BRONZE,
      count: 1,
      prices: [
        { type: MarketPriceType.LC, amount: 20_000 },
        { type: MarketPriceType.TELEGRAM_STARS, amount: 1 },
      ],
    },
    {
      id: 'shard-bronze-cap',
      name: 'Bronze Capacity Shard',
      category: MarketItemCategory.SHARD,
      type: 'capacity',
      quality: TicketsEnum.BRONZE,
      count: 1,
      prices: [
        { type: MarketPriceType.LC, amount: 20_000 },
        { type: MarketPriceType.TELEGRAM_STARS, amount: 1 },
      ],
    },
    {
      id: 'shard-silver-speed',
      name: 'Silver Time Shard',
      category: MarketItemCategory.SHARD,
      type: 'speed',
      quality: TicketsEnum.SILVER,
      count: 1,
      prices: [
        { type: MarketPriceType.LC, amount: 40_000 },
        { type: MarketPriceType.TELEGRAM_STARS, amount: 2 },
      ],
    },
    {
      id: 'shard-silver-cap',
      name: 'Silver Capacity Shard',
      category: MarketItemCategory.SHARD,
      type: 'capacity',
      quality: TicketsEnum.SILVER,
      count: 1,
      prices: [
        { type: MarketPriceType.LC, amount: 40_000 },
        { type: MarketPriceType.TELEGRAM_STARS, amount: 2 },
      ],
    },
    {
      id: 'shard-gold-speed',
      name: 'Gold Time Shard',
      category: MarketItemCategory.SHARD,
      type: 'speed',
      quality: TicketsEnum.GOLD,
      count: 1,
      isNew: true,
      prices: [
        { type: MarketPriceType.LC, amount: 80_000 },
        { type: MarketPriceType.TELEGRAM_STARS, amount: 4 },
      ],
    },
    {
      id: 'shard-gold-cap',
      name: 'Gold Capacity Shard',
      category: MarketItemCategory.SHARD,
      type: 'capacity',
      quality: TicketsEnum.GOLD,
      count: 1,
      prices: [
        { type: MarketPriceType.LC, amount: 80_000 },
        { type: MarketPriceType.TELEGRAM_STARS, amount: 4 },
      ],
    },
    {
      id: 'shard-platinum-speed',
      name: 'Platinum Time Shard',
      category: MarketItemCategory.SHARD,
      type: 'speed',
      quality: TicketsEnum.PLATINUM,
      count: 1,
      prices: [
        { type: MarketPriceType.LC, amount: 160_000 },
        { type: MarketPriceType.TELEGRAM_STARS, amount: 8 },
      ],
    },
    {
      id: 'shard-platinum-cap',
      name: 'Platinum Capacity Shard',
      category: MarketItemCategory.SHARD,
      type: 'capacity',
      quality: TicketsEnum.PLATINUM,
      count: 1,
      prices: [
        { type: MarketPriceType.LC, amount: 160_000 },
        { type: MarketPriceType.TELEGRAM_STARS, amount: 8 },
      ],
    },
    {
      id: 'shard-diamond-speed',
      name: 'Diamond Time Shard',
      category: MarketItemCategory.SHARD,
      type: 'speed',
      quality: TicketsEnum.DIAMOND,
      count: 1,
      isNew: true,
      featured: true,
      prices: [
        { type: MarketPriceType.LC, amount: 320_000 },
        { type: MarketPriceType.TELEGRAM_STARS, amount: 16 },
      ],
    },
    {
      id: 'shard-diamond-cap',
      name: 'Diamond Capacity Shard',
      category: MarketItemCategory.SHARD,
      type: 'capacity',
      quality: TicketsEnum.DIAMOND,
      count: 1,
      featured: true,
      prices: [
        { type: MarketPriceType.LC, amount: 320_000 },
        { type: MarketPriceType.TELEGRAM_STARS, amount: 16 },
      ],
    },
  ],

  cosmetics: [
    {
      id: 'avatar-3',
      name: 'Sparkrunner',
      category: MarketItemCategory.COSMETIC,
      cosmeticType: MarketCosmeticType.AVATAR,
      description: 'L3 · +3% engine speed boost while equipped',
      accent: TicketsEnum.BRONZE,
      avatarId: 'avatar-3',
      imageUrl: images.avatar1.src,
      avatarLevel: 3,
      avatarBoost: { type: 'engineSpeed', pct: 3 },
      prices: [
        { type: MarketPriceType.LC, amount: 30_000 },
        { type: MarketPriceType.TELEGRAM_STARS, amount: 8 },
      ],
    },
    {
      id: 'avatar-4',
      name: 'Coin Hunter',
      category: MarketItemCategory.COSMETIC,
      cosmeticType: MarketCosmeticType.AVATAR,
      description: 'L4 · +5% market discount while equipped',
      accent: TicketsEnum.BRONZE,
      avatarId: 'avatar-4',
      imageUrl: images.avatar2.src,
      avatarLevel: 4,
      avatarBoost: { type: 'marketDiscount', pct: 5 },
      prices: [
        { type: MarketPriceType.LC, amount: 45_000 },
        { type: MarketPriceType.TELEGRAM_STARS, amount: 11 },
      ],
    },
    {
      id: 'avatar-5',
      name: 'AP Drifter',
      category: MarketItemCategory.COSMETIC,
      cosmeticType: MarketCosmeticType.AVATAR,
      description: 'L5 · +7% Activity Points earn while equipped',
      accent: TicketsEnum.SILVER,
      avatarId: 'avatar-5',
      imageUrl: images.avatar3.src,
      avatarLevel: 5,
      avatarBoost: { type: 'apEarn', pct: 7 },
      prices: [
        { type: MarketPriceType.LC, amount: 70_000 },
        { type: MarketPriceType.TELEGRAM_STARS, amount: 18 },
      ],
    },
    {
      id: 'avatar-6',
      name: 'Champion',
      category: MarketItemCategory.COSMETIC,
      cosmeticType: MarketCosmeticType.AVATAR,
      description: 'L6 · +10% tournament reward while equipped',
      accent: TicketsEnum.SILVER,
      avatarId: 'avatar-6',
      imageUrl: images.avatar4.src,
      avatarLevel: 6,
      avatarBoost: { type: 'tournamentReward', pct: 10 },
      avatarDailyReward: { kind: 'lc', amount: 5_000 },
      prices: [
        { type: MarketPriceType.LC, amount: 100_000 },
        { type: MarketPriceType.TELEGRAM_STARS, amount: 25 },
      ],
    },
    {
      id: 'avatar-7',
      name: 'Multiplier Adept',
      category: MarketItemCategory.COSMETIC,
      cosmeticType: MarketCosmeticType.AVATAR,
      description: 'L7 · +12% claim reward while equipped',
      accent: TicketsEnum.GOLD,
      avatarId: 'avatar-7',
      imageUrl: images.avatar5.src,
      avatarLevel: 7,
      avatarBoost: { type: 'claimMultiplier', pct: 12 },
      avatarDailyReward: { kind: 'lc', amount: 12_000 },
      prices: [
        { type: MarketPriceType.LC, amount: 150_000 },
        { type: MarketPriceType.TELEGRAM_STARS, amount: 38 },
      ],
    },
    {
      id: 'avatar-8',
      name: 'Speedstar',
      category: MarketItemCategory.COSMETIC,
      cosmeticType: MarketCosmeticType.AVATAR,
      description: 'L8 · +15% engine speed while equipped',
      accent: TicketsEnum.GOLD,
      avatarId: 'avatar-8',
      imageUrl: images.avatar6.src,
      avatarLevel: 8,
      avatarBoost: { type: 'engineSpeed', pct: 15 },
      avatarDailyReward: { kind: 'stars', amount: 1 },
      featured: true,
      // Stars-only: an avatar paying a stars daily reward must not be buyable
      // with coins (DOCS §16.1) — mirrors the backend catalog.
      prices: [{ type: MarketPriceType.TELEGRAM_STARS, amount: 55 }],
    },
    {
      id: 'avatar-9',
      name: 'Bargain Lord',
      category: MarketItemCategory.COSMETIC,
      cosmeticType: MarketCosmeticType.AVATAR,
      description: 'L9 · +18% market discount while equipped',
      accent: TicketsEnum.DIAMOND,
      avatarId: 'avatar-9',
      imageUrl: images.avatarYerevan.src,
      avatarLevel: 9,
      avatarBoost: { type: 'marketDiscount', pct: 18 },
      avatarDailyReward: { kind: 'stars', amount: 1 },
      featured: true,
      // Stars-only — see avatar-8 above.
      prices: [{ type: MarketPriceType.TELEGRAM_STARS, amount: 88 }],
    },
    {
      id: 'avatar-10',
      name: 'Cyber Emperor',
      category: MarketItemCategory.COSMETIC,
      cosmeticType: MarketCosmeticType.AVATAR,
      description: 'L10 · +25% claim reward — apex avatar with rainbow ring',
      accent: 'pink',
      avatarId: 'avatar-10',
      imageUrl: images.avatar.src,
      avatarLevel: 10,
      avatarBoost: { type: 'claimMultiplier', pct: 25 },
      avatarDailyReward: { kind: 'ticket', amount: 1, tier: 'gold' },
      isNew: true,
      prices: [
        { type: MarketPriceType.LC, amount: 600_000 },
        { type: MarketPriceType.TELEGRAM_STARS, amount: 150 },
      ],
    },
  ],

  statuses: [
    {
      id: 's1',
      name: 'Lucky Player',
      isNew: true,
      statusType: MarketStatusType.LUCKY_PLAYER,
      durationDays: 7,
      prices: [
        { type: MarketPriceType.LC, amount: 2_000_000 },
        { type: MarketPriceType.TELEGRAM_STARS, amount: 100 },
      ],
      perkBase: STATUS_PERK_BASE,
      // Mirrors the live `statusConfig.luckyPlayer.perks` on prod: the zeros are
      // real (tournament boosts and the stake-fee bonus are not granted today)
      // and must stay zeros here, because the screen's whole contract is that a
      // perk at 0 renders NO row.
      perks: {
        engineSpeedBoostPct: 10,
        stakeYieldBoostPct: 5,
        tournamentRewardBoostPct: 0,
        tournamentJoinApBoostPct: 0,
        marketDiscountPct: 10,
        referralPct: 15,
        adsDailyBonus: 10,
        adsSkipDaily: 10,
        stakeFeeDiscountBonusPct: 0,
        ticketSendDailyBonus: { BRONZE: 4, SILVER: 3, GOLD: 2, PLATINUM: 2, DIAMOND: 1 },
        bulkClaimEnabled: true,
      },
      dailyGift: { enabled: true, lc: 1_000, ticketTier: 'BRONZE', ticketCount: 2 },
    },
    {
      id: 's2',
      name: 'VIP Status',
      statusType: MarketStatusType.VIP,
      prices: [
        { type: MarketPriceType.LC, amount: 5_000_000 },
        { type: MarketPriceType.TELEGRAM_STARS, amount: 250 },
      ],
      // Back-compat fallback only (clients that predate `levelPrices`): the
      // level-2 step. Everything current reads the ladder below.
      upgradePrices: [
        { type: MarketPriceType.LC, amount: 1_000_000 },
        { type: MarketPriceType.TELEGRAM_STARS, amount: 50 },
      ],
      maxLevel: 20,
      // Per-level price ladder (mirrors the live `statusConfig` on prod): L1 =
      // first unlock, L2+ = the upgrade to reach that level. LC is pinned to
      // LS × 20,000 — the same $-parity Lucky Player is priced at, so neither
      // currency is the cheap path (DOCS §7.4).
      levelPrices: [
        250, 50, 60, 70, 80, 95, 110, 125, 145, 165, 190, 220, 250, 290, 330, 380, 440, 500, 575,
        660,
      ].map((ls, i) => ({ level: i + 1, lc: ls * 20_000, ls })),
      perkBase: STATUS_PERK_BASE,
      levelPerks: VIP_LEVEL_PERK_LADDER,
    },
  ],
};

/**
 * Real 30-day savings from production, read 09.08.2026 — not invented.
 *
 * The LC figure is the top market buyer's own: `M I K A`, VIP 20 (the live rate
 * is 10%, not the 20% DOCS still claims), 3 purchases totalling 10,412,000 LC
 * charged, i.e. 11,568,889 before the discount. The Stars figure is `AK001`'s,
 * VIP 20, 16 purchases totalling 1,386 ⭐ charged. Different players, taken
 * together on purpose: this fixture is the widest real pair the row has to fit,
 * and invented round numbers had been hiding exactly that.
 */
export const marketSavingsMock: MarketStatusSavings = {
  lc: 1_156_889,
  stars: 154,
  windowDays: 30,
};
