import {
  MarketCosmeticType,
  MarketItemCategory,
  MarketItemRequirementType,
  MarketPriceType,
  MarketStatusType,
  TicketBoostType,
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
}

export interface MarketBundleItem {
  kind: 'ticket' | 'stars' | 'ltc' | 'chip' | 'booster' | 'engine';
  amount: number;
  /** Tier for tier-bound items (ticket, chip, booster, engine) */
  tier?: TicketType;
}

export interface MarketBundle extends MarketItemBase {
  category: MarketItemCategory.BUNDLE;
  description?: string;
  contents: MarketBundleItem[];
}

export interface MarketBoost extends MarketItemBase {
  category?: MarketItemCategory.BOOST;
  boostPercentage: number;
  type: TicketBoostType;
  ticketType: TicketType;
  isAvailable?: boolean;
}

export interface MarketTicket extends MarketItemBase {
  category?: MarketItemCategory.TICKET;
  ticketType: TicketType;
  isAvailable: boolean;
}

export interface MarketStatus extends MarketItemBase {
  category?: MarketItemCategory.STATUS;
  statusType: MarketStatusType;
  privileges: string[];
  requirements?: MarketRequirement[];
  durationDays?: number;
  upgradePrices?: MarketPrice[];
}

export interface MarketEngine extends MarketItemBase {
  category: MarketItemCategory.ENGINE;
  ticketType: TicketType;
  /** Pre-set engine level on purchase */
  engineLevel: number;
  /** Slots left for sale (limited supply) */
  remainingSupply?: number;
}

export interface MarketShard extends MarketItemBase {
  category: MarketItemCategory.SHARD;
  type: InventoryChipType;
  quality: TicketType;
  /** Number of shards granted by one purchase */
  count: number;
}

export interface MarketBooster extends MarketItemBase {
  category: MarketItemCategory.BOOSTER;
  type: InventoryChipType;
  quality: TicketType;
  effectPct: number;
  durationHours: number;
  /** Pack size (some listings grant multiple boosters at once) */
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
  bundles: MarketBundle[];
  engines: MarketEngine[];
  tickets: MarketTicket[];
  boosts: MarketBoost[];
  shards: MarketShard[];
  boosters: MarketBooster[];
  cosmetics: MarketCosmetic[];
  statuses: MarketStatus[];
}
