'use client';

import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { TestQuestClaimBurst } from './TestQuestClaimBurst';
import { TestQuestFrozenSummary } from './TestQuestFrozenSummary';
import { TestQuestSteps } from './TestQuestSteps';
import { TestQuestRewardPanel } from './TestQuestRewardPanel';
import { useTestQuestScreen } from './useTestQuestScreen';
import { TestQuestAheadList } from './TestQuestAheadList';
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
 * and its monthly chests ({@link TestQuestFrozenSummary}).
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
      <div className="flex items-baseline justify-between">
        <h3 className="text-[15px] font-extrabold tabular-nums">
          {t('day {day} of {total}', { day: s.currentDay, total: s.totalDays })}
        </h3>
        <span className="text-[12px] font-semibold tabular-nums text-white/60">
          {t('{n} days left', { n: s.totalDays - s.currentDay })}
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
            // The screen speaks days everywhere else — keep the checklist heading
            // in the same language instead of switching to level numbers.
            title={t('steps for day {day}', { day: s.activeCard.day })}
            claimed={s.activeCard.taken}
            ready={s.isToday && s.claimableToday}
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
    </section>
  );
}
