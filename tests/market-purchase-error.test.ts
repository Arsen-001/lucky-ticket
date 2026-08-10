import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  marketPurchaseFailure,
  resolvedMarketFailure,
} from '../src/utils/pages/market-purchase.utils';
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
describe('marketPurchaseFailure', () => {
  it('routes a balance refusal to the matching top-up screen', () => {
    expect(marketPurchaseFailure({ status: 400, data: { message: 'Not enough LC' } }, t)).toEqual({
      kind: 'coins',
    });
    expect(
      marketPurchaseFailure({ status: 400, data: { message: 'Not enough Lucky Stars' } }, t)
    ).toEqual({ kind: 'stars' });
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
      const failure = marketPurchaseFailure({ status, data: { message } }, t);
      expect(failure.kind, message).toBe('message');
      // The point of the whole mapping: never the server's own sentence.
      expect(failure.kind === 'message' && failure.text, message).not.toBe(message);
    }
  });

  it('falls back to generic copy for a message it does not know', () => {
    expect(
      marketPurchaseFailure({ status: 400, data: { message: 'Some new backend rule' } }, t)
    ).toEqual({ kind: 'message', text: en['purchase failed'] });
  });

  it('says "try again" when no verdict came back at all', () => {
    const retryable = { kind: 'message', text: en['purchase error network'] };
    expect(marketPurchaseFailure({ status: 'FETCH_ERROR', error: 'Failed to fetch' }, t)).toEqual(
      retryable
    );
    expect(marketPurchaseFailure({ status: 'TIMEOUT_ERROR' }, t)).toEqual(retryable);
    // A 5xx is the server falling over, not deciding.
    expect(marketPurchaseFailure({ status: 500, data: { message: 'Internal error' } }, t)).toEqual(
      retryable
    );
  });

  it('never throws on a malformed error', () => {
    for (const error of [undefined, null, 'boom', {}, { status: 400, data: 'plain string body' }]) {
      expect(marketPurchaseFailure(error, t).kind).toBe('message');
    }
  });

  it('passes through a failure the caller already resolved', () => {
    const failure = resolvedMarketFailure({ kind: 'message', text: 'already translated' });
    expect(marketPurchaseFailure(failure, t)).toEqual({
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
