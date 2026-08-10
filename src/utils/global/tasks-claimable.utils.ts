import { TaskCategory, TaskFrequency, TaskStatus } from '@/types/enums/tasks.enums';
import type { CategoryTasks, Task, TasksResponse } from '@/types/interfaces/tasks.interfaces';
import { type Route, routes } from '@/constants/routes';

/**
 * "Is there anything to take here", in one place.
 *
 * Every surface that marks a claimable reward — the dot on a card, the counts
 * on the frequency tabs and the category chips, the dot on the Tasks tab of the
 * bar and on the shortcuts that lead to it — answers the question with these
 * helpers. Split out of `TasksContent` when the marks spread past the tasks
 * screen: two copies of the rule mean a bar that promises a reward the screen
 * does not show.
 */

/**
 * Profile and Partners are intentionally absent from the one-time tab — Profile
 * setup lives in Settings, Partners in the advertiser cabinet.
 */
const HIDDEN_ONCE_CATEGORIES = new Set<TaskCategory>([TaskCategory.PROFILE, TaskCategory.PARTNERS]);

/**
 * Does this category render at all in this tab. `adsEnabled` is the admin kill
 * switch: with ads off no ad surface survives — neither the daily slots nor the
 * one-time watch milestones — so nothing may count them either.
 */
export const isCategoryVisibleForFrequency = (
  category: TaskCategory,
  frequency: TaskFrequency,
  adsEnabled = true
): boolean => {
  if (!adsEnabled && category === TaskCategory.ADS) return false;
  return !(frequency === TaskFrequency.ONCE && HIDDEN_ONCE_CATEGORIES.has(category));
};

export const tasksForFrequency = (cat: CategoryTasks, frequency: TaskFrequency): Task[] => {
  if (frequency === TaskFrequency.DAILY) return cat.daily;
  if (frequency === TaskFrequency.WEEKLY) return cat.weekly;
  return cat.once;
};

/**
 * Something can be taken from this task right now — the whole reward, or a
 * sub-step's. The sub-step counts: the card has always marked it separately,
 * and a player who can collect something does not care which half of the row
 * it hangs on.
 *
 * A step the server marks `claimable: false` pays nothing, so it never makes
 * the task collectable — that is every step since sub-steps stopped carrying
 * AP of their own, and it is what keeps the "something to claim" dot honest.
 */
export const isTaskClaimable = (task: Task): boolean => {
  if (task.status === TaskStatus.READY_TO_CLAIM) return true;
  if (task.status === TaskStatus.LOCKED || task.status === TaskStatus.COMPLETED) return false;
  return !!task.subSteps?.some(step => step.claimable !== false && step.completed && !step.claimed);
};

export const countClaimableTasks = (tasks: Task[]): number => tasks.filter(isTaskClaimable).length;

export const hasClaimableTask = (tasks: Task[]): boolean => tasks.some(isTaskClaimable);

/**
 * Rewarded-ad views left in the day.
 *
 * **Not claimable.** A view is work the player has yet to do — its button says
 * «Смотреть», not «Забрать» — so it belongs in a filter's count of what is
 * actionable inside a section, and nowhere near the «есть что забрать» mark.
 * Counted as claimable it would light the tab bar every morning for every
 * player, which is the same as never lighting it at all.
 */
export const countClaimableAdSlots = (data?: TasksResponse): number => {
  if (!data?.ads || data.ads.enabled === false) return 0;
  return data.ads.slots.filter(slot => !slot.watched).length;
};

/**
 * Claimable count per frequency tab — counting only what that tab actually
 * renders, so a category hidden from a tab never inflates its badge. Tasks
 * only: see `countClaimableAdSlots` for why ad views are not in here.
 */
export const claimableCountsByFrequency = (data?: TasksResponse): Record<TaskFrequency, number> => {
  const counts: Record<TaskFrequency, number> = {
    [TaskFrequency.DAILY]: 0,
    [TaskFrequency.WEEKLY]: 0,
    [TaskFrequency.ONCE]: 0,
  };
  if (!data) return counts;

  const adsEnabled = data.ads?.enabled !== false;
  data.categories.forEach(cat => {
    (Object.values(TaskFrequency) as TaskFrequency[]).forEach(frequency => {
      if (!isCategoryVisibleForFrequency(cat.category, frequency, adsEnabled)) return;
      counts[frequency] += countClaimableTasks(tasksForFrequency(cat, frequency));
    });
  });

  return counts;
};

/**
 * What each frequency tab has to show for itself: everything claimable in it,
 * plus the day's remaining ad views. This is the tab's own filter count — the
 * number of rows worth opening it for — and deliberately a wider set than the
 * claim mark above, which is why the tabs carry a figure and not a dot.
 */
export const frequencyTabCounts = (data?: TasksResponse): Record<TaskFrequency, number> => {
  const counts = claimableCountsByFrequency(data);
  counts[TaskFrequency.DAILY] += countClaimableAdSlots(data);
  return counts;
};

/** Everything the player can collect on the tasks screen right now. */
export const countAllClaimable = (data?: TasksResponse): number =>
  Object.values(claimableCountsByFrequency(data)).reduce((sum, count) => sum + count, 0);

/** Tab order of the tasks screen — the first one holding a reward wins. */
const FREQUENCY_ORDER: TaskFrequency[] = [
  TaskFrequency.DAILY,
  TaskFrequency.WEEKLY,
  TaskFrequency.ONCE,
];

/**
 * Where the claim mark leads: the tasks route aimed at the tab that holds the
 * reward.
 *
 * Every surface carrying the dot used to link to a bare `/tasks`, which opens
 * on Daily — and a one-time task, once ready, stays ready until it is claimed.
 * So the bar promised a reward, the screen opened on a tab with nothing on it,
 * and the dot read as broken. The daily tab's own counter includes unwatched ad
 * views, so it always shows a figure and the count on «Разовые» is easy to
 * miss.
 *
 * Daily needs no parameter — it is the default `TasksContent` falls back to,
 * and so is "nothing claimable anywhere".
 */
export const claimableTasksRoute = (byFrequency: Record<TaskFrequency, number>): Route => {
  const first = FREQUENCY_ORDER.find(frequency => byFrequency[frequency] > 0);
  return first && first !== TaskFrequency.DAILY
    ? `${routes.tasks}?frequency=${first}`
    : routes.tasks;
};
