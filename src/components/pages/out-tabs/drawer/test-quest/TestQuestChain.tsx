'use client';

import { useState } from 'react';
import { CornerUpLeft, FlaskConical, Gift } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useToast } from '@/hooks/useToast';
import {
  useClaimTestQuestLevelMutation,
  useGetTestQuestQuery,
  useRecheckChannelSubscriptionMutation,
} from '@/api/testQuest.api';
import { getTelegramWebApp } from '@/lib/telegram/telegram';
import {
  TEST_QUEST_CHANNEL_URL,
  TEST_QUEST_START_LEVEL,
  testQuestLadder,
} from '@/constants/testQuest.constants';
import { TestQuestBadge } from './TestQuestBadge';
import { TestQuestSteps } from './TestQuestSteps';
import { TestQuestRewardChips } from './TestQuestRewardChips';
import { TestQuestClaimBurst } from './TestQuestClaimBurst';
import { TestQuestPyramid } from './TestQuestPyramid';

// The ladder is a static constant (31 → 1), so sort once at module load.
const LEVELS = [...testQuestLadder].sort((a, b) => b.level - a.level);

// Success haptic on claim — a no-op outside Telegram.
const claimHaptic = () => {
  if (typeof window === 'undefined') return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const haptic = (window as any).Telegram?.WebApp?.HapticFeedback;
  try {
    haptic?.notificationOccurred?.('success');
  } catch {
    /* noop */
  }
};

export interface TestQuestChainProps {
  className?: string;
}

/**
 * "Тест-квест" launch quest — the 31 → 1 climb as a **pyramid map** (apex = level
 * 1 = the crown; numbers grow down to 31 at the base) plus a checklist panel
 * below. Tapping a pyramid level drives the reward + "what to do" checklist to
 * that level (a "back to today" chip returns); the claim only shows for today's
 * level and, on success, advances the marker up the pyramid. Levels 31 → 4 are
 * the daily ladder; 3 → 1 are the competitive crown, shown at the apex.
 */
export function TestQuestChain({ className }: TestQuestChainProps) {
  const t = useAppTranslations();
  const toast = useToast();
  const { data } = useGetTestQuestQuery();
  const [claim, { isLoading: claiming }] = useClaimTestQuestLevelMutation();
  const [recheckChannel, { isLoading: verifyingChannel }] = useRecheckChannelSubscriptionMutation();

  // Bumped on each successful claim to replay the coin burst over the today panel.
  const [burstId, setBurstId] = useState(0);
  // Level tapped on the pyramid (drives the checklist below); null = follow today.
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  const currentLevel = data?.level ?? TEST_QUEST_START_LEVEL; // daily current (31 → 4)
  const claimableToday = data?.claimableToday ?? true;
  // Missing field (older backend) ⇒ don't gate — default to satisfied.
  const channelSubscribed = data?.channelSubscribed ?? true;
  const dailyTop = data?.dailyTopLevel ?? 4;

  // Prefer the live ladder from the server (reflects admin-editable rewards);
  // fall back to the bundled prototype text until the response arrives.
  const cards = data?.ladder?.length
    ? data.ladder.map(l => ({
        level: l.level,
        task: l.task,
        drop: l.rewardLabel,
        crown: l.level < dailyTop,
      }))
    : LEVELS.map(l => ({
        level: l.level,
        task: l.task,
        drop: l.drop,
        crown: l.zone === 'crown',
      }));

  // The checklist below shows the tapped pyramid level; defaults to today.
  const activeLevel = selectedLevel ?? currentLevel;
  const activeCard = cards.find(c => c.level === activeLevel);
  const isToday = activeLevel === currentLevel;

  const handleClaim = async () => {
    // The channel-subscription gate blocks advancing until the player subscribes.
    if (!claimableToday || claiming || !channelSubscribed) return;
    try {
      await claim().unwrap();
      setBurstId(id => id + 1);
      setSelectedLevel(null); // follow the new current level after advancing
      claimHaptic();
      toast.success(t('level taken'));
    } catch {
      toast.error(t('claim failed'));
    }
  };

  // Gate action: open the channel, then re-check membership so the lock lifts
  // without a reload (the re-check reads the live subscription server-side).
  const handleVerifyChannel = () => {
    if (verifyingChannel) return;
    getTelegramWebApp()?.openTelegramLink?.(TEST_QUEST_CHANNEL_URL);
    void recheckChannel();
  };

  return (
    <section className={twMerge('flex flex-col gap-2 px-4 pt-4', className)}>
      <div className="flex items-center gap-2">
        <div className="flex-center h-7 w-7 rounded-lg bg-gradient-to-br from-electric-pink to-electric-purple shadow-md shadow-black/30">
          <FlaskConical size={14} className="text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-extrabold leading-tight">{t('test quest chain title')}</h3>
          <p className="line-clamp-1 text-[11px] text-pink-secondary">
            {t('test quest chain blurb')}
          </p>
        </div>
        {data?.frozen && data.badgeLevel != null && (
          <TestQuestBadge level={data.badgeLevel} className="shrink-0" />
        )}
      </div>

      {!data?.frozen && data && (
        <div className="flex items-center justify-between text-[11px] font-semibold">
          <span className="text-white-secondary">
            {t('level')} <span className="tabular-nums text-white">{data.level}</span>
          </span>
          <span className="tabular-nums text-white/80">
            {data.climbed}/{data.totalLevels}
          </span>
        </div>
      )}

      {data?.frozen && (
        <div className="flex items-center gap-1.5 text-[11px] text-white-secondary">
          <Gift size={12} className="text-gold" />
          {t('monthly chest')} ·{' '}
          <span className="font-bold tabular-nums text-white">
            {data.chestsPaid}/{data.chestsTotal}
          </span>
        </div>
      )}

      {!data?.frozen && data && (
        <TestQuestPyramid
          currentLevel={data.level}
          selectedLevel={activeLevel}
          onSelect={setSelectedLevel}
        />
      )}

      {activeCard && !data?.frozen && (
        <div className="relative flex flex-col gap-2">
          {burstId > 0 && <TestQuestClaimBurst key={burstId} />}

          <div className="flex flex-col gap-1.5 rounded-2xl border border-white/10 bg-background-overlay p-2.5">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white/40">
              <Gift size={10} className={activeCard.crown ? 'text-gold' : 'text-electric-pink'} />
              {t('reward')} ·
              <span className="tabular-nums text-white/70">
                {t('level')} {activeCard.level}
              </span>
              {!isToday && (
                <button
                  type="button"
                  onClick={() => setSelectedLevel(null)}
                  className="flex-center ml-auto gap-1 rounded-full bg-electric-pink/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-electric-pink active:scale-95"
                >
                  <CornerUpLeft size={10} />
                  {t('today')}
                </button>
              )}
            </div>
            <TestQuestRewardChips label={activeCard.drop} crown={activeCard.crown} />
          </div>

          <TestQuestSteps
            level={activeCard.level}
            task={activeCard.task}
            claimed={activeLevel > currentLevel}
            ready={isToday && claimableToday}
            claiming={claiming}
            onClaim={handleClaim}
            channelSubscribed={channelSubscribed}
            onVerifyChannel={handleVerifyChannel}
            verifyingChannel={verifyingChannel}
          />
        </div>
      )}
    </section>
  );
}
