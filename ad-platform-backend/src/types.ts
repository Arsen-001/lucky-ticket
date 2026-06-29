/** Detected destination-link category — drives the CPC rate. */
export type LinkType = 'WEB_LINK' | 'GOOGLE_PLAY' | 'APP_STORE';

/** Tournament lifecycle. */
export type TournamentStatus = 'HOLD' | 'ACTIVE' | 'COMPLETED' | 'CANCELED';

/**
 * A tournaments row as returned by `pg`.
 *
 * NOTE: BIGINT columns (id, *_cents money fields, telegram ids) come back as
 * STRINGS from node-postgres by default — that's intentional, it preserves
 * precision beyond 2^53. Money arithmetic is done in SQL, so we rarely parse
 * these in JS; when we must compare, we use BigInt.
 */
export interface TournamentRow {
  id: string;
  advertiser_id: string;
  title: string;
  short_text: string | null;
  long_text: string | null;
  banner_url: string | null;
  target_url: string;
  link_type_detected: LinkType;
  fixed_cost: string; // cents
  cpc_rate: string; // cents
  clicks_requested: number;
  clicks_current: number;
  click_budget_hold: string; // cents
  status: TournamentStatus;
  starts_at: string;
  expires_at: string;
  completed_at: string | null;
  created_at: string;
}

export interface AdvertiserRow {
  id: string;
  username: string;
  balance: string; // cents
  created_at: string;
}

/** A single unique-click record. One row per (tournament, player). */
export interface ClickLogRow {
  id: string;
  tournament_id: string;
  telegram_id: string;
  charged: string; // cents billed for this click
  clicked_at: string;
}

/**
 * Money-movement type for the audit ledger.
 * - HOLD         — click budget moved from balance into escrow at creation.
 * - FIXED_FEE    — creation fixed fee booked as platform revenue.
 * - CLICK_CHARGE — one unique click billed from escrow to platform revenue.
 * - REFUND       — unused escrow returned to the advertiser's balance.
 *
 * Platform revenue = SUM(amount) WHERE type IN ('FIXED_FEE', 'CLICK_CHARGE').
 */
export type LedgerType = 'HOLD' | 'FIXED_FEE' | 'CLICK_CHARGE' | 'REFUND';

export interface LedgerRow {
  id: string;
  advertiser_id: string;
  tournament_id: string | null;
  type: LedgerType;
  amount: string; // cents, always positive magnitude
  note: string | null;
  created_at: string;
}

/** Full price breakdown returned by the calculator — every value in cents. */
export interface CostBreakdown {
  linkType: LinkType;
  /** CPC rate per unique click, derived from the link type. */
  cpcRate: number;
  clicksRequested: number;
  fixed: {
    base: number;
    banner: number;
    longText: number;
    total: number;
  };
  /** cpcRate × clicksRequested — the amount frozen for clicks. */
  clickBudget: number;
  /** fixed.total + clickBudget — the full sum debited at creation. */
  total: number;
}
