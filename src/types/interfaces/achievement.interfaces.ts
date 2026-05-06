import type {
  AchievementCategory,
  AchievementRarity,
  AchievementRewardType,
  AchievementShape,
} from '@/types/enums/achievement.enums';
import type { TicketsEnum } from '@/types/enums/ticket.enums';

export interface AchievementProgress {
  current: number;
  target: number;
}

export interface AchievementTier {
  current: number;
  max: number;
  thresholds: number[];
}

export interface AchievementSeries {
  id: string;
  name: string;
  position: number;
  total: number;
}

export interface AchievementReward {
  type: AchievementRewardType;
  amount?: number;
  ticketTier?: TicketsEnum;
}

export interface AchievementChainReward {
  tickets?: number;
  activityPoints?: number;
  ls?: number;
  lc?: number;
}

export interface AchievementRelatedTo {
  type: 'tournament' | 'partner' | 'event' | 'engine';
  id: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  shape: AchievementShape;
  iconUrl?: string;
  iconCode?: string;
  earned: boolean;
  earnedAt?: string;
  progress?: AchievementProgress;
  holdersPercentage: number;
  isPinned: boolean;
  pinnedSlot?: number;
  isCollagePinned?: boolean;
  collageSlot?: number;
  tier?: AchievementTier;
  series?: AchievementSeries;
  hidden: boolean;
  unlockReward?: AchievementReward;
  chainReward?: AchievementChainReward;
  symbolMeaning?: string;
  expiresAt?: string;
  relatedTo?: AchievementRelatedTo;
  shareable: boolean;
  shareUrl?: string;
}

export interface AchievementCatalogResponse {
  total: number;
  earned: number;
  achievements: Achievement[];
}

export interface PinAchievementRequest {
  achievementId: string;
  slot: number;
}

export interface UnpinAchievementRequest {
  slot: number;
}

export interface BuySlotResponse {
  slot: number;
  costLs: number;
  newTotalSlots: number;
  remainingLs: number;
}
