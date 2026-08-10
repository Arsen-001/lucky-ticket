import { describe, it, expect } from 'vitest';
import { STATIC_ROUTES } from '#/e2e/routes';
import {
  ADS_BLOCK_ROUTE,
  resolveTaskDestination,
  taskHasDestination,
} from '@/utils/pages/task-destination.utils';
import { TaskCategory } from '@/types/enums/tasks.enums';
import { mockData } from '@/mock/index.mock';
import type { TasksResponse } from '@/types/interfaces/tasks.interfaces';

const task = (over: Partial<Parameters<typeof resolveTaskDestination>[0]> = {}) => ({
  category: TaskCategory.ACHIEVEMENTS,
  deeplink: undefined,
  ...over,
});

describe('task destination', () => {
  it('sends every ads task to the block where an ad is actually watched', () => {
    // The catalog ships `/tasks` for all seven «Watch N ads» milestones — the
    // screen the card is drawn on. Pushing the current URL navigates nowhere,
    // which is exactly how that tap came to do nothing.
    expect(resolveTaskDestination(task({ category: TaskCategory.ADS, deeplink: '/tasks' }))).toBe(
      ADS_BLOCK_ROUTE
    );
    expect(resolveTaskDestination(task({ category: TaskCategory.ADS, deeplink: '/tasks/' }))).toBe(
      ADS_BLOCK_ROUTE
    );
    expect(resolveTaskDestination(task({ category: TaskCategory.ADS }))).toBe(ADS_BLOCK_ROUTE);
  });

  it('keeps a deeplink that names a section of the tasks screen', () => {
    const section = '/tasks?frequency=daily&category=profile';
    expect(
      resolveTaskDestination(task({ category: TaskCategory.PROFILE, deeplink: section }))
    ).toBe(section);
  });

  it('falls back to the category when the deeplink names a screen that does not exist', () => {
    // Task copy and links are editable from the admin panel, so a typo reaches
    // the client as data. Pushed verbatim it is a 404 with no tab bar.
    expect(
      resolveTaskDestination(task({ category: TaskCategory.STAKES, deeplink: '/stake' }))
    ).toBe('/stakes');
  });

  it('answers "nowhere" for the categories that have no single home', () => {
    // A guess would be worse: the chevron is drawn from this answer, and a
    // control that leads nowhere reads as a broken screen.
    for (const category of [TaskCategory.ACHIEVEMENTS, TaskCategory.QUEST, TaskCategory.PROFILE]) {
      expect(resolveTaskDestination(task({ category }))).toBeNull();
    }
    expect(taskHasDestination({ category: TaskCategory.QUEST })).toBe(false);
    expect(
      taskHasDestination({ category: TaskCategory.SOCIAL, externalLink: 'https://t.me/x' })
    ).toBe(true);
  });

  it('resolves every fixture task to a screen this app has', () => {
    // The fixture is a factory — every `getTasks` rebuilds it so a refetch sees
    // mutated state, exactly like the backend.
    const tasks = (mockData.tasks as () => TasksResponse)();
    const all = tasks.categories.flatMap(c => [...c.daily, ...c.weekly, ...c.once]);
    expect(all.length).toBeGreaterThan(0);

    const broken: string[] = [];
    for (const t of all) {
      const destination = resolveTaskDestination(t);
      if (!destination) continue;
      const [path] = destination.split('?');
      // Detail screens (`/tournaments/<id>`) are static-route prefixes.
      const known = STATIC_ROUTES.some(r => path === r || path.startsWith(`${r}/`));
      if (!known) broken.push(`${t.id} → ${destination}`);
    }

    expect(broken).toEqual([]);
  });
});
