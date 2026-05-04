import type { PeriodSubTab, TierSubTab } from '@/components/pages/tabs/tasks/TournamentSubTabs';

/**
 * Centralized configuration for the Tasks page — every magic number, storage
 * key, slider ID prefix, sub-tab set, or category-specific layout constant
 * lives here. Avoids hardcoded duplicates across `TasksContent`,
 * `TasksCategorySection`, the milestone slider, and the mock data.
 *
 * Bumping a value here is the single source of truth — all task UI updates.
 */
export const TASK_PAGE = {
  /** Skeleton transition duration when a sub-tab swaps. */
  subTabSkeletonMs: 320,
  /** Window in which list entry animations play; after this, re-renders skip animation. */
  entryAnimationMs: 800,
  /** Stagger between cards in the entry animation. */
  staggerDelayMs: 60,
  /**
   * Px offset above the bottom edge for the sticky collapse-actions row.
   * The component itself extends this with `env(safe-area-inset-bottom)` so
   * the row clears the iOS home indicator on notch devices.
   */
  stickyActionsBottomPx: 88,
  /** Fallback height for the sticky category nav before measuring. */
  stickyNavFallbackHeightPx: 64,
  /** Width of one milestone-slider card. */
  sliderSlideWidthPx: 176,
  /** Achievements section progressive disclosure. */
  achievementsCollapse: { initial: 3, step: 2 } as const,
  /** localStorage key for the user's pinned-task IDs. */
  pinnedStorageKey: 'lt:pinned-tasks',
} as const;

/** Tab set for tier-based sliders that exclude Bronze (Bronze == "general"). */
export const SLIDER_TIER_TABS_NO_BRONZE: TierSubTab[] = [
  'general',
  'silver',
  'gold',
  'platinum',
  'diamond',
];

/** Tab set for tournament tier sliders (all 5 tiers + general). */
export const SLIDER_TIER_TABS_FULL: TierSubTab[] = [
  'general',
  'bronze',
  'silver',
  'gold',
  'platinum',
  'diamond',
];

/** Leaderboard period tabs. */
export const SLIDER_LEADERBOARD_PERIOD_TABS: PeriodSubTab[] = [
  'daily',
  'weekly',
  'monthly',
  'alltime',
];

/**
 * Slider ID prefix patterns per category. Tasks whose `id` matches the
 * pattern are rendered in a milestone slider above the regular grid (and
 * filtered out of the grid via `getRegularTasks`).
 *
 * Used by both the mock builders (when generating IDs) and the runtime
 * filter (`getRegularTasks` in TasksContent.tsx).
 */
export const SLIDER_ID_PREFIX = {
  // Tickets
  ticketsGeneral: 'ticket-collect-',
  ticketsTier: (tier: string) => `ticket-${tier}-collect-`,
  // Engines
  enginesGeneral: 'engine-collect-',
  enginesTier: (tier: string) => `engine-${tier}-collect-`,
  // Stakes
  stakesCount: 'stake-count-',
  stakesVolume: 'stake-volume-',
  stakesTierCount: (tier: string) => `stake-${tier}-count-`,
  stakesTierVolume: (tier: string) => `stake-${tier}-volume-`,
  stakesTierPrefix: (tier: string) => `stake-${tier}-`,
  // Stars
  starsPurchase: 'star-purchase-',
  starsEarn: 'star-earn-',
  // Friends
  friendsInvite: 'friend-invite-',
  // Leaderboard
  leaderboardRank: (period: string) => `leaderboard-${period}-rank-`,
  // VIP
  vipLevel: 'vip-level-',
  // Tournaments — general (no tier)
  tournamentPodium: 'tournament-podium-',
  tournamentPlayed: 'tournament-played-',
  tournamentPlace: (place: string) => `tournament-${place}-`,
  // Tournaments — per-tier
  tournamentTierPlayed: (tier: string) => `tournament-${tier}-played-`,
  tournamentTierPlace: (tier: string, place: string) => `tournament-${tier}-${place}-`,
} as const;

/** Sub-tab key shared across every tier-aware slider for the "no specific tier" view. */
export const GENERAL_SUB_TAB = 'general';

/** Place keys used by the tournament 1st / 2nd / 3rd milestone chains. */
export const TOURNAMENT_PLACE_KEYS = ['1st', '2nd', '3rd'] as const;
export type TournamentPlaceKey = (typeof TOURNAMENT_PLACE_KEYS)[number];
