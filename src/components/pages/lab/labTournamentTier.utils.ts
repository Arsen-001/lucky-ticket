import type { TournamentType } from '@/types/types/tournaments.types';

/**
 * Tier colour as an `R G B` triplet, so a lab card can mix it at any opacity
 * (`rgb(var(--x) / 0.3)`) for glows, borders and rails. Same values the live
 * tournament card's glow uses — the options are judged on the real ladder.
 */
export const LAB_TIER_RGB: Record<TournamentType, string> = {
  bronze: '172 97 34',
  silver: '168 170 164',
  gold: '248 189 62',
  platinum: '192 190 177',
  diamond: '23 141 136',
};

/**
 * Nearest start first. The live slider shows whatever order the query returned
 * — on the mock data that is Platinum (3h) before Diamond (9h) before a
 * sponsor (5h) — so "which one starts next" cannot be read off the strip at
 * all. Every option here sorts, which is half of what they are proposing.
 */
export const byStartTime = <T extends { startTime?: string }>(items: T[]): T[] =>
  [...items].sort(
    (a, b) => new Date(a.startTime ?? 0).getTime() - new Date(b.startTime ?? 0).getTime()
  );
