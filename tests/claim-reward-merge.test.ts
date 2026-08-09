import { describe, expect, it } from 'vitest';
import { mergeRewards } from '@/utils/pages/task-claim.utils';
import { TaskRewardType } from '@/types/enums/tasks.enums';
import type { TaskReward } from '@/types/interfaces/tasks.interfaces';

const lc = (amount: number): TaskReward => ({ type: TaskRewardType.LC, amount });
const ap = (amount: number): TaskReward => ({ type: TaskRewardType.ACTIVITY_POINTS, amount });
const ticket = (amount: number, label: string): TaskReward => ({
  type: TaskRewardType.TICKETS,
  amount,
  label,
});

describe('reward modal payout merge', () => {
  /**
   * A bundle claim answers with one reward object per sub-step. Claiming a task
   * whose five steps each pay +1 AP drew five identical "+1" chips, which reads
   * as five prizes rather than one payout of +5.
   */
  it('sums repeats of one currency into a single entry', () => {
    expect(mergeRewards([lc(100), ap(1), ap(1), ap(1), ap(1), ap(1)])).toEqual([lc(100), ap(5)]);
  });

  it('keeps tiers apart — a Bronze and a Gold ticket are two prizes', () => {
    expect(mergeRewards([ticket(1, 'bronze'), ticket(1, 'gold'), ticket(1, 'bronze')])).toEqual([
      ticket(2, 'bronze'),
      ticket(1, 'gold'),
    ]);
  });

  it('does not mutate the response it was handed', () => {
    const rewards = [ap(1), ap(2)];
    mergeRewards(rewards);
    expect(rewards).toEqual([ap(1), ap(2)]);
  });

  it('keeps the server order, so the first reward stays the headline', () => {
    expect(mergeRewards([ap(2), lc(150), ap(3)])).toEqual([ap(5), lc(150)]);
  });

  it('survives an empty payout', () => {
    expect(mergeRewards([])).toEqual([]);
  });
});
