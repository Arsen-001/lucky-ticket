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
import type { MarketData, MarketPrice } from '@/types/interfaces/market.interfaces';

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
        { type: MarketPriceType.LC, amount: 3_000 },
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
        { type: MarketPriceType.LC, amount: 3_000 },
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
        { type: MarketPriceType.LC, amount: 7_000 },
        { type: MarketPriceType.TELEGRAM_STARS, amount: 1 },
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
        { type: MarketPriceType.LC, amount: 7_000 },
        { type: MarketPriceType.TELEGRAM_STARS, amount: 1 },
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
        { type: MarketPriceType.LC, amount: 15_000 },
        { type: MarketPriceType.TELEGRAM_STARS, amount: 3 },
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
        { type: MarketPriceType.LC, amount: 15_000 },
        { type: MarketPriceType.TELEGRAM_STARS, amount: 3 },
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
        { type: MarketPriceType.LC, amount: 32_000 },
        { type: MarketPriceType.TELEGRAM_STARS, amount: 6 },
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
        { type: MarketPriceType.LC, amount: 32_000 },
        { type: MarketPriceType.TELEGRAM_STARS, amount: 6 },
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
        { type: MarketPriceType.LC, amount: 65_000 },
        { type: MarketPriceType.TELEGRAM_STARS, amount: 11 },
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
        { type: MarketPriceType.LC, amount: 65_000 },
        { type: MarketPriceType.TELEGRAM_STARS, amount: 11 },
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
      privileges: [
        'lp engine speed boost',
        'lp stake yield boost',
        'lp stake fee discount',
        'lp market discount value',
        'lp tournament reward boost',
        'lp tournament join ap boost',
        'higher ticket send limits',
        'send platinum diamond tickets',
        'lp claim all tickets',
        'lp watch ads daily',
        'lp referral boost',
        'lucky player badge on profile',
      ],
    },
    {
      id: 's2',
      name: 'VIP Status',
      statusType: MarketStatusType.VIP,
      prices: [
        { type: MarketPriceType.LC, amount: 20_000_000 },
        { type: MarketPriceType.TELEGRAM_STARS, amount: 500 },
      ],
      upgradePrices: [
        { type: MarketPriceType.LC, amount: 10_000_000 },
        { type: MarketPriceType.TELEGRAM_STARS, amount: 250 },
      ],
      maxLevel: 20,
      // Per-level price ladder (mirrors the backend STATUS_CONFIG_DEFAULTS): L1 =
      // first unlock, L2+ = the upgrade to reach that level.
      levelPrices: Array.from({ length: 20 }, (_, i) => {
        const level = i + 1;
        return {
          level,
          lc: level === 1 ? 20_000_000 : 10_000_000,
          ls: level === 1 ? 500 : 250,
        };
      }),
      privileges: [
        'vip engine speed boost',
        'vip stake yield boost',
        'vip stake fee discount',
        'vip market discount value',
        'vip tournament reward boost',
        'vip tournament join ap boost',
        'higher ticket send limits',
        'send platinum diamond tickets',
        'vip watch ads daily',
        'vip referral boost',
        'vip level badge on profile',
        'dedicated support',
      ],
    },
  ],
};
