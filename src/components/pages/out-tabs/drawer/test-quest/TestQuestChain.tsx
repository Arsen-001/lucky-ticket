'use client';

import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { TEST_BADGE_CAPACITY_TICKETS } from '@/utils/global/testQuest.utils';
import { TestQuestClaimBurst } from './TestQuestClaimBurst';
import { TestQuestClaimModal } from './TestQuestClaimModal';
import { TestQuestFrozenSummary } from './TestQuestFrozenSummary';
import { TestQuestSteps } from './TestQuestSteps';
import { TestQuestRewardPanel } from './TestQuestRewardPanel';
import { useTestQuestScreen } from './useTestQuestScreen';
import { TestQuestAheadList } from './TestQuestAheadList';
import { TestQuestGrandPrize } from './TestQuestGrandPrize';
import { TestQuestRewardRail } from './TestQuestRewardRail';

export interface TestQuestChainProps {
  className?: string;
}

/**
 * **Шкала + «что дальше»** — the chosen rail layout, built to answer "what is in
 * the other days". Two paths, on purpose:
 *
 * - the rail prints the LC amount of the nearest reward walls, so the size of
 *   what is coming needs no tap at all;
 * - below today's claim button, upcoming days list their full reward and unfold
 *   their checklist in place — measured against the player's live counters, so a
 *   future day reads as "35/93 left", not as an abstract target.
 *
 * Today never leaves the screen: previewing a future day expands a row, it does
 * not replace the day card. Dragging the rail scrubs to any day and drops the
 * card on the one under the finger, for jumping far ahead.
 *
 * Once the test is frozen the climb is over — the screen collapses to the badge
 * alone ({@link TestQuestFrozenSummary}).
 */
export function TestQuestChain({ className }: TestQuestChainProps) {
  const t = useAppTranslations();
  const s = useTestQuestScreen();

  if (!s.data || !s.activeCard) return null;

  if (s.data.frozen) {
    return (
      <TestQuestFrozenSummary
        badgeLevel={s.data.badgeLevel}
        chestsPaid={s.data.chestsPaid}
        chestsTotal={s.data.chestsTotal}
        className={className}
      />
    );
  }

  return (
    <section className={twMerge('flex flex-col gap-2 px-2.5 pt-3', className)}>
      {/* Above the day header on purpose: the summit prize is the reason to keep
          climbing, so it is the first thing on the screen.
          The number is interpolated from the shared constant rather than written
          into the copy, so the 18 dictionaries survive a change to it — and so
          the card can never quote a prize the engine math does not pay. */}
      <TestQuestGrandPrize
        day={s.totalDays}
        title={t('grand prize capacity {n}', { n: TEST_BADGE_CAPACITY_TICKETS })}
        note={t('grand prize every finisher')}
      />

      <div className="flex items-baseline justify-between">
        <h3 className="text-[15px] font-extrabold tabular-nums">
          {t('level {n} of {total}', { n: s.currentDay, total: s.totalDays })}
        </h3>
        <span className="text-[12px] font-semibold tabular-nums text-white/60">
          {t('{n} levels left', { n: s.totalDays - s.currentDay })}
        </span>
      </div>

      <div className="flex items-start gap-2">
        <TestQuestRewardRail
          cards={s.cards}
          currentLevel={s.currentLevel}
          selectedLevel={s.activeLevel}
          onSelect={s.selectLevel}
        />

        <div className="relative flex min-w-0 flex-1 flex-col gap-2">
          {s.burstId > 0 && <TestQuestClaimBurst key={s.burstId} />}

          <TestQuestRewardPanel
            card={s.activeCard}
            isToday={s.isToday}
            onBackToToday={s.backToToday}
          />

          <TestQuestSteps
            level={s.activeCard.level}
            steps={s.stepsFor(s.activeCard.level)}
            // The screen counts LEVELS, not days: a level opens a day at a time,
            // per player, but what the quest is 31 of is levels. The checklist
            // heading uses the same progress number as the header above it.
            title={t('steps for quest level {n}', { n: s.activeCard.day })}
            claimed={s.activeCard.taken}
            ready={s.isToday && s.claimableToday}
            stepsComplete={s.stepsComplete}
            stepsRemaining={s.stepsRemaining}
            claiming={s.claiming}
            onClaim={s.handleClaim}
            channelSubscribed={s.channelSubscribed}
            onVerifyChannel={s.handleVerifyChannel}
            verifyingChannel={s.verifyingChannel}
            progress={s.data.stepProgress}
            baselines={s.baselines}
          />
        </div>
      </div>

      {/* Outside the rail's row on purpose: the gauge only has to stand beside
          today's card, so everything below it gets the full 390px — the upcoming
          days' reward chips fit on one line instead of wrapping in a 282px column. */}
      <TestQuestAheadList
        cards={s.cards}
        currentLevel={s.currentLevel}
        currentDay={s.currentDay}
        progress={s.data.stepProgress}
        baselines={s.baselines}
        stepsFor={s.stepsFor}
      />

      {/* What the claim just paid, named item by item — the burst above only
          celebrates it. */}
      <TestQuestClaimModal
        result={s.claimed?.result ?? null}
        day={s.claimed?.day ?? s.currentDay}
        totalDays={s.totalDays}
        onClose={s.dismissClaimed}
      />
    </section>
  );
}
