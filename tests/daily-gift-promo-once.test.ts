import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * The daily-gift OFFER (DOCS §7.2a) is shown to a non-subscriber ONCE, ever.
 *
 * Until 2026-08-09 it rode the same daily timer as the gift itself: a player
 * without the subscription was pitched the same status on the first entry of
 * every day, and a reinstall or a second device handed the whole run of pitches
 * back, because the only throttle was a `localStorage` "dismissed today" stamp.
 *
 * The rule now lives on the account (`User.lpGiftPromoSeenAt`), and the two
 * halves that make it work are easy to undo by accident — hence this file.
 */

const root = process.cwd();
const read = (p: string) => readFileSync(resolve(root, p), 'utf8');

describe('the Lucky Player offer is spent, not repeated', () => {
  it('spending the offer invalidates nothing', () => {
    // The instinct is to invalidate `statusDailyGift` after stamping. Doing so
    // refetches while the offer is on screen, the server answers
    // `shouldSurface: false`, and the modal — which is driven by exactly that
    // field — closes itself a second after opening, under the player's finger.
    const source = read('src/api/statusGift.api.ts');
    const endpoint = source.slice(source.indexOf('markDailyGiftPromoSeen'));

    expect(endpoint, 'the promo-seen endpoint must exist').toContain('promo-seen');
    expect(endpoint).not.toMatch(/invalidatesTags/);
  });

  it('the offer is burned when it is on screen, not when it is dismissed', () => {
    // Stamping on dismissal hands the offer back to everyone who swipes the app
    // away instead of tapping, and `wants` alone is not "on screen" — the popup
    // may still be queued behind a tournament result, and burning it there
    // spends an offer nobody ever saw.
    const source = read('src/components/layout-elements/DailyGiftAutoSurface.tsx');
    const effect = source.slice(source.indexOf('promoBurned'));

    expect(effect).toMatch(/if \(!canShow \|\|/);
    expect(effect, 'only the promo audience may burn it').toMatch(/surfaceReason !== 'promo'/);
    // The guard must not sit in `close()` — that is the dismissal path.
    const close = source.slice(
      source.indexOf('const close ='),
      source.indexOf('const handleClaim')
    );
    expect(close).not.toMatch(/markPromoSeen/);
  });

  it('the gift itself is still throttled per day, not per lifetime', () => {
    // The one-time rule applies to the pitch only. A subscriber has a new gift
    // every UTC day, and the day stamp is what re-opens the modal for them.
    const source = read('src/components/layout-elements/DailyGiftAutoSurface.tsx');

    expect(source).toContain('lt-daily-gift-dismissed');
    // Метка — сегодняшний UTC-день; сама арифметика с 23.08.2026 общая с промо
    // приглашений и живёт в `date.utils`. @see utcDay
    expect(source).toMatch(/utcDay\(\)/);
    expect(source).toMatch(/from '@\/utils\/global\/date\.utils'/);
  });
});
