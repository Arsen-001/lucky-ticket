/**
 * Every notification category, in the order the filter chips show them.
 *
 * A runtime list rather than a bare type union because three places need to
 * iterate it: the chips, the optimistic cache patches (which must reach every
 * cached filter), and the parity check against the backend's Prisma enum.
 */
export const NOTIFICATION_TYPES = [
  'tournament',
  'task',
  'reward',
  'friend',
  'stake',
  'leaderboard',
  'system',
] as const;

/** The two pseudo-filters that sit ahead of the per-type chips. */
export const NOTIFICATION_PSEUDO_FILTERS = ['all', 'unread'] as const;

/**
 * Rows per page. Small enough that the first screen paints fast, large enough
 * that a full phone of notifications is one request rather than three.
 */
export const NOTIFICATIONS_PAGE_SIZE = 20;
