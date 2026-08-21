'use client';

import { useState } from 'react';
import {
  useClaimTestQuestLevelMutation,
  useGetTestQuestQuery,
  useRecheckChannelSubscriptionMutation,
} from '@/api/testQuest.api';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useToast } from '@/hooks/useToast';
import { getTelegramWebApp } from '@/lib/telegram/telegram';
import {
  getTestQuestZone,
  resolveTestQuestSteps,
  TEST_QUEST_CHANNEL_URL,
  TEST_QUEST_START_LEVEL,
  TEST_QUEST_TOTAL_LEVELS,
  testQuestLadder,
  type TestQuestZone,
} from '@/constants/testQuest.constants';
import type {
  ClaimTestQuestResponse,
  TestQuestAction,
  TestQuestStepDto,
} from '@/types/interfaces/testQuest.interfaces';
import { triggerHaptic } from '@/utils/global/haptic.utils';

/** A claim that just landed: what the server paid, and which day it paid for. */
export interface ClaimedLevel {
  result: ClaimTestQuestResponse;
  /** 1 … 31 — the day that was taken, captured before the state advanced. */
  day: number;
}

/** One rung of the 31 → 1 climb, enriched with what a design needs to draw it. */
export interface TestQuestScreenCard {
  level: number;
  /** Reward tokens ("25k LC · 1 TIX · 5 LS"). */
  drop: string;
  crown: boolean;
  wall: boolean;
  zone: TestQuestZone;
  /** 1 … 31 — position counted from the entry level, i.e. "day N of 31". */
  day: number;
  /** Already climbed past ⇒ its reward is banked. */
  taken: boolean;
}

// The ladder is a static constant (31 → 1), so sort once at module load.
const LEVELS = [...testQuestLadder].sort((a, b) => b.level - a.level);

/** Level → "day N of 31": the entry level is day 1, the top crown is day 31. */
export const testQuestDay = (level: number): number => TEST_QUEST_TOTAL_LEVELS + 1 - level;

/**
 * Everything the Test-Quest screen needs, independent of how it is drawn — the
 * live state, the enriched 31-rung ladder, the selected level and the two
 * actions (claim the day, re-check the channel gate).
 *
 * Extracted so the competing design prototypes under `designs/` differ in layout
 * only: none of them re-implements the claim gate, the carry-over baselines or
 * the today/selected split.
 */
export function useTestQuestScreen() {
  const t = useAppTranslations();
  const toast = useToast();
  // Refetch on every mount so the checklist reflects actions taken elsewhere.
  const { data } = useGetTestQuestQuery(undefined, { refetchOnMountOrArgChange: true });
  const [claim, { isLoading: claiming }] = useClaimTestQuestLevelMutation();
  const [recheckChannel, { isLoading: verifyingChannel }] = useRecheckChannelSubscriptionMutation();

  // Bumped when the claim modal is dismissed, to replay the coin burst over the
  // card the player lands back on. Not on the claim itself: the modal covers the
  // card, so the burst played to nobody.
  const [burstId, setBurstId] = useState(0);
  // What the last claim paid, with the day it paid for — drives the reward
  // modal; null = nothing to show.
  const [claimed, setClaimed] = useState<ClaimedLevel | null>(null);
  // Level tapped on the map; null = follow today.
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  const currentLevel = data?.level ?? TEST_QUEST_START_LEVEL;
  const claimableToday = data?.claimableToday ?? true;
  // Missing field (older backend) ⇒ don't gate — default to satisfied.
  const channelSubscribed = data?.channelSubscribed ?? true;
  // Same default, same reason: a server that does not send this does not gate
  // on the checklist either, so locking the button here would only lie.
  const stepsComplete = data?.stepsComplete ?? true;
  const stepsRemaining = data?.stepsRemaining ?? 0;

  // Prefer the live ladder from the server (admin-editable rewards); fall back to
  // the bundled prototype text until the response arrives.
  const source = data?.ladder?.length
    ? data.ladder.map(l => ({ level: l.level, drop: l.rewardLabel }))
    : LEVELS.map(l => ({ level: l.level, drop: l.drop }));

  const cards: TestQuestScreenCard[] = source.map(l => {
    const zone = getTestQuestZone(l.level);
    return {
      level: l.level,
      drop: l.drop,
      // Purely the gold finale treatment now. It used to mean "assigned by the
      // leaderboard, not claimable", which is why it was read off the server's
      // `dailyTopLevel`; with the crown removed no level is assigned, so the
      // design-fixed zone is the only thing left to ask.
      crown: zone === 'crown',
      wall: zone === 'wall',
      zone,
      day: testQuestDay(l.level),
      taken: l.level > currentLevel,
    };
  });

  const activeLevel = selectedLevel ?? currentLevel;
  const activeCard = cards.find(c => c.level === activeLevel);
  const isToday = activeLevel === currentLevel;

  // Checklists as the server sent them, by level. The screen renders these
  // (see `resolveTestQuestSteps`); the bundled ladder is only the fallback.
  const serverSteps: Record<number, TestQuestStepDto[] | undefined> = {};
  for (const entry of data?.ladder ?? []) serverSteps[entry.level] = entry.steps;

  // What the already-claimed levels have banked per action — the highest
  // cumulative target reached. A stand-in for the live counters, drawn only when
  // the backend sends none (@see TestQuestSteps): it assumes a claimed level's
  // tasks were done, and nothing enforces that, so it must never outrank a real
  // counter.
  const baselines: Partial<Record<TestQuestAction, number>> = {};
  for (const card of cards) {
    if (!card.taken) continue;
    for (const step of resolveTestQuestSteps(serverSteps[card.level])) {
      if (step.action && step.target != null) {
        baselines[step.action] = Math.max(baselines[step.action] ?? 0, step.target);
      }
    }
  }

  const handleClaim = async () => {
    if (!claimableToday || claiming || !channelSubscribed || !stepsComplete) return;
    // The level being claimed — read BEFORE the response advances the state, so
    // the modal names the day that was just taken and not the next one.
    const claimedDay = testQuestDay(currentLevel);
    try {
      const result = await claim().unwrap();
      setSelectedLevel(null); // follow the new current level after advancing
      triggerHaptic();
      // No success toast: the modal below IS the confirmation, and it says what
      // landed instead of only that something did.
      setClaimed({ result, day: claimedDay });
    } catch {
      toast.error(t('claim failed'));
    }
  };

  const dismissClaimed = () => {
    setClaimed(null);
    setBurstId(id => id + 1);
  };

  // Open the channel, then re-check membership so the lock lifts without a reload.
  const handleVerifyChannel = () => {
    if (verifyingChannel) return;
    getTelegramWebApp()?.openTelegramLink?.(TEST_QUEST_CHANNEL_URL);
    void recheckChannel();
  };

  return {
    data,
    cards,
    currentLevel,
    currentDay: testQuestDay(currentLevel),
    totalDays: TEST_QUEST_TOTAL_LEVELS,
    climbed: data?.climbed ?? 0,
    activeLevel,
    activeCard,
    isToday,
    selectLevel: setSelectedLevel,
    backToToday: () => setSelectedLevel(null),
    claimableToday,
    stepsComplete,
    stepsRemaining,
    channelSubscribed,
    /** Server-sent checklist for a level; undefined ⇒ the caller falls back. */
    stepsFor: (level: number) => serverSteps[level],
    baselines,
    claiming,
    verifyingChannel,
    handleClaim,
    handleVerifyChannel,
    burstId,
    /** Last claim's payout, for the reward modal; null when there is none. */
    claimed,
    dismissClaimed,
  };
}
