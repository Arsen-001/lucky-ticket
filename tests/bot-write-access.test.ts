import { describe, expect, it } from 'vitest';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { canAskWriteAccess } from '@/hooks/useBotWriteAccess';

const tg = (over: Record<string, unknown> = {}) =>
  ({
    initData: 'query_id=AA&user=%7B%7D&hash=x',
    requestWriteAccess: () => {},
    ...over,
  }) as Parameters<typeof canAskWriteAccess>[0];

const modern = () => true;
const ancient = () => false;

/**
 * A Telegram bot may not write first, so this permission is what decides
 * whether ANY notification the game offers can be delivered. Production
 * measured it the expensive way on 19.08.2026: of ~1000 engine-ready
 * reminders, zero arrived — every recipient had reached the Mini App by link
 * or QR and never opened a chat with the bot.
 */
describe('bot write-access prompt gating', () => {
  it('asks when the client supports it and permission is missing', () => {
    expect(canAskWriteAccess(tg(), modern)).toBe(true);
  });

  /**
   * Outside Telegram there is no SDK at all — a plain browser, local dev, the
   * e2e run. The card must not appear there, and `ask()` would have nothing to
   * call.
   */
  it('stays silent outside Telegram', () => {
    expect(canAskWriteAccess(undefined, modern)).toBe(false);
    expect(canAskWriteAccess(tg({ initData: '' }), modern)).toBe(false);
  });

  /**
   * `requestWriteAccess` arrived in Bot API 6.9. On an older client the SDK
   * either lacks the method or logs "not supported" to the console and does
   * nothing — either way a button offering it would do nothing when tapped,
   * which is worse than not offering it.
   */
  it('stays silent on a client older than 6.9', () => {
    expect(canAskWriteAccess(tg(), ancient)).toBe(false);
    expect(canAskWriteAccess(tg({ requestWriteAccess: undefined }), modern)).toBe(false);
  });
});

describe('bot write-access wiring', () => {
  const backendRoot = resolve(process.cwd(), '../lucky-ticket-backend');
  const hasBackend = existsSync(backendRoot);

  /**
   * The permission is only worth asking for if the answer is recorded: it rides
   * in the SIGNED initData as `allows_write_to_pm`, and the backend has to read
   * it there and store it. A frontend that asks and a backend that never looks
   * would leave the audience filter guessing exactly as it did before.
   */
  it.runIf(hasBackend)('is read from the signed initData on the backend', () => {
    const util = readFileSync(resolve(backendRoot, 'src/auth/telegram.util.ts'), 'utf8');
    const auth = readFileSync(resolve(backendRoot, 'src/auth/auth.service.ts'), 'utf8');
    const users = readFileSync(resolve(backendRoot, 'src/users/users.service.ts'), 'utf8');

    expect(util).toContain('allows_write_to_pm');
    // Both branches — the returning player and the brand-new account. Only the
    // create path was ever silently dropping it (a conditional spread skips
    // excess-property checking, so `tsc` had nothing to say).
    expect(auth.match(/allows_write_to_pm/g)?.length ?? 0).toBeGreaterThanOrEqual(2);
    expect(users).toContain('botWriteAllowed');
  });

  /** A column the schema declares but no migration creates is a 500 on deploy. */
  it.runIf(hasBackend)('ships the column with a migration', () => {
    const schema = readFileSync(resolve(backendRoot, 'prisma/schema.prisma'), 'utf8');
    expect(schema).toContain('botWriteAllowed');

    const migrations = resolve(backendRoot, 'prisma/migrations');
    const declared = readdirSync(migrations)
      .filter(name => existsSync(resolve(migrations, name, 'migration.sql')))
      .map(name => readFileSync(resolve(migrations, name, 'migration.sql'), 'utf8'))
      .join('\n');
    expect(declared).toContain('botWriteAllowed');
  });
});
