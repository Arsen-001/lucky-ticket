import { TaskCategory, TaskFrequency } from '@/types/enums/tasks.enums';
import type { Task } from '@/types/interfaces/tasks.interfaces';

/**
 * How one task is drawn in a category section.
 *
 * `cards` — the full `TaskItemCard`, the only shape with a sub-step accordion.
 * `grid`  — two-per-row `TaskItemCardCompact`, for the long one-time lists.
 * `rows`  — single-line `TaskItemRow`, for the lightweight one-time categories.
 *
 * `compact-cards` — the same `TaskItemCard` in its single-line form, for the
 * one-time VIP ladder. It is a separate layout rather than something the card
 * works out from its own category: the card used to re-derive it, so a section
 * that asked for a full card got a compact row anyway and had no way to say
 * otherwise. One decision, made in one place.
 *
 * `achievement-row` — `AchievementTaskRow`, the one-time Achievements section:
 * a rarity medal, the headline across the full width and the reward chips
 * beneath it. The compact row it replaced gave the headline 36px of 398.
 */
export type TaskLayout = 'cards' | 'compact-cards' | 'grid' | 'rows' | 'achievement-row';

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

/**
 * A one-time list this short or shorter is drawn as cards, never as the
 * single-line rows: the row shape trades readability for scroll, and a list
 * this short has no scroll to buy back.
 */
const SHORT_LIST_MAX = 2;

/** Categories whose one-time list is light enough for the single-line row. */
const ROW_ONCE_CATEGORIES = new Set<TaskCategory>([TaskCategory.SOCIAL, TaskCategory.PROFILE]);

/**
 * The shape a whole section is drawn in.
 *
 * Daily and weekly are always full cards — only the card opens the sub-step
 * accordion, and the weekly «Check in 7 days this week» ships seven steps. The
 * one-time tab is where the shapes differ, and `taskCount` is part of that
 * call rather than a category-by-category assumption: the row was picked for
 * Social because that list used to be long, and the production catalog holds
 * exactly one Social task — «Boost the channel», the priciest one-off on the
 * tab. In a row its four reward chips took the whole width and left the title
 * ~40px, so it rendered as «Boos th…», with the subtitle naming its Telegram
 * Premium requirement behind a tap that navigates instead of expanding.
 *
 * The catalog is edited from the admin panel, so the count is read at render
 * rather than baked in: add a few Social follows back and the list earns the
 * row shape again on its own.
 */
export const layoutForCategory = (
  category: TaskCategory,
  frequency: TaskFrequency,
  taskCount: number
): TaskLayout => {
  if (frequency !== TaskFrequency.ONCE) return 'cards';
  // Achievements carry art of their own — a rarity medal — and the longest
  // names on the tab, so they get a row built for both.
  if (category === TaskCategory.ACHIEVEMENTS) return 'achievement-row';
  // The VIP ladder: 11 near-identical steps that differ by a number, so the
  // single-line card is the right density here.
  if (category === TaskCategory.PROFILE_STATUS) return 'compact-cards';
  if (ROW_ONCE_CATEGORIES.has(category)) return taskCount > SHORT_LIST_MAX ? 'rows' : 'cards';
  return 'grid';
};
