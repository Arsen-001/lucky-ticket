import { describe, it, expect } from 'vitest';
import { isEmptyPayout } from '@/utils/pages/task-claim.utils';
import { TaskRewardType } from '@/types/enums/tasks.enums';

/**
 * The claim modal is a "you won" screen. Handed a payout of zero it still draws
 * the headline prize and the chip row, so the player gets an empty gift — which
 * is what "the ad gave me nothing" looked like on production, on the last ad of
 * the day, 19.08.2026.
 *
 * The backend's arithmetic at the day's boundary is fixed where it belongs
 * (`ads-claim-preview.spec.ts` in the backend). This is the second layer: a
 * check on the DATA, so the modal cannot celebrate a zero no matter which way a
 * zero arrives — a cap, an unconfigured ladder rung, or the next boundary bug.
 */
describe('isEmptyPayout', () => {
  it('calls a payout of nothing empty', () => {
    expect(isEmptyPayout([])).toBe(true);
    expect(isEmptyPayout(null)).toBe(true);
    expect(isEmptyPayout(undefined)).toBe(true);
    // The exact shape the backend sends for a capped view: it keeps the list
    // non-empty so the modal has something to render, and a zero is what makes
    // that render wrong.
    expect(isEmptyPayout([{ type: TaskRewardType.ACTIVITY_POINTS, amount: 0 }])).toBe(true);
  });

  it('does not call a real reward empty', () => {
    expect(isEmptyPayout([{ type: TaskRewardType.ACTIVITY_POINTS, amount: 2 }])).toBe(false);
  });

  it('keeps a payout whose AP was zeroed but which still pays', () => {
    // A bought view with the AP valve closed (DOCS §7.3): no activity points,
    // but LC and tickets are still real. Reading "the first entry is zero" as
    // "nothing was paid" would swallow a genuine reward.
    expect(
      isEmptyPayout([
        { type: TaskRewardType.ACTIVITY_POINTS, amount: 0 },
        { type: TaskRewardType.LC, amount: 500 },
      ])
    ).toBe(false);
  });
});
