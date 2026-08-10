import { describe, expect, it } from 'vitest';
import { tournamentsMock } from '@/mock/tournaments.mock';

/**
 * Everything the mock layer returns is deep-frozen by Immer the moment it lands
 * in the RTK store, and the fixtures are handed out by reference — so a handler
 * that writes back into what it once served throws, the request 500s, and in
 * dev a Next error overlay parks itself over the screen (it is `role="dialog"`,
 * so it also swallowed clicks meant for the app's own modals and turned four
 * unrelated e2e specs red).
 *
 * That bug has now been fixed twice in the same file — first on the tournament
 * OBJECT (`resultSeen`), then on the array SLOT holding it. This test pins the
 * shape that ends it: session state lives outside the fixture, and every read
 * builds a fresh array.
 */
const deepFreeze = (value: unknown, seen = new Set<unknown>()): void => {
  if (!value || typeof value !== 'object' || seen.has(value)) return;
  seen.add(value);
  Object.freeze(value);
  for (const inner of Object.values(value as Record<string, unknown>)) deepFreeze(inner, seen);
};

type Tournament = { id: string; resultSeen?: boolean };

const list = () => tournamentsMock['GET tournaments']() as Tournament[];

describe('a served mock fixture is never written to again', () => {
  it('hands out a fresh array per request', () => {
    const first = list();
    deepFreeze(first);

    expect(list()).not.toBe(first);
  });

  it('marks a tournament result seen after the catalog has been frozen', () => {
    const served = list();
    deepFreeze(served);
    const finished = served.find(tournament => tournament.resultSeen === false);
    expect(finished, 'fixture must keep a finished tournament with an unseen result').toBeTruthy();

    // The write the popup makes on dismiss. Before the fix this threw
    // "Cannot assign to read only property '<index>' of object '[object Array]'".
    expect(() =>
      tournamentsMock['POST tournaments/result-seen']({ body: { tournamentId: finished!.id } })
    ).not.toThrow();

    expect(list().find(tournament => tournament.id === finished!.id)?.resultSeen).toBe(true);
  });

  it('keeps the by-id traversal collection in sync with the list', () => {
    const seenId = list().find(tournament => tournament.resultSeen === true)?.id;
    expect(seenId, 'previous test marks one as seen').toBeTruthy();

    // `tournaments/{id}` resolves through this thunk in the mock base query.
    const byId = (tournamentsMock.tournaments() as Tournament[]).find(
      tournament => tournament.id === seenId
    );

    expect(byId?.resultSeen).toBe(true);
  });
});
