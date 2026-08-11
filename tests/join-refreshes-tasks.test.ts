import { describe, expect, it } from 'vitest';
import { makeStore } from '@/lib/rtk/store';
import { tasksApi } from '@/api/tasks.api';
import { testQuestApi } from '@/api/testQuest.api';
import { tournamentsApi } from '@/api/tournaments.api';
import { tournamentsMock } from '@/mock/tournaments.mock';

/**
 * Entering a tournament had to be followed by restarting the app before the
 * Tasks screen admitted it happened.
 *
 * The server does the work on entry — `earn.onTournamentJoin` advances every
 * TOURNAMENTS-category task, and the counter-driven ones (the test-quest card
 * pinned to the same screen counts entered tickets) recompute from live stats.
 * The client just never asked again: `joinTournament` invalidated only `me` and
 * `tickets`, so "Join 4 Bronze tournaments" sat at its pre-join number for the
 * rest of the session.
 *
 * Note it must be a REFETCH and not `invalidatesTags: [rtkTags.tasks]`. RTKQ
 * removes an invalidated entry that has no subscriber, and the tournament
 * detail page lives in `(out-tabs)` — outside the tab bar that holds the only
 * always-mounted `getTasks` subscription — so invalidating there would evict
 * the cache and make the next visit to /tasks replay the full skeleton.
 */

/** Wait for a cache entry to settle on a fresh response. */
const settled = async (read: () => { status: string; fulfilledTimeStamp?: number }, after = 0) => {
  for (let i = 0; i < 100; i++) {
    const entry = read();
    if (entry.status === 'fulfilled' && (entry.fulfilledTimeStamp ?? 0) > after) return entry;
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  throw new Error(`cache entry never refetched (status: ${read().status})`);
};

describe('entering a tournament refreshes the screens that count entries', () => {
  it('refetches getTasks and getTestQuest after the join lands', async () => {
    const store = makeStore();

    const tasks = () => tasksApi.endpoints.getTasks.select()(store.getState());
    const quest = () => testQuestApi.endpoints.getTestQuest.select()(store.getState());

    // Warm both caches the way the app does — the tab bar subscribes to
    // getTasks on every screen, the home card to getTestQuest.
    store.dispatch(tasksApi.endpoints.getTasks.initiate());
    store.dispatch(testQuestApi.endpoints.getTestQuest.initiate());
    const tasksBefore = (await settled(tasks)).fulfilledTimeStamp!;
    const questBefore = (await settled(quest)).fulfilledTimeStamp!;

    const target = (tournamentsMock['GET tournaments']() as { id: string; status: string }[]).find(
      tournament => tournament.status === 'upcoming'
    );
    expect(target, 'fixture must hold a joinable tournament').toBeTruthy();

    await store
      .dispatch(
        tournamentsApi.endpoints.joinTournament.initiate({
          tournamentId: target!.id,
          ticketsCount: 1,
        })
      )
      .unwrap();

    // The whole point: no remount, no reload, no manual refetch in between.
    await settled(tasks, tasksBefore);
    await settled(quest, questBefore);
  }, 30_000);
});
