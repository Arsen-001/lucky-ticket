import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { TaskCategory, TaskFrequency } from '@/types/enums/tasks.enums';
import { layoutForCategory, layoutForTask } from '@/utils/pages/task-layout.utils';
import type { Task } from '@/types/interfaces/tasks.interfaces';

const root = process.cwd();

describe('layoutForCategory', () => {
  it('gives daily and weekly the full card in every category', () => {
    for (const frequency of [TaskFrequency.DAILY, TaskFrequency.WEEKLY]) {
      for (const category of Object.values(TaskCategory)) {
        expect(layoutForCategory(category, frequency, 7)).toBe('cards');
      }
    }
  });

  /**
   * The regression this file exists for. The production catalog holds exactly
   * one one-time Social task — «Boost the channel» (`t-266`), the priciest
   * one-off on the tab — and the single-line row it was drawn in gave its four
   * reward chips the whole width and the title the ~40px left over, so it
   * rendered as «Boos th…».
   */
  it('draws a one-item Social list as a card, not as a row', () => {
    expect(layoutForCategory(TaskCategory.SOCIAL, TaskFrequency.ONCE, 1)).toBe('cards');
  });

  it('earns the row shape back once the list is long enough to need it', () => {
    // The catalog is edited from the admin panel, so this can change without a
    // deploy — the count is read at render for exactly that reason.
    expect(layoutForCategory(TaskCategory.SOCIAL, TaskFrequency.ONCE, 2)).toBe('cards');
    expect(layoutForCategory(TaskCategory.SOCIAL, TaskFrequency.ONCE, 3)).toBe('rows');
    expect(layoutForCategory(TaskCategory.PROFILE, TaskFrequency.ONCE, 5)).toBe('rows');
  });

  it('keeps the shapes the other one-time sections already had', () => {
    expect(layoutForCategory(TaskCategory.ACHIEVEMENTS, TaskFrequency.ONCE, 33)).toBe(
      'achievement-row'
    );
    expect(layoutForCategory(TaskCategory.PROFILE_STATUS, TaskFrequency.ONCE, 11)).toBe(
      'compact-cards'
    );
    expect(layoutForCategory(TaskCategory.TOURNAMENTS, TaskFrequency.ONCE, 18)).toBe('grid');
  });
});

describe('the card takes its shape from the section', () => {
  /**
   * `TaskItemCard` used to work out «compact or full» from its own category,
   * which silently outranked the section: a task promoted to `cards` because it
   * carries sub-steps came back as a compact row, and the compact form has no
   * accordion — so the steps disappeared with no error.
   */
  it('has no category-based compact derivation left in TaskItemCard', () => {
    const src = readFileSync(
      resolve(root, 'src/components/pages/tabs/tasks/TaskItemCard.tsx'),
      'utf-8'
    );
    expect(src).toContain('const isCompactRow = compact;');
  });

  it('still promotes a sub-step task to the full card', () => {
    const task = {
      subSteps: [{ id: 's1', label: '1 / 2', completed: false }],
    } as unknown as Task;
    expect(layoutForTask(task, 'rows')).toBe('cards');
    expect(layoutForTask(task, 'compact-cards')).toBe('cards');
  });
});
