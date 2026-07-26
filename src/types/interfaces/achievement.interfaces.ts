import type {
  AchievementCategory,
  AchievementRarity,
  AchievementRewardType,
  AchievementShape,
} from '@/types/enums/achievement.enums';
import type { TicketsEnum } from '@/types/enums/ticket.enums';
import type { LocalizedText } from '@/types/interfaces/faq.interfaces';

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
  name: LocalizedText | string;
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
  /**
   * Player-facing copy in every app language. A badge mirrors a milestone, so
   * it carries the milestone's own localized text — resolve it at render with
   * `getLocalizedText`, exactly like tasks and the FAQ. Legacy/mock rows may
   * still send a bare string.
   */
  name: LocalizedText | string;
  description: LocalizedText | string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  shape: AchievementShape;
  iconUrl?: string;
  iconCode?: string;
  earned: boolean;
  earnedAt?: string;
  progress?: AchievementProgress;
  /**
   * Share of players holding this badge, counted live on the server.
   * `null` while the player base is too small for a percentage to mean
   * anything — render nothing rather than a figure nobody can stand behind.
   */
  holdersPercentage: number | null;
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
