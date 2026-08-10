import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { layoutForTask, type TaskLayout } from '@/utils/pages/task-layout.utils';
import type { Task } from '@/types/interfaces/tasks.interfaces';

const root = process.cwd();
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');

const LAYOUTS: TaskLayout[] = ['cards', 'grid', 'rows'];

/** The three shapes a task can be drawn in, and what each can render. */
const SHAPES = {
  cards: 'src/components/pages/tabs/tasks/TaskItemCard.tsx',
  grid: 'src/components/pages/tabs/tasks/TaskItemCardCompact.tsx',
  rows: 'src/components/pages/tabs/tasks/TaskItemRow.tsx',
} as const;

const task = (over: Partial<Task> = {}): Task => ({ id: 't', ...over }) as Task;
const withSteps = task({
  subSteps: [{ id: 's1', label: '1 / 2', completed: true }],
});

/**
 * A sub-step that cannot be opened is a reward the player never learns they
 * have. It shipped once — weekly «Отметься 7 дней на неделе» carries seven
 * steps and was drawn as a single-line row, whose chevron opens a subtitle and
 * nothing else. Five collected days sat behind it, invisible, with no error
 * anywhere. These tests are about the whole class, not that one task.
 */
describe('a task with sub-steps is always drawn in a shape that can open them', () => {
  it('promotes a sub-step task to the card from every section layout', () => {
    for (const layout of LAYOUTS) expect(layoutForTask(withSteps, layout)).toBe('cards');
  });

  it('leaves every other task in the shape its section chose', () => {
    for (const layout of LAYOUTS) {
      expect(layoutForTask(task(), layout)).toBe(layout);
      expect(layoutForTask(task({ subSteps: [] }), layout)).toBe(layout);
    }
  });

  /**
   * The premise of the rule above: only the card renders sub-steps. If a row
   * or a compact tile ever grows an accordion, this fails — and whoever added
   * it gets to decide whether the promotion is still wanted, instead of the
   * rule quietly outliving its reason.
   */
  it('is still true that only the full card renders sub-steps', () => {
    expect(read(SHAPES.cards)).toMatch(/subSteps/);
    expect(read(SHAPES.grid), 'compact tile has no accordion').not.toMatch(/subSteps/);
    expect(read(SHAPES.rows), 'single-line row has no accordion').not.toMatch(/subSteps/);
    // The milestone carousel draws its own card, and it has no accordion
    // either — chains render one card per step, so they carry no sub-steps.
    expect(
      read('src/components/pages/tabs/tasks/TournamentMilestoneSlider.tsx'),
      'milestone card has no accordion'
    ).not.toMatch(/subSteps/);
  });

  /**
   * And the rule has to be the thing the section actually applies — a section
   * that switches on its raw `layout` again would pass every test above while
   * dropping the steps exactly as before.
   */
  it('is applied by the section, not bypassed', () => {
    const section = read('src/components/pages/tabs/tasks/TasksCategorySection.tsx');
    expect(section).toMatch(/layoutForTask\(task, layout\)/);
    expect(section, 'the raw layout must not pick the component').not.toMatch(
      /if \(layout === '(grid|rows)'\)/
    );
  });
});
