import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { TaskCategory, TaskFrequency, TaskStatus } from '@/types/enums/tasks.enums';
import type { CategoryTasks, Task, TasksResponse } from '@/types/interfaces/tasks.interfaces';
import {
  claimableCountsByFrequency,
  claimableTasksRoute,
  countAllClaimable,
  frequencyTabCounts,
  isTaskClaimable,
} from '@/utils/global/tasks-claimable.utils';

const root = process.cwd();

const task = (over: Partial<Task> = {}): Task =>
  ({
    id: 't',
    category: TaskCategory.TOURNAMENTS,
    frequency: TaskFrequency.DAILY,
    status: TaskStatus.IN_PROGRESS,
    rarity: 'bronze',
    title: 'x',
    rewards: [],
    progress: { current: 0, target: 4 },
    ...over,
  }) as Task;

const category = (over: Partial<CategoryTasks> = {}): CategoryTasks => ({
  category: TaskCategory.TOURNAMENTS,
  daily: [],
  weekly: [],
  once: [],
  ...over,
});

const response = (over: Partial<TasksResponse> = {}): TasksResponse =>
  ({
    categories: [],
    ads: {
      enabled: true,
      total: 10,
      watchedToday: 0,
      resetAt: '',
      slots: Array.from({ length: 10 }, (_, index) => ({
        id: `a${index}`,
        index,
        rewards: [],
        watched: false,
      })),
    },
    ...over,
  }) as TasksResponse;

/**
 * The «есть что забрать» dot is the app's one promise that a tap pays. It is
 * worth exactly as much as the times it is dark — so what may light it is a
 * rule, not a detail.
 */
describe('the claim mark only ever marks a reward', () => {
  /**
   * Shipped counting unwatched rewarded-ad views: a fresh day starts with ten
   * of them, so the tab bar lit up every morning for every player and stayed
   * lit until the last video was watched. A mark that is always on says
   * nothing. A view is work — its button reads «Смотреть», not «Забрать».
   */
  it('never lights on rewarded-ad views alone', () => {
    const adsOnly = response({ categories: [category({ daily: [task()] })] });

    expect(countAllClaimable(adsOnly)).toBe(0);
    // …while the tab's own figure still counts them: it is a filter, and ten
    // views are ten reasons to open the tab.
    expect(frequencyTabCounts(adsOnly)[TaskFrequency.DAILY]).toBe(10);
  });

  it('lights on a ready task, and adds it to the tab figure', () => {
    const ready = response({
      categories: [category({ daily: [task({ status: TaskStatus.READY_TO_CLAIM })] })],
    });

    expect(countAllClaimable(ready)).toBe(1);
    expect(frequencyTabCounts(ready)[TaskFrequency.DAILY]).toBe(11);
  });

  /** A reward inside a collapsed accordion is still a reward waiting. */
  it('lights on a completed, unclaimed sub-step', () => {
    expect(
      isTaskClaimable(
        task({ subSteps: [{ id: 's1', label: 'x', completed: true, claimed: false }] })
      )
    ).toBe(true);

    expect(
      isTaskClaimable(
        task({ subSteps: [{ id: 's1', label: 'x', completed: true, claimed: true }] })
      )
    ).toBe(false);
  });

  it('stays dark on locked and already-claimed tasks', () => {
    expect(isTaskClaimable(task({ status: TaskStatus.LOCKED }))).toBe(false);
    expect(isTaskClaimable(task({ status: TaskStatus.COMPLETED }))).toBe(false);
  });

  /**
   * The mark has to lead somewhere. A one-time task, once ready, stays ready
   * until it is claimed — so a bare `/tasks`, which opens on Daily, leaves the
   * dot lit above a tab with nothing on it, every session, for good. Measured
   * on prod: the only two ready tasks on the account read were `reach-silver`
   * and `reach-gold`, both one-time.
   */
  it('points at the tab that actually holds the reward', () => {
    const once = response({
      categories: [
        category({
          category: TaskCategory.ACHIEVEMENTS,
          once: [
            task({ frequency: TaskFrequency.ONCE, status: TaskStatus.READY_TO_CLAIM }),
            task({ frequency: TaskFrequency.ONCE }),
          ],
        }),
      ],
    });
    expect(claimableTasksRoute(claimableCountsByFrequency(once))).toBe('/tasks?frequency=once');

    const weekly = response({
      categories: [category({ weekly: [task({ status: TaskStatus.READY_TO_CLAIM })] })],
    });
    expect(claimableTasksRoute(claimableCountsByFrequency(weekly))).toBe('/tasks?frequency=weekly');
  });

  /**
   * Daily is where `TasksContent` lands with no parameter, so the common path
   * keeps a clean URL — and so does "nothing claimable anywhere".
   */
  it('leaves the route bare for daily and for an empty board', () => {
    const daily = response({
      categories: [category({ daily: [task({ status: TaskStatus.READY_TO_CLAIM })] })],
    });
    expect(claimableTasksRoute(claimableCountsByFrequency(daily))).toBe('/tasks');
    expect(claimableTasksRoute(claimableCountsByFrequency(response()))).toBe('/tasks');
  });

  /**
   * Rewarded-ad views are not a reward waiting (see above), so they must not
   * steer the mark either — ten unwatched views every morning would pin it to
   * Daily and hide the one-time task it exists to point at.
   */
  it('is not steered to daily by unwatched ad views', () => {
    const adsPlusOnce = response({
      categories: [
        category({
          once: [task({ frequency: TaskFrequency.ONCE, status: TaskStatus.READY_TO_CLAIM })],
        }),
      ],
    });
    expect(frequencyTabCounts(adsPlusOnce)[TaskFrequency.DAILY]).toBe(10);
    expect(claimableTasksRoute(claimableCountsByFrequency(adsPlusOnce))).toBe(
      '/tasks?frequency=once'
    );
  });

  /**
   * The dot carries no figure — that is the whole distinction from the filter
   * chips. A `ClaimableDot` rendered with children would be a badge, and the
   * two would start to look like the same thing.
   */
  it('renders no number: the component takes no count', () => {
    const source = readFileSync(
      resolve(root, 'src/components/shared/badges/ClaimableDot.tsx'),
      'utf8'
    );
    expect(source).not.toMatch(/\bcount\b|\bchildren\b/);
  });
});
