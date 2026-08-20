import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { comingSoonConfig } from '@/config/coming-soon.config';

/**
 * The pre-launch gift ladder is a promise drawn by one repo and paid by
 * another, and neither notices when they stop agreeing.
 *
 * The screen draws `comingSoonConfig.giftFriendsRequired` steps and names the
 * gift; the backend files a claim at `PRE_LAUNCH_GIFT_FRIENDS` and sends only
 * what matches `PRE_LAUNCH_GIFT_EMOJI`. Lower the backend's threshold and
 * players are paid before the ladder fills; raise it and the ladder completes
 * on a promise nothing honours. Show a gift the backend will not send and the
 * screen advertises something nobody can receive. None of it shows up in a
 * type-check.
 *
 * Needs the backend checked out beside this repo — skipped otherwise, same as
 * the enum-parity guardrail.
 */

const backendPath = resolve(
  process.cwd(),
  '../lucky-ticket-backend/src/common/pre-launch-gift.constants.ts'
);
const hasBackend = existsSync(backendPath);
const source = hasBackend ? readFileSync(backendPath, 'utf8') : '';

/** The pool the screen shows, as written in the component. */
const componentPool = (() => {
  const file = readFileSync(
    resolve(process.cwd(), 'src/components/shared/gift-ladder/GiftLadder.tsx'),
    'utf8'
  );
  const block = file.match(/GIFT_POOL\s*=\s*\[([^\]]*)\]/)?.[1] ?? '';
  return [...block.matchAll(/'([^']+)'/g)].map(m => m[1]);
})();

/** '❤️' and '❤' are the same gift; only the variation selector differs. */
const bare = (value: string) => value.replace(/[︎️]/g, '');

describe('pre-launch gift ladder', () => {
  it('shows exactly the gift the promo pays out', () => {
    // One gift since 2026-08-04 — the four-way draw is gone. Written as the
    // literal pool rather than a length check: the point is that the screen and
    // the bot name the SAME thing, not that they name equally many.
    //
    // 💝 since 2026-08-13, and it is a FALLBACK on both sides now: the live
    // gift travels with the promo state (`giftEmoji`), because Telegram had
    // just retired the hardcoded one and nothing could repoint the promo
    // without a deploy. What still has to agree is where each side lands when
    // the server says nothing.
    expect(componentPool.map(bare)).toEqual(['💝']);
  });

  it.runIf(hasBackend)('threshold matches the backend', () => {
    const found = source.match(/PRE_LAUNCH_GIFT_FRIENDS\s*=\s*(\d+)/)?.[1];
    expect(found, 'PRE_LAUNCH_GIFT_FRIENDS not found in backend').toBeTruthy();
    expect(Number(found)).toBe(comingSoonConfig.giftFriendsRequired);
  });

  it.runIf(hasBackend)('gift pool matches the backend', () => {
    const block = source.match(/PRE_LAUNCH_GIFT_EMOJI\s*=\s*\[([^\]]*)\]/)?.[1];
    expect(block, 'PRE_LAUNCH_GIFT_EMOJI not found in backend').toBeTruthy();
    const backendPool = [...block!.matchAll(/'([^']+)'/g)].map(m => m[1]);
    expect(backendPool).toEqual(componentPool.map(bare));
  });

  it.runIf(hasBackend)('backend stores the pool without variation selectors', () => {
    // A '❤️' written into the backend constant compares unequal to the '❤'
    // Telegram puts on the sticker, so the pool comes back empty and every
    // approval fails while four gifts sit in stock.
    const block = source.match(/PRE_LAUNCH_GIFT_EMOJI\s*=\s*\[([^\]]*)\]/)?.[1] ?? '';
    expect(block).not.toMatch(/[︎️]/);
  });
});
