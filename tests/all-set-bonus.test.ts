import { describe, expect, it } from 'vitest';
import { tasksMock } from '@/mock/tasks.mock';
import { TaskFrequency, TaskStatus } from '@/types/enums/tasks.enums';
import type { Task, TasksResponse } from '@/types/interfaces/tasks.interfaces';

/**
 * The all-set completion bonus (DOCS §12.4) — "complete every daily task".
 *
 * It shipped as a tournament-only meta task, and on a platform where Bronze is
 * the only auto-spawned tier that made its condition *identical* to
 * `task-daily-bronze`: the same four entries, a second reward six times the
 * size, a Gold medal it had no claim to, and a title promising it covered
 * everything while the channel check-in did not count towards it.
 *
 * These pin the shape both repos now agree on. The server-side rule has its own
 * suite (`tier-task-availability.spec.ts` in the backend); this one guards the
 * contract the client renders.
 */
const response = (): TasksResponse => tasksMock.tasks();

const dailyTasks = (data: TasksResponse): Task[] => data.categories.flatMap(c => c.daily);
const weeklyTasks = (data: TasksResponse): Task[] => data.categories.flatMap(c => c.weekly);

describe('all-set completion bonus', () => {
  it('is served outside the categories, one per recurring period', () => {
    const data = response();
    expect(data.allSet?.daily).toBeTruthy();
    expect(data.allSet?.weekly).toBeTruthy();
    expect(data.allSet?.daily?.frequency).toBe(TaskFrequency.DAILY);
    expect(data.allSet?.weekly?.frequency).toBe(TaskFrequency.WEEKLY);

    // Never in a category too — that is what made it read as a tier task.
    const inCategories = [...dailyTasks(data), ...weeklyTasks(data)].map(t => t.id);
    expect(inCategories).not.toContain(data.allSet!.daily!.id);
    expect(inCategories).not.toContain(data.allSet!.weekly!.id);
  });

  it('asks for more than one task, so it can never be a duplicate reward', () => {
    const data = response();
    for (const bonus of [data.allSet!.daily!, data.allSet!.weekly!]) {
      expect(bonus.progress.target).toBeGreaterThanOrEqual(2);
      expect(bonus.subSteps?.length).toBe(bonus.progress.target);
    }
  });

  it('lists exactly the period tasks the player can see', () => {
    const data = response();
    const visibleDaily = dailyTasks(data).filter(t => t.status !== TaskStatus.LOCKED);
    expect(data.allSet!.daily!.subSteps?.map(s => s.id)).toEqual(
      visibleDaily.map(t => `${data.allSet!.daily!.id}::${t.id}`)
    );
  });

  it('carries the day beyond the tournaments — the check-in counts', () => {
    const data = response();
    const members = new Set(
      data.allSet!.daily!.subSteps?.map(s => String(s.id).split('::')[1] ?? '')
    );
    const nonTournament = dailyTasks(data).filter(
      t => t.category !== 'tournaments' && t.status !== TaskStatus.LOCKED
    );
    expect(nonTournament.length).toBeGreaterThan(0);
    for (const task of nonTournament) expect(members.has(task.id)).toBe(true);
  });

  it('keeps its rows read-only — a member is claimed on its own card', () => {
    const data = response();
    for (const step of data.allSet!.daily!.subSteps ?? []) {
      expect(step.claimable).toBe(false);
      // No reward on the row: paying AP here as well as on the member task is
      // the double reward the rebuild removed.
      expect(step.reward).toBeUndefined();
    }
  });

  it('wears no tier, so it cannot borrow a tier medal', () => {
    const data = response();
    expect(data.allSet!.daily!.tier).toBeUndefined();
    expect(data.allSet!.weekly!.tier).toBeUndefined();
  });

  it('refuses the claim until the whole set is done', () => {
    const data = response();
    const bonus = data.allSet!.daily!;
    // A level-zero account has done nothing yet, so the bonus is not claimable
    // and the mock answers exactly as the backend does.
    expect(bonus.status).not.toBe(TaskStatus.READY_TO_CLAIM);
    const result = tasksMock['POST tasks/claim']({ body: { id: bonus.id } });
    expect((result as { error?: { status: number } }).error?.status).toBe(400);
  });

  it('leaves no phantom daily task behind', () => {
    // "Share your daily result" had no share mechanic, no link, and a deeplink
    // to the screen it sat on: 1 AP for a tap. Every daily task must now point
    // somewhere a player can actually act.
    const data = response();
    for (const task of dailyTasks(data)) {
      const target = task.deeplink ?? task.externalLink ?? '';
      expect(target).not.toBe('');
      expect(target).not.toBe('/tasks');
    }
  });
});
