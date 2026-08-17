import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { getTestQuestSteps, testQuestLadder } from '@/constants/testQuest.constants';
import type { TestQuestAction } from '@/types/interfaces/testQuest.interfaces';

/**
 * «Точно все шаги обновляются после того, как их делают?»
 *
 * A step needs TWO things to be honest, and they fail independently:
 *   1. a live counter behind it — guarded in `test-quest-checklist.test.ts`;
 *   2. a refetch at the moment of the act — guarded here.
 *
 * (2) was the invisible half. Every counter below was already correct
 * server-side, yet the screen kept showing the old number because the mutation
 * that moved it never told the quest cache: connecting a wallet refreshed only
 * the wallet, and collecting tickets off an engine — the FIRST step of day 1 —
 * refreshed nothing at all. Both looked exactly like a broken counter to the
 * player.
 *
 * This test reads the source: for each countable action it names the mutation
 * that moves it, and asserts that mutation's file calls
 * `refetchTestQuestProgress`. It is deliberately file-level rather than
 * block-level — the tournament path calls it through a shared helper
 * (`refetchTournamentProgress`), and a block-scoped scan reported that as a
 * false gap.
 */

const API = resolve(process.cwd(), 'src/api');

/**
 * Which api file owns the mutation(s) that move each counter. Anything the
 * PLAYER can do inside the app must appear here.
 */
const MOVED_BY: Partial<Record<TestQuestAction, string>> = {
  ticketsSpent: 'tournaments.api.ts', // entering a tournament spends tickets
  ticketsCollected: 'engines.api.ts', // claim / claim-all / instant claim
  engineUpgrades: 'engines.api.ts',
  adsWatched: 'tasks.api.ts',
  shares: 'referral.api.ts',
  shardsBought: 'market.api.ts',
  ticketsBought: 'market.api.ts',
  enginesBought: 'market.api.ts',
  enginesOwned: 'market.api.ts',
  stakesMade: 'stakes.api.ts',
  activeStakes: 'stakes.api.ts',
  chipsOwned: 'inventory.api.ts',
  chipsEquipped: 'inventory.api.ts',
  nicknameSet: 'me.api.ts',
  walletConnected: 'wallet.api.ts',
};

/**
 * The two counters no mutation on THIS device can move, so no refetch can
 * cover them:
 *   • `referrals` — a friend joins on their own phone;
 *   • `channelBoosted` — the boost happens inside Telegram, outside the app.
 * Both are caught by the screen's `refetchOnMountOrArgChange`, i.e. they are
 * correct the moment the quest is opened. Listed explicitly so the gap is a
 * documented decision rather than an oversight.
 */
const OFF_DEVICE: TestQuestAction[] = ['referrals', 'channelBoosted'];

const usedActions = (): TestQuestAction[] => {
  const seen = new Set<TestQuestAction>();
  for (const level of testQuestLadder) {
    for (const step of getTestQuestSteps(level.level)) {
      if (step.action) seen.add(step.action);
    }
  }
  return [...seen];
};

describe('quest step freshness — every step refetches when it is done', () => {
  const actions = usedActions();

  it('the checklist actually uses counters (the guard is not scanning an empty set)', () => {
    expect(actions.length).toBeGreaterThanOrEqual(10);
  });

  it.each(actions)('%s is either owned by a mutation file or off-device', action => {
    if (OFF_DEVICE.includes(action)) return;
    expect(
      MOVED_BY[action],
      `${action} moves on some player action — name the api file that owns it`
    ).toBeDefined();
  });

  it.each([...new Set(Object.values(MOVED_BY))])('%s refetches the quest', file => {
    const source = readFileSync(join(API, file), 'utf8');
    // The CALL, not the import: a first cut asserted the bare name and passed
    // happily with every call deleted, because `import { refetchTestQuestProgress }`
    // still matched. The negative control is what caught that.
    expect(source, `${file} moves a checklist counter and must refresh it`).toContain(
      'refetchTestQuestProgress(dispatch)'
    );
  });

  /**
   * The reverse direction: a file that refreshes the quest but is not in the
   * map above is fine (harmless extra refresh) — but a file that moves tickets,
   * engines, chips or stakes and does NOT refresh is the bug this suite exists
   * for. Catches a NEW api file added later for one of those nouns.
   */
  it('no api file mutates a counted noun without refreshing the quest', () => {
    // The exact endpoints a checklist step counts — not `market/` wholesale.
    // Gifts and cosmetics are also bought in the market and move nothing here,
    // so a broad match would report `gifts.api.ts` as a gap it is not.
    const NOUNS =
      /engines\/claim|market\/(tickets|engines|shards)|stake|inventory\/chip|wallet\/connect/;
    const offenders = readdirSync(API)
      .filter(f => f.endsWith('.api.ts'))
      .filter(f => {
        const source = readFileSync(join(API, f), 'utf8');
        return NOUNS.test(source) && !source.includes('refetchTestQuestProgress(dispatch)');
      });
    expect(offenders).toEqual([]);
  });
});
