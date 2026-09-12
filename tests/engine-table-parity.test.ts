import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { CHIP_CAPACITY_TICKETS_TABLE } from '@/utils/global/inventory.utils';
import {
  CAPACITY_LEVEL_BONUS_TICKETS_TABLE,
  ENGINE_FULL_LEVEL_BONUS_TICKETS_TABLE,
  ENGINE_FULL_LEVEL_SPEED_BONUS_PCT_TABLE,
  ENGINE_LEVEL_BASE_CAPACITY_TABLE,
  ENGINE_LEVEL_SPEED_BOOST_PCT_TABLE,
  SPEED_LEVEL_BOOST_PCT_TABLE,
} from '@/utils/global/ticket-engine.utils';

/**
 * Backend ↔ frontend engine level-table parity guardrail (audit L1).
 *
 * The four tables in ticket-engine.utils.ts define what every engine level
 * gives (speed % / base capacity). The backend mirrors them literally in
 * economy.constants.ts and is server-authoritative — if one side is edited
 * without the other, the optimistic UI drifts from what the server actually
 * grants (and MAX_BOOST_LEVEL / MAX_ENGINE_LEVEL, derived from table lengths,
 * silently diverge). This test diffs the backend literals against ours.
 *
 * Requires the backend repo checked out next to this one; skipped otherwise
 * (e.g. CI that only clones the frontend).
 */

const constantsPath = resolve(
  process.cwd(),
  '../lucky-ticket-backend/src/common/economy.constants.ts'
);
const hasBackend = existsSync(constantsPath);

/** Extract `export const <name>: readonly number[] = [ ... ];` from source. */
const parseNumberTable = (source: string, name: string): number[] => {
  const match = source.match(new RegExp(`export const ${name}[^=]*=\\s*\\[([^\\]]*)\\]`));
  if (!match) throw new Error(`${name} not found in backend economy.constants.ts`);
  const cells = match[1]
    .replace(/\/\/[^\n]*/g, '') // strip inline comments
    .replace(/_/g, '') // numeric separators
    .match(/-?\d+(?:\.\d+)?/g);
  return (cells ?? []).map(Number);
};

describe.skipIf(!hasBackend)('backend ↔ frontend engine table parity', () => {
  const source = hasBackend ? readFileSync(constantsPath, 'utf8') : '';

  const PAIRS: [string, readonly number[]][] = [
    ['SPEED_LEVEL_BOOST_PCT_TABLE', SPEED_LEVEL_BOOST_PCT_TABLE],
    ['CAPACITY_LEVEL_BONUS_TICKETS_TABLE', CAPACITY_LEVEL_BONUS_TICKETS_TABLE],
    ['ENGINE_LEVEL_SPEED_BOOST_PCT_TABLE', ENGINE_LEVEL_SPEED_BOOST_PCT_TABLE],
    ['ENGINE_LEVEL_BASE_CAPACITY_TABLE', ENGINE_LEVEL_BASE_CAPACITY_TABLE],
    ['ENGINE_FULL_LEVEL_BONUS_TICKETS_TABLE', ENGINE_FULL_LEVEL_BONUS_TICKETS_TABLE],
    ['ENGINE_FULL_LEVEL_SPEED_BONUS_PCT_TABLE', ENGINE_FULL_LEVEL_SPEED_BONUS_PCT_TABLE],
    ['CHIP_CAPACITY_TICKETS_TABLE', CHIP_CAPACITY_TICKETS_TABLE],
  ];

  it.each(PAIRS)('%s matches the backend cell-for-cell', (name, frontendTable) => {
    expect(parseNumberTable(source, name)).toEqual([...frontendTable]);
  });
});
