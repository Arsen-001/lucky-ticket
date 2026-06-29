import { withTransaction } from '../db/pool';

export interface SweepResult {
  /** How many ACTIVE-but-expired tournaments were closed this run. */
  completed: number;
  /** Total cents refunded to advertisers across those tournaments. */
  refundedCents: number;
}

/**
 * Find every ACTIVE tournament whose time has run out, close it (COMPLETED),
 * and return its unused frozen click budget to the advertiser's balance.
 *
 * Called on a schedule by the expiry cron. `FOR UPDATE SKIP LOCKED` lets the
 * sweep run safely even if a previous run overlaps or a click is mid-flight on
 * one of the rows — locked rows are simply skipped and picked up next tick.
 */
export async function sweepExpiredTournaments(): Promise<SweepResult> {
  return withTransaction(async client => {
    const expired = await client.query<{
      id: string;
      advertiser_id: string;
      click_budget_hold: string;
    }>(
      `SELECT id, advertiser_id, click_budget_hold
         FROM tournaments
        WHERE status = 'ACTIVE' AND expires_at <= now()
        FOR UPDATE SKIP LOCKED`
    );

    let refundedCents = 0;

    for (const row of expired.rows) {
      const hold = Number(row.click_budget_hold);

      if (hold > 0) {
        await client.query('UPDATE advertisers SET balance = balance + $1 WHERE id = $2', [
          hold,
          row.advertiser_id,
        ]);
        await client.query(
          `INSERT INTO ledger (advertiser_id, tournament_id, type, amount, note)
           VALUES ($1, $2, 'REFUND', $3, 'Expired campaign — unused budget refund')`,
          [row.advertiser_id, row.id, hold]
        );
        refundedCents += hold;
      }

      await client.query(
        `UPDATE tournaments
           SET status = 'COMPLETED', completed_at = now(), click_budget_hold = 0
         WHERE id = $1`,
        [row.id]
      );
    }

    return { completed: expired.rowCount ?? 0, refundedCents };
  });
}
