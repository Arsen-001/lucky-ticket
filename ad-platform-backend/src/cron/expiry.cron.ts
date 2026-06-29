import cron from 'node-cron';

import { env } from '../config/env';
import { sweepExpiredTournaments } from '../services/expiry.service';

/**
 * Schedules the recurring expired-campaign sweep (default: every minute).
 * Each tick closes timed-out ACTIVE tournaments and refunds their unused hold.
 * Errors are caught and logged so a single failed run never stops the schedule.
 */
export function startExpiryCron(): void {
  cron.schedule(env.EXPIRY_CRON, async () => {
    try {
      const { completed, refundedCents } = await sweepExpiredTournaments();
      if (completed > 0) {
        // eslint-disable-next-line no-console
        console.log(
          `⏱️  Expiry sweep: closed ${completed} tournament(s), refunded ${refundedCents} cents`
        );
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Expiry sweep failed:', err);
    }
  });

  // eslint-disable-next-line no-console
  console.log(`⏱️  Expiry cron scheduled: "${env.EXPIRY_CRON}"`);
}
