import {
  MarketCosmeticType,
  MarketItemCategory,
  MarketItemRequirementType,
  MarketPriceType,
  MarketStatusType,
} from '@/types/enums/market.enums';
import type { AvatarBoost, AvatarDailyReward } from '@/types/interfaces/avatars.interfaces';
import type { InventoryChipType } from '@/types/interfaces/inventory.interfaces';
import type { StatusPerks } from '@/types/interfaces/user.interfaces';
import type { TicketType } from '@/types/types/ticket.types';

/** Lucky Player's once-per-UTC-day gift, as configured in the admin panel. */
export interface LuckyPlayerDailyGift {
  enabled: boolean;
  lc: number;
  /** Backend Tier casing (BRONZE…DIAMOND) — lowercase before `t()`. */
  ticketTier: string;
  ticketCount: number;
}

export interface MarketPrice {
  type: MarketPriceType;
  amount: number;
  /** Optional original (pre-discount) amount — for showing strike-through */
  originalAmount?: number;
}

export type MarketAccent = TicketType | 'pink' | 'purple' | 'gold';

export interface MarketRequirement {
  type: MarketItemRequirementType;
  count: number;
}

export interface MarketItemBase {
  id: string;
  name: string;
  prices: MarketPrice[];
  isNew?: boolean;
  /** Featured deal — shows in Hero/Featured section */
  featured?: boolean;
  /** Discount percentage (e.g. 25 for -25%) */
  discountPct?: number;
  /** ISO date when offer expires (for limited deals/passes) */
  expiresAt?: string;
  /** Admin-set storefront photo; when present the card shows it instead of the icon. */
  imageUrl?: string;
  /**
   * Units left when the item has a finite stock; undefined = unlimited.
   *
   * Lives on the BASE because the backend sets it in the shared `view()`
   * mapper — every category carries it. It used to be declared only on
   * `MarketEngine`, so a limited ticket, shard, avatar or VIP advertised no
   * limit and kept a live Buy button after selling out.
   */
  remainingSupply?: number;
}

export interface MarketTicket extends MarketItemBase {
  category?: MarketItemCategory.TICKET;
  ticketType: TicketType;
  isAvailable: boolean;
}

/** One VIP level's price (LC + Lucky Stars) — the cost to REACH that level. */
export interface VipLevelPrice {
  level: number;
  lc: number;
  ls: number;
}

/**
 * The bases the two counted status perks are added to, sent alongside a status
 * listing so the app can quote the resulting total (`+2 on top of 10 = 12`)
 * without holding its own copy of numbers the admin can move.
 */
export interface StatusPerkBase {
  /** Free daily rewarded-ad views everybody gets (`adsDailyBonus` sits on top). */
  adsDailyLimit: number;
  /** Free per-recipient daily sends by tier, keyed BRONZE…DIAMOND. 0 = tier closed. */
  ticketSendDailyLimit: Record<string, number>;
  /** Top bracket of the shared stake-fee volume discount, before any status bonus. */
  stakeFeeVolumeDiscountMaxPct: number;
}

/** One rung of the VIP ladder: the perks a VIP of `level` actually receives. */
export interface VipLevelPerks {
  level: number;
  perks: StatusPerks;
}

export interface MarketStatus extends MarketItemBase {
  category?: MarketItemCategory.STATUS;
  statusType: MarketStatusType;
  /**
   * LEGACY static privilege copy (i18n keys frozen into the catalog at seed
   * time). Kept in the payload for older clients; the app renders `perks` /
   * `levelPerks` instead, because these strings do not follow the admin config
   * and had drifted from it on nearly every row.
   */
  privileges?: string[];
  /** Lucky Player's live perk set, straight from the admin status config. */
  perks?: StatusPerks;
  /** Lucky Player's daily gift, when the admin has it enabled. */
  dailyGift?: LuckyPlayerDailyGift;
  /** VIP's live per-level perk ladder (one row per level, 1…maxLevel). */
  levelPerks?: VipLevelPerks[];
  /** Bases for the counted perks; absent on payloads that predate the ladder. */
  perkBase?: StatusPerkBase;
  requirements?: MarketRequirement[];
  durationDays?: number;
  /** Flat upgrade price (level-2 cost) — back-compat fallback for `levelPrices`. */
  upgradePrices?: MarketPrice[];
  /** Per-level VIP price ladder (admin-tunable). Picks the NEXT-level price. */
  levelPrices?: VipLevelPrice[];
  /** VIP level ceiling (admin-tunable). */
  maxLevel?: number;
}

export interface MarketEngine extends MarketItemBase {
  category: MarketItemCategory.ENGINE;
  ticketType: TicketType;
  /** Pre-set engine level on purchase */
  engineLevel: number;
}

export interface MarketShard extends MarketItemBase {
  category: MarketItemCategory.SHARD;
  type: InventoryChipType;
  quality: TicketType;
  /** Number of shards granted by one purchase */
  count: number;
}

export interface MarketCosmetic extends MarketItemBase {
  category: MarketItemCategory.COSMETIC;
  cosmeticType: MarketCosmeticType;
  description?: string;
  /** Optional accent for visual */
  accent?: TicketType | 'pink' | 'purple' | 'gold';
  /** AVATAR cosmeticType only — points to the granted avatar inventory id (matches UserAvatar.id) */
  avatarId?: string;
  /** AVATAR cosmeticType only — preview image URL */
  imageUrl?: string;
  /** AVATAR cosmeticType only — level 1–10 (used for ring colour + sorting) */
  avatarLevel?: number;
  /** AVATAR cosmeticType only — bound boost granted while equipped */
  avatarBoost?: AvatarBoost;
  /** AVATAR cosmeticType only — daily reward granted while equipped (avatars L6+) */
  avatarDailyReward?: AvatarDailyReward;
}

export interface MarketData {
  engines: MarketEngine[];
  tickets: MarketTicket[];
  shards: MarketShard[];
  cosmetics: MarketCosmetic[];
  statuses: MarketStatus[];
}

/**
 * What the player's status discount took off their Market charges over a
 * rolling window. Summed by the backend from the ledger, so it counts what was
 * actually charged rather than re-deriving it from today's discount rate — the
 * rate climbs with VIP level, and an estimate would be most wrong for the
 * players who bought the most.
 */
export interface MarketStatusSavings {
  /** Lucky Coins saved in the window. */
  lc: number;
  /** Lucky Stars saved in the window. */
  stars: number;
  /** Length of the window the two totals cover. */
  windowDays: number;
}
