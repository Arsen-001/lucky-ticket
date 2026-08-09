import {
  MarketCosmeticType,
  MarketItemCategory,
  MarketItemRequirementType,
  MarketPriceType,
  MarketStatusType,
} from '@/types/enums/market.enums';
import type { AvatarBoost, AvatarDailyReward } from '@/types/interfaces/avatars.interfaces';
import type { InventoryChipType } from '@/types/interfaces/inventory.interfaces';
import type { TicketType } from '@/types/types/ticket.types';

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

export interface MarketStatus extends MarketItemBase {
  category?: MarketItemCategory.STATUS;
  statusType: MarketStatusType;
  /** Optional: spread in from `attributes`, so an admin-created item may omit it. */
  privileges?: string[];
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
