import type { LinkType } from '../types';

/**
 * Tariff constants — the single source of truth for all pricing.
 *
 * IMPORTANT: every monetary value in this codebase is an INTEGER NUMBER OF CENTS
 * (USD). We never use floating point for money — `$0.80` is `80`, `$50` is
 * `5000`. This avoids float rounding bugs entirely, and the database stores the
 * same cents in BIGINT columns. Convert to dollars only at the display edge.
 */
export const PRICING = {
  /** Base fee to create a tournament — mandatory step. $50. */
  CREATE_TOURNAMENT_FIXED_CENTS: 5_000,
  /** Optional custom banner. +$50. */
  BANNER_OPTION_CENTS: 5_000,
  /** Optional long ad text (up to 500 chars). +$20. */
  LONG_TEXT_OPTION_CENTS: 2_000,
  /** Hard limit for the long ad text. */
  LONG_TEXT_MAX_LENGTH: 500,
  /** CPC rate per UNIQUE click, by detected link type. */
  CPC_CENTS: {
    WEB_LINK: 80, // $0.80 — any regular web URL
    GOOGLE_PLAY: 100, // $1.00 — play.google.com
    APP_STORE: 150, // $1.50 — apps.apple.com
  } satisfies Record<LinkType, number>,
} as const;

/** Cents → dollars (number), for computed payloads. */
export const centsToUsd = (cents: number): number => Math.round(cents) / 100;

/** Cents → "$1,234.56" string, for display. */
export const formatUsd = (cents: number): string =>
  `$${centsToUsd(cents).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
