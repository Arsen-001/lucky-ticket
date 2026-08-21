import { describe, expect, it } from 'vitest';
import { classifyClaimError, isSkipRefusal } from '../src/utils/pages/task-claim.utils';

/**
 * Reported 08.08.2026: claim the daily check-in, tap the row again, and the
 * modal said "Couldn't reach the server. Tap retry to try again." — on a
 * request the server had answered perfectly well with 400 `Task already
 * claimed`. Retry re-sent the same claim, got the same 400, and reopened the
 * same modal. With the modal's close button hidden, that read as a freeze.
 *
 * The rule this locks in: only a transport failure may offer Retry.
 */
describe('classifyClaimError', () => {
  it('reads the backend\'s "already claimed" 400 as a settled claim, not a network fault', () => {
    expect(classifyClaimError({ status: 400, data: { message: 'Task already claimed' } })).toBe(
      'claimed'
    );
  });

  it('treats other 4xx refusals as rejections — retrying them can only fail again', () => {
    expect(
      classifyClaimError({ status: 400, data: { message: 'Milestone not reached yet' } })
    ).toBe('rejected');
    expect(classifyClaimError({ status: 400, data: { message: 'Nothing to claim' } })).toBe(
      'rejected'
    );
    expect(classifyClaimError({ status: 404, data: { message: 'Task not found' } })).toBe(
      'rejected'
    );
    // A 400 with no message body is still a verdict, not a dropped connection.
    expect(classifyClaimError({ status: 400 })).toBe('rejected');
  });

  it('keeps Retry for transport failures and for timing-based refusals', () => {
    expect(classifyClaimError({ status: 'FETCH_ERROR', error: 'Failed to fetch' })).toBe('network');
    expect(classifyClaimError({ status: 'TIMEOUT_ERROR' })).toBe('network');
    expect(classifyClaimError({ status: 500, data: { message: 'Internal error' } })).toBe(
      'network'
    );
    expect(classifyClaimError({ status: 503 })).toBe('network');
    // Timing, not a verdict — the same claim can succeed a moment later.
    expect(classifyClaimError({ status: 408 })).toBe('network');
    expect(classifyClaimError({ status: 429 })).toBe('network');
  });

  it('never throws on a malformed error', () => {
    expect(classifyClaimError(undefined)).toBe('network');
    expect(classifyClaimError(null)).toBe('network');
    expect(classifyClaimError('boom')).toBe('network');
    expect(classifyClaimError({ status: 400, data: 'plain string body' })).toBe('rejected');
  });
});

/**
 * Reported from production 21.08.2026: a Lucky Player took the day's ten
 * «Забрать без просмотра» views and the next tap opened a modal with no prize
 * in it — «Награда недоступна».
 *
 * Nothing was broken on the paying side: the admin panel showed 12 of 12 views
 * that day, every one of them worth 1 AP, and rung #10 of the live ladder pays
 * 1 AP · 500 LC · 1⭐ · 3 tickets. What the player hit was the server refusing
 * the SKIP (`403 ad-skip-exhausted`) — and `classifyClaimError` sorts every
 * 4xx into `rejected`, which is the rewardless card.
 *
 * A refused skip costs the player nothing: no view was granted, no daily slot
 * was spent. The Tasks screen therefore replays the tap as an ordinary view
 * instead of reporting a loss, and this pair of rules is what keeps the two
 * kinds of "no" apart.
 */
describe('isSkipRefusal', () => {
  it('recognises both refusals the skip endpoint can answer with', () => {
    expect(isSkipRefusal({ status: 403, data: { message: 'ad-skip-exhausted' } })).toBe(true);
    expect(isSkipRefusal({ status: 403, data: { message: 'ad-skip-not-granted' } })).toBe(true);
  });

  it('leaves every other refusal to the reward modal', () => {
    // Same status, a different verdict: ads switched off is not "watch it instead".
    expect(isSkipRefusal({ status: 403, data: { message: 'Ads are disabled' } })).toBe(false);
    expect(isSkipRefusal({ status: 400, data: { message: 'ad-skip-exhausted' } })).toBe(false);
    expect(isSkipRefusal({ status: 500 })).toBe(false);
    expect(isSkipRefusal(new Error('offline'))).toBe(false);
    expect(isSkipRefusal(null)).toBe(false);
  });
});
