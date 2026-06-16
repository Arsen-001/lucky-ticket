import { Pool, type PoolClient } from 'pg';

import { env } from '../config/env';

/**
 * Shared connection pool. node-postgres returns BIGINT columns as STRINGS by
 * default (to preserve precision beyond 2^53) — we keep that behaviour and do
 * all money arithmetic in SQL, parsing to Number only for small in-range cents.
 */
export const pool = new Pool({ connectionString: env.DATABASE_URL });

pool.on('error', err => {
  // A pooled client errored while idle — log, don't crash the process.
  // eslint-disable-next-line no-console
  console.error('Unexpected PG pool error:', err);
});

/**
 * Run `fn` inside a single transaction. Commits on success, rolls back on any
 * thrown error, and always releases the client back to the pool.
 *
 * Every money-mutating operation (create, click, refund) goes through here so a
 * partial failure can never leave balances or holds in an inconsistent state.
 */
export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
