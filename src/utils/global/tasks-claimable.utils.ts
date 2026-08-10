import { TaskCategory, TaskFrequency, TaskStatus } from '@/types/enums/tasks.enums';
import type { CategoryTasks, Task, TasksResponse } from '@/types/interfaces/tasks.interfaces';

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
 */
export const isTaskClaimable = (task: Task): boolean => {
  if (task.status === TaskStatus.READY_TO_CLAIM) return true;
  if (task.status === TaskStatus.LOCKED || task.status === TaskStatus.COMPLETED) return false;
  return !!task.subSteps?.some(step => step.completed && !step.claimed);
};

export const countClaimableTasks = (tasks: Task[]): number => tasks.filter(isTaskClaimable).length;

export const hasClaimableTask = (tasks: Task[]): boolean => tasks.some(isTaskClaimable);

/** An unwatched rewarded-ad slot is a reward waiting to be taken, like a task. */
export const countClaimableAdSlots = (data?: TasksResponse): number => {
  if (!data?.ads || data.ads.enabled === false) return 0;
  return data.ads.slots.filter(slot => !slot.watched).length;
};

/**
 * Claimable count per frequency tab — counting only what that tab actually
 * renders, so a category hidden from a tab never inflates its badge.
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

  counts[TaskFrequency.DAILY] += countClaimableAdSlots(data);
  return counts;
};

/** Everything the player can collect on the tasks screen right now. */
export const countAllClaimable = (data?: TasksResponse): number =>
  Object.values(claimableCountsByFrequency(data)).reduce((sum, count) => sum + count, 0);
