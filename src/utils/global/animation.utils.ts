import type { CSSProperties } from 'react';

/**
 * Longest entry delay any staggered item may carry.
 *
 * `animate-slide-in-bottom` runs with `animation-fill-mode: both`, so an item
 * holds its from-state — `opacity: 0` — for the whole of its delay. Multiplying
 * the delay by an unbounded list index therefore does not stagger a long list,
 * it hides the tail of it: measured on the paginated notifications feed, the
 * last screenful of 48 rows was still blank four seconds after it loaded, and
 * the same arithmetic sits under the leaderboard (100 rows), the transaction
 * histories, the FAQ and the friends list.
 *
 * Capping the delay rather than the index keeps one number to reason about —
 * nothing is invisible for longer than the animation itself takes to play —
 * and leaves short lists untouched, since they never reach the ceiling.
 */
export const MAX_STAGGER_MS = 400;

/** Default per-item step. Dense grids pass 50, tab-style rows 100 (AGENTS.md). */
const DEFAULT_STAGGER_STEP_MS = 60;

/**
 * Entry-animation delay in milliseconds for the item at `index`.
 *
 * Items past the first screenful are off-screen when they mount, so nobody can
 * see them stagger — they only need to be visible by the time they are scrolled
 * to. @see MAX_STAGGER_MS
 */
export const staggerMs = (index: number, stepMs: number = DEFAULT_STAGGER_STEP_MS): number =>
  Math.min(Math.max(index, 0) * stepMs, MAX_STAGGER_MS);

/** `staggerMs` as an inline style, for the common `style={...}` call site. */
export const staggerStyle = (
  index: number,
  stepMs: number = DEFAULT_STAGGER_STEP_MS
): CSSProperties => ({ animationDelay: `${staggerMs(index, stepMs)}ms` });
