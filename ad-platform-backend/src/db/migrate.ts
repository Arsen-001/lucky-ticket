import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { pool } from './pool';

/**
 * Applies `schema.sql` (idempotent — every statement is IF NOT EXISTS) and
 * ensures a demo advertiser exists so the API is immediately exercisable.
 *
 * Run with: `npm run migrate`.
 */
async function migrate(): Promise<void> {
  const sql = readFileSync(join(__dirname, 'schema.sql'), 'utf8');
  await pool.query(sql);

  console.log('✅ Schema applied');

  // Dev seed: one casino advertiser funded with $1,000.00 (100_000 cents).
  const seed = await pool.query<{ id: string }>(
    `INSERT INTO advertisers (username, balance)
     VALUES ($1, $2)
     ON CONFLICT (username) DO NOTHING
     RETURNING id`,
    ['demo_casino', 100_000]
  );

  console.log(
    seed.rowCount
      ? `✅ Seed: created advertiser "demo_casino" (id=${seed.rows[0].id}, balance=$1000.00)`
      : '✅ Seed: advertiser "demo_casino" already exists'
  );

  await pool.end();
}

migrate().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
