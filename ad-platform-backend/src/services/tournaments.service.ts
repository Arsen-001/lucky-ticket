import type { PoolClient } from 'pg';

import { InsufficientFundsError, NotFoundError } from '../errors';
import type { TournamentRow } from '../types';
import { withTransaction } from '../db/pool';
import { calculateCost } from './calculate.service';

/** pg returns BIGINT as string; parse small in-range cents to Number safely. */
const toCents = (v: string | number | null): number => Number(v ?? 0);

// ===========================================================================
//  CREATE — hold the full campaign budget, book the fixed fee, go ACTIVE.
// ===========================================================================

export interface CreateTournamentInput {
  advertiserId: number;
  title: string;
  shortText?: string | null;
  longText?: string | null;
  bannerUrl?: string | null;
  targetUrl: string;
  clicksRequested: number;
  /** How long the campaign stays ACTIVE before the cron auto-completes it. */
  durationHours: number;
}

export interface CreateTournamentResult {
  tournament: TournamentRow;
  /** Advertiser balance (cents) after the full debit. */
  balanceAfter: number;
}

export async function createTournament(
  input: CreateTournamentInput
): Promise<CreateTournamentResult> {
  // Options are derived from the actual payload, never from client flags.
  const withBanner = Boolean(input.bannerUrl);
  const withLongText = Boolean(input.longText && input.longText.trim().length > 0);

  // Recompute the price server-side — the client total is never trusted.
  const cost = calculateCost({
    url: input.targetUrl,
    clicksRequested: input.clicksRequested,
    withBanner,
    withLongText,
    longText: input.longText ?? null,
  });

  return withTransaction(async client => {
    // Lock the advertiser row so two concurrent campaign creations can't both
    // pass the balance check and overspend.
    const advRes = await client.query<{ balance: string }>(
      'SELECT balance FROM advertisers WHERE id = $1 FOR UPDATE',
      [input.advertiserId]
    );
    if (advRes.rowCount === 0) throw new NotFoundError('Advertiser not found');

    const balance = toCents(advRes.rows[0].balance);
    if (balance < cost.total) {
      throw new InsufficientFundsError(
        `Campaign costs ${cost.total} cents, balance is ${balance} cents`
      );
    }

    // Debit the WHOLE campaign cost from the balance at once:
    //   fixed fee (→ platform revenue) + full click budget (→ escrow/hold).
    await client.query('UPDATE advertisers SET balance = balance - $1 WHERE id = $2', [
      cost.total,
      input.advertiserId,
    ]);

    const tRes = await client.query<TournamentRow>(
      `INSERT INTO tournaments
         (advertiser_id, title, short_text, long_text, banner_url, target_url,
          link_type_detected, fixed_cost, cpc_rate, clicks_requested,
          click_budget_hold, status, starts_at, expires_at)
       VALUES
         ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
          'ACTIVE', now(), now() + make_interval(hours => $12))
       RETURNING *`,
      [
        input.advertiserId,
        input.title,
        input.shortText ?? null,
        withLongText ? input.longText : null,
        withBanner ? input.bannerUrl : null,
        input.targetUrl,
        cost.linkType,
        cost.fixed.total,
        cost.cpcRate,
        input.clicksRequested,
        cost.clickBudget, // entire click budget starts frozen
        input.durationHours,
      ]
    );
    const tournament = tRes.rows[0];

    // Audit: fixed fee → platform revenue; click budget → escrow (HOLD).
    await client.query(
      `INSERT INTO ledger (advertiser_id, tournament_id, type, amount, note) VALUES
         ($1, $2, 'FIXED_FEE', $3, 'Tournament creation fixed fee'),
         ($1, $2, 'HOLD',      $4, 'Click budget frozen on creation')`,
      [input.advertiserId, tournament.id, cost.fixed.total, cost.clickBudget]
    );

    return { tournament, balanceAfter: balance - cost.total };
  });
}

// ===========================================================================
//  CLICK — bill the first unique click, free-redirect repeats. Race-safe.
// ===========================================================================

export type ClickReason = 'CHARGED' | 'DUPLICATE' | 'INACTIVE' | 'BUDGET_EXHAUSTED';

export interface ClickResult {
  /** Always returned — the player is redirected regardless of billing. */
  url: string;
  charged: boolean;
  /** Cents billed for this click (0 unless charged). */
  chargedAmount: number;
  clicksCurrent: number;
  /** True if this click (or the lack of budget) completed the campaign. */
  completed: boolean;
  reason: ClickReason;
}

export async function processClick(tournamentId: number, telegramId: number): Promise<ClickResult> {
  return withTransaction(async client => {
    // SELECT ... FOR UPDATE locks this tournament row, SERIALIZING every click
    // on it. With thousands of simultaneous clicks, Postgres queues them on
    // this lock — so the budget can never be double-spent or driven negative,
    // and the same player can never be billed twice. This is the race guard.
    const tRes = await client.query<TournamentRow>(
      'SELECT * FROM tournaments WHERE id = $1 FOR UPDATE',
      [tournamentId]
    );
    if (tRes.rowCount === 0) throw new NotFoundError('Tournament not found');

    const t = tRes.rows[0];
    const url = t.target_url;
    const cpc = toCents(t.cpc_rate);
    const hold = toCents(t.click_budget_hold);

    // Campaign no longer billing (completed / canceled / on hold): still
    // redirect the player — the destination link works — but charge nothing.
    if (t.status !== 'ACTIVE') {
      return {
        url,
        charged: false,
        chargedAmount: 0,
        clicksCurrent: t.clicks_current,
        completed: t.status === 'COMPLETED',
        reason: 'INACTIVE',
      };
    }

    // Repeat click from the same player → free redirect, no charge.
    const dup = await client.query(
      'SELECT 1 FROM click_logs WHERE tournament_id = $1 AND telegram_id = $2',
      [tournamentId, telegramId]
    );
    if (dup.rowCount && dup.rowCount > 0) {
      return {
        url,
        charged: false,
        chargedAmount: 0,
        clicksCurrent: t.clicks_current,
        completed: false,
        reason: 'DUPLICATE',
      };
    }

    // Safety net: budget can't fund another click → complete + refund leftover.
    // (Normally unreachable — we complete the moment budget drops below cpc.)
    if (hold < cpc) {
      await completeAndRefund(client, t, hold);
      return {
        url,
        charged: false,
        chargedAmount: 0,
        clicksCurrent: t.clicks_current,
        completed: true,
        reason: 'BUDGET_EXHAUSTED',
      };
    }

    // --- Bill the unique click ---
    // The UNIQUE(tournament_id, telegram_id) index is the final backstop: even
    // if two requests for the same player somehow reached here, the second
    // INSERT would throw and its whole transaction would roll back.
    await client.query(
      'INSERT INTO click_logs (tournament_id, telegram_id, charged) VALUES ($1, $2, $3)',
      [tournamentId, telegramId, cpc]
    );
    const upd = await client.query<{ click_budget_hold: string; clicks_current: number }>(
      `UPDATE tournaments
         SET click_budget_hold = click_budget_hold - $2,
             clicks_current    = clicks_current + 1
       WHERE id = $1
       RETURNING click_budget_hold, clicks_current`,
      [tournamentId, cpc]
    );
    const newHold = toCents(upd.rows[0].click_budget_hold);
    const clicksCurrent = upd.rows[0].clicks_current;

    await client.query(
      `INSERT INTO ledger (advertiser_id, tournament_id, type, amount, note)
       VALUES ($1, $2, 'CLICK_CHARGE', $3, 'Unique click charge')`,
      [t.advertiser_id, tournamentId, cpc]
    );

    // Auto-complete: budget hit $0 (can't fund the next click) OR goal reached.
    let completed = false;
    if (newHold < cpc || clicksCurrent >= t.clicks_requested) {
      await completeAndRefund(client, t, newHold);
      completed = true;
    }

    return {
      url,
      charged: true,
      chargedAmount: cpc,
      clicksCurrent,
      completed,
      reason: 'CHARGED',
    };
  });
}

/**
 * Mark a tournament COMPLETED and return any unused hold to the advertiser.
 * Must be called inside an open transaction that already holds the tournament
 * row lock.
 */
async function completeAndRefund(
  client: PoolClient,
  t: TournamentRow,
  remainingHold: number
): Promise<void> {
  if (remainingHold > 0) {
    await client.query('UPDATE advertisers SET balance = balance + $1 WHERE id = $2', [
      remainingHold,
      t.advertiser_id,
    ]);
    await client.query(
      `INSERT INTO ledger (advertiser_id, tournament_id, type, amount, note)
       VALUES ($1, $2, 'REFUND', $3, 'Unused click budget returned')`,
      [t.advertiser_id, t.id, remainingHold]
    );
  }
  await client.query(
    `UPDATE tournaments
       SET status = 'COMPLETED', completed_at = now(), click_budget_hold = 0
     WHERE id = $1`,
    [t.id]
  );
}
