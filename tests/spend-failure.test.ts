import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { spendFailure, resolvedSpendFailure } from '../src/utils/global/spend-failure.utils';
import { giftPurchaseFailure } from '../src/utils/pages/gift.utils';
import type { Dictionary } from '../src/types/types/i18n.types';

const root = process.cwd();
const en: Record<string, string> = JSON.parse(
  readFileSync(resolve(root, 'messages/en.json'), 'utf8')
);

/** Real copy, so a mapping to a key that does not exist fails here. */
const t = ((key: string) => {
  if (!(key in en)) throw new Error(`missing message key: ${key}`);
  return en[key];
}) as Dictionary;

/**
 * Reported 11.08.2026: a market purchase with too little LC showed nothing but
 * the backend's own English sentence in a toast — on a Russian UI, for three
 * seconds, with no way to act on it.
 *
 * Two rules this locks in:
 *  1. Nothing the server says reaches the screen verbatim. Its exceptions
 *     ('Out of stock', 'Not enough LC') are a wire format, not copy.
 *  2. The two refusals with a way out — LC and Lucky Stars — resolve to a
 *     top-up screen rather than to a sentence.
 */
describe('spendFailure', () => {
  /**
   * Prefixes, not exact strings: the same shortfall is phrased five ways across
   * the services, and an exact table quietly demotes every variant it has not
   * seen to "something went wrong" — which is the bug this whole change is about.
   */
  it('routes every phrasing of a shortfall to the matching top-up screen', () => {
    const cases: [string, string][] = [
      ['Not enough LC', 'coins'],
      ['Not enough Lucky Stars', 'stars'],
      ['Not enough Lucky Stars for the stake fee', 'stars'],
      ['Not enough Lucky Stars for the cancel fee', 'stars'],
      ['Not enough TON', 'ton'],
      ['Not enough TON balance', 'ton'],
      ['Not enough TON (including network fee)', 'ton'],
      ['Not enough shards to level up', 'shards'],
      ['Not enough gold tickets', 'tickets'],
      ['Not enough bronze tickets', 'tickets'],
    ];
    for (const [message, kind] of cases) {
      expect(spendFailure({ status: 400, data: { message } }, t), message).toEqual({ kind });
    }
  });

  it('translates the refusals that have no way out', () => {
    const cases: [string, number][] = [
      ['Out of stock', 400],
      ['Item not found', 404],
      ['Price option not available', 400],
      ['Market is disabled', 403],
      ['Tier not unlocked for this item', 403],
      ['VIP already at max level', 400],
      ['Avatars are temporarily unavailable', 400],
      ['Avatar already owned', 400],
      ['Unsupported price type', 400],
    ];
    for (const [message, status] of cases) {
      const failure = spendFailure({ status, data: { message } }, t);
      expect(failure.kind, message).toBe('message');
      // The point of the whole mapping: never the server's own sentence.
      expect(failure.kind === 'message' && failure.text, message).not.toBe(message);
    }
  });

  /**
   * 18.08.2026: a double-tap on «улучшить» through a slow proxy sent two
   * upgrades; the second lost the backend's level CAS and came back as a
   * 500 → «не удалось связаться с сервером» — after the first had gone
   * through. The backend now answers 409 with this literal, and it must read
   * as what it is, not as a network failure.
   */
  it('translates the engine race verdicts', () => {
    expect(
      spendFailure({ status: 409, data: { message: 'Upgrade already in progress' } }, t)
    ).toEqual({ kind: 'message', text: en['purchase error upgrade conflict'] });
    // claim / claimAll / instantClaim / skipCycle share one verdict.
    expect(
      spendFailure({ status: 409, data: { message: 'Claim already in progress' } }, t)
    ).toEqual({ kind: 'message', text: en['purchase error claim conflict'] });
  });

  /**
   * The literals are a wire format shared with engines.service.ts. When the
   * backend checkout is present, prove the sentences the mapper knows are the
   * ones the service hands to `lostRace()` — a reworded verdict on either side
   * would silently demote it to «Не удалось выполнить покупку».
   */
  it('matches the sentences the backend actually throws', () => {
    const service = resolve(root, '../lucky-ticket-backend/src/engines/engines.service.ts');
    if (!existsSync(service)) return;
    const source = readFileSync(service, 'utf8');
    expect(source).toMatch(/lostRace\([^)]*'Upgrade already in progress'\)/);
    expect(source).toMatch(/lostRace\([^)]*'Claim already in progress'\)/);
  });

  /**
   * A 401 that survived the base query's refresh-and-retry is a lost session,
   * not a refused purchase. It used to fall through to «Покупка не прошла.
   * Попробуй ещё раз» — and trying again could only fail the same way.
   */
  it('reads a surviving 401 as a lost session', () => {
    expect(spendFailure({ status: 401, data: { message: 'Unauthorized' } }, t)).toEqual({
      kind: 'session',
    });
  });

  it('falls back to generic copy for a message it does not know', () => {
    expect(spendFailure({ status: 400, data: { message: 'Some new backend rule' } }, t)).toEqual({
      kind: 'message',
      text: en['purchase failed'],
    });
  });

  it('says "try again" when no verdict came back at all', () => {
    const retryable = { kind: 'message', text: en['purchase error network'] };
    expect(spendFailure({ status: 'FETCH_ERROR', error: 'Failed to fetch' }, t)).toEqual(retryable);
    expect(spendFailure({ status: 'TIMEOUT_ERROR' }, t)).toEqual(retryable);
    // A 5xx is the server falling over, not deciding.
    expect(spendFailure({ status: 500, data: { message: 'Internal error' } }, t)).toEqual(
      retryable
    );
  });

  it('never throws on a malformed error', () => {
    for (const error of [undefined, null, 'boom', {}, { status: 400, data: 'plain string body' }]) {
      expect(spendFailure(error, t).kind).toBe('message');
    }
  });

  it('passes through a failure the caller already resolved', () => {
    const failure = resolvedSpendFailure({ kind: 'message', text: 'already translated' });
    expect(spendFailure(failure, t)).toEqual({
      kind: 'message',
      text: 'already translated',
    });
  });
});

describe('giftPurchaseFailure', () => {
  it('sends a coin shortfall to the same top-up screen as the rest of the market', () => {
    expect(
      giftPurchaseFailure({ status: 400, data: { message: 'gift-insufficient-coins' } }, t)
    ).toEqual({ kind: 'coins' });
  });

  it('translates its own slugs, including the Telegram sub-code', () => {
    expect(
      giftPurchaseFailure({ status: 400, data: { message: 'gift-shop-disabled' } }, t)
    ).toEqual({ kind: 'message', text: en['gift error shop closed'] });
    expect(
      giftPurchaseFailure(
        { status: 400, data: { message: 'gift-send-failed:recipient-disallowed-gifts' } },
        t
      )
    ).toEqual({ kind: 'message', text: en['gift error gifts disallowed'] });
  });
});

/**
 * The regression itself, not just its mapper: `toast.error(serverMessage)` is
 * how the English sentence got on screen, and any new `data.message` read piped
 * straight into user-facing text would do it again.
 */
describe('the storefront never prints what the server said', () => {
  const tsxFiles = (dir: string): string[] =>
    readdirSync(resolve(root, dir), { withFileTypes: true }).flatMap(entry => {
      const path = `${dir}/${entry.name}`;
      if (entry.isDirectory()) return tsxFiles(path);
      return entry.name.endsWith('.tsx') ? [path] : [];
    });

  it('no market component reads a server message body', () => {
    const offenders = tsxFiles('src/components/pages/tabs/market').filter(file =>
      /data\??\.\s*message/.test(readFileSync(resolve(root, file), 'utf8'))
    );
    expect(offenders).toEqual([]);
  });
});
