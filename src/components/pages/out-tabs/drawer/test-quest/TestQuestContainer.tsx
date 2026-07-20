'use client';

import { TestQuestChain } from './TestQuestChain';

/**
 * Dedicated Test-Quest screen body — the flagship launch quest ("Тестировщик
 * 31 → 1") promoted out of the Tasks one-time tab into its own destination,
 * reached from the Home entry card ({@link routes.testQuest}). Renders the full
 * climb carousel plus the friends leaderboard with room to breathe.
 */
export function TestQuestContainer() {
  return (
    <div className="flex flex-col pb-10">
      <TestQuestChain />
    </div>
  );
}
