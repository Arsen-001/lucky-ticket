import type { Task } from '@/types/interfaces/tasks.interfaces';

/**
 * How one task is drawn in a category section.
 *
 * `cards` — the full `TaskItemCard`, the only shape with a sub-step accordion.
 * `grid`  — two-per-row `TaskItemCardCompact`, for the long one-time lists.
 * `rows`  — single-line `TaskItemRow`, for the lightweight one-time categories.
 *
 * `achievement-row` — `AchievementTaskRow`, the one-time Achievements section:
 * a rarity medal, the headline across the full width and the reward chips
 * beneath it. The compact row it replaced gave the headline 36px of 398.
 */
export type TaskLayout = 'cards' | 'grid' | 'rows' | 'achievement-row';

/**
 * A task that carries sub-steps is always drawn as a card, whatever shape the
 * section around it is using.
 *
 * `TaskItemRow` and `TaskItemCardCompact` do not render `subSteps` at all —
 * they have no accordion — so a task with steps handed to either of them loses
 * them **silently**: no error, no empty state, just a chevron that opens a
 * subtitle. That shipped: weekly «Отметься 7 дней на неделе» carries seven
 * steps, sat in a `rows` section, and five collected days were invisible.
 *
 * Fixing the section's layout rule fixed that one task; this fixes the class.
 * The shape a category prefers is a matter of taste, but whether the player
 * can see what they have collected is not — so the data wins over the taste.
 */
export const layoutForTask = (task: Task, sectionLayout: TaskLayout): TaskLayout =>
  task.subSteps?.length ? 'cards' : sectionLayout;
