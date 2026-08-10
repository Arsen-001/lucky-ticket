import { routes, type Route } from '@/constants/routes';
import { TaskCategory } from '@/types/enums/tasks.enums';
import type { Task } from '@/types/interfaces/tasks.interfaces';

/**
 * The daily rewarded-ads block — the one place in the app where an ad is
 * actually watched. `?frequency=` + `?category=` are the params `TasksContent`
 * already listens to, so this both switches the tab and scrolls the block into
 * view.
 */
export const ADS_BLOCK_ROUTE = `${routes.tasks}?frequency=daily&category=ads` as Route;

/**
 * Where a category sends the player when its task does not say. Only categories
 * with ONE unambiguous destination are listed. The ones left out have no single
 * home, and a wrong guess is worse than no chevron at all:
 *
 *  - `achievements` — "claim from an engine", "invite a friend", "log in 7 days"
 *    each lead somewhere different;
 *  - `profile` — "verify your email", "connect a TON wallet" and "check in 7
 *    days this week" share nothing but the word profile;
 *  - `quest` — the all-set bonus opens its checklist instead of leaving, and
 *    that is why its catalog row carries an explicit `null` deeplink.
 */
const CATEGORY_DESTINATION: Partial<Record<TaskCategory, Route>> = {
  [TaskCategory.ADS]: ADS_BLOCK_ROUTE,
  [TaskCategory.TOURNAMENTS]: routes.tournaments.index,
  [TaskCategory.LEADERBOARD]: routes.leaderboard,
  [TaskCategory.FRIENDS]: routes.inviteFriends,
  // Engines live on the Tickets tab. `routes.engines.index` is only a base for
  // `/engines/:id` — it has no screen, which is why `next.config.ts` redirects
  // it; sending a player through that hop is a slower way to the same place.
  [TaskCategory.ENGINES]: routes.tickets.index,
  [TaskCategory.TICKETS]: routes.tickets.index,
  [TaskCategory.STAKES]: routes.stakes.index,
  // Stars are bought in the wallet (`BuyStarsModal`), not on the Stars screen,
  // which only lists the balance and its history.
  [TaskCategory.STARS]: routes.wallet,
  [TaskCategory.PROFILE_STATUS]: routes.market('status'),
  [TaskCategory.PARTNERS]: routes.partners.index,
  [TaskCategory.TEST_QUEST]: routes.testQuest,
};

/**
 * First path segment of every screen this app can open. A task's deeplink is
 * server data — editable in the admin panel — so it can name a screen that does
 * not exist; pushing that lands the player on a 404 with the tab bar gone.
 *
 * Kept in sync with `e2e/routes.ts` by `tests/task-destination.test.ts`.
 */
const KNOWN_SEGMENTS = new Set([
  '', // '/' — home
  'tournaments',
  'market',
  'tasks',
  'tickets',
  'jackpot',
  'partners',
  'promo',
  'wallet',
  'lc',
  'stars',
  'stakes',
  'engines',
  'inventory',
  'leaderboard',
  'invite-friends',
  'activity',
  'notifications',
  'profile',
  'support',
  'faq',
  'privacy',
  'terms-of-use',
  'test-quest',
  'settings',
  'languages',
  'login',
  'register',
  'forgot-password',
  'reset-password',
  'two-factor',
]);

const isKnownRoute = (path: string): boolean =>
  path.startsWith('/') && KNOWN_SEGMENTS.has(path.split('/')[1] ?? '');

/**
 * Where tapping a task card takes the player — or `null` when it takes them
 * nowhere and the card must not offer a chevron.
 *
 * The catalog lives on the backend and is editable from the admin panel, so a
 * task arrives with whatever `deeplink` was typed for it. Three of those are not
 * navigable and were being pushed verbatim:
 *
 *  - **a bare `/tasks`** — every "Watch N ads" milestone ships this, and it is
 *    the screen the card is already on. `router.push` of the current URL does
 *    nothing at all: no navigation, no re-render, no effect. The tap on the ads
 *    milestone was dead for exactly this reason.
 *  - **nothing at all** — "Verify your email", "First stake", "Connect TON
 *    wallet" have no deeplink in the catalog.
 *  - **a screen that does not exist** — a typo in the admin panel.
 *
 * In all three the task's own category still knows where the player has to go,
 * so it answers instead of the data.
 */
export function resolveTaskDestination(
  task: Pick<Task, 'category' | 'deeplink' | 'externalLink'>
): Route | null {
  const raw = task.deeplink?.trim();
  if (raw) {
    const [path, query] = raw.split('?');
    // `/tasks?frequency=…&category=…` is a real destination (a section of this
    // screen); a bare `/tasks` is the screen itself and says nothing.
    const pointsAtItself = path.replace(/\/$/, '') === routes.tasks && !query;
    if (!pointsAtItself && isKnownRoute(path)) return raw as Route;
  }
  // The guess never outranks a link the task actually carries: a partner task
  // ships only an `externalLink` (its bot), and answering `/partners` here would
  // keep the player inside the app instead of opening what they came for.
  if (task.externalLink) return null;
  return CATEGORY_DESTINATION[task.category] ?? null;
}

/**
 * Does this card lead anywhere at all? The chevron / «Open» affordance hangs on
 * this — a control that goes nowhere reads as a broken screen.
 */
export const taskHasDestination = (task: Pick<Task, 'category' | 'deeplink' | 'externalLink'>) =>
  !!task.externalLink || !!resolveTaskDestination(task);
