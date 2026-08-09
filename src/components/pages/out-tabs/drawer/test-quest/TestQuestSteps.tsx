'use client';

import { Gift, ListChecks, Lock, Send } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Button } from '@/components/shared/buttons/Button';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { getTestQuestSteps } from '@/constants/testQuest.constants';
import type { TestQuestAction, TestQuestProgress } from '@/types/interfaces/testQuest.interfaces';
import { TestQuestStepRow } from './TestQuestStepRow';

export interface TestQuestStepsProps {
  /** The level currently centred in the slider. */
  level: number;
  /** Level already claimed → every step reads as done. */
  claimed?: boolean;
  /** Level is the current claimable one → show the claim CTA at the bottom. */
  ready?: boolean;
  claiming?: boolean;
  onClaim?: () => void;
  /** Live channel-subscription status — drives the gate step's done-state and
   *  locks the claim CTA until satisfied. */
  channelSubscribed?: boolean;
  /** Open the channel + re-check membership, unlocking the gate. */
  onVerifyChannel?: () => void;
  verifyingChannel?: boolean;
  /** Live cumulative progress → fills the countable steps' badges (display-only). */
  progress?: TestQuestProgress;
  /** Per-action floor already banked from claimed levels, so a level's badge
   *  carries over the prior levels' cumulative targets (e.g. after level 29's
   *  "spend 11", level 28 starts at 11/16 instead of 0/16). */
  baselines?: Partial<Record<TestQuestAction, number>>;
  /** Lets a host merge the panel into its own card (drop the border/background). */
  className?: string;
  /** Overrides the panel heading — a preview of a future day titles itself by
   *  day, not by level. Defaults to "steps for level {level}". */
  title?: string;
}

/**
 * Checklist panel under the slider — "what to do to complete level N". Tracks
 * whichever card is centred; its steps come from {@link getTestQuestSteps}.
 * The claim action lives here (bottom), so the card above stays a pure selector.
 */
export function TestQuestSteps({
  level,
  claimed,
  ready,
  claiming,
  onClaim,
  channelSubscribed = true,
  onVerifyChannel,
  verifyingChannel,
  progress,
  baselines,
  className,
  title,
}: TestQuestStepsProps) {
  const t = useAppTranslations();
  const steps = getTestQuestSteps(level);
  if (!steps.length) return null;

  // Effective count for a countable step: the live counter, floored by what the
  // claimed levels already banked, so progress continues across levels instead
  // of resetting. `undefined` when the step has no live source at all.
  const countFor = (action?: TestQuestAction): number | undefined => {
    if (!action) return undefined;
    const live = progress?.[action];
    const floor = baselines?.[action];
    return live != null || floor != null ? Math.max(live ?? 0, floor ?? 0) : undefined;
  };

  // The channel gate blocks the claim until the player is subscribed.
  const gateBlocked = steps.some(s => s.gate === 'channel') && !channelSubscribed;

  return (
    <div
      className={twMerge(
        'flex flex-col gap-1.5 rounded-2xl border border-white/10 bg-background-overlay p-2',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <div className="flex-center h-6 w-6 rounded-lg bg-gradient-to-br from-electric-pink to-electric-purple shadow-md shadow-black/30">
          <ListChecks size={13} className="text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-[14px] font-extrabold leading-tight">
            {title ?? t('steps for level {level}', { level })}
          </h3>
          <p className="line-clamp-1 text-[11px] text-pink-secondary">{t('steps blurb')}</p>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        {steps.map((step, i) => (
          <TestQuestStepRow
            key={i}
            step={step}
            done={claimed || (step.gate === 'channel' && channelSubscribed)}
            count={countFor(step.action)}
          />
        ))}
      </div>

      {ready &&
        (gateBlocked ? (
          <div className="mt-0.5 flex flex-col gap-1">
            <Button
              className="flex-center w-full gap-1.5 rounded-xl py-2 text-[13px] font-bold"
              loading={verifyingChannel}
              onClick={onVerifyChannel}
            >
              <Send size={14} />
              {t('subscribe to channel')}
            </Button>
            <p className="flex-center gap-1 px-1 text-center text-[10px] leading-snug text-white/45">
              <Lock size={10} className="shrink-0" />
              {t('subscribe to claim hint')}
            </p>
          </div>
        ) : (
          <Button
            className="flex-center animate-task-pulse mt-0.5 w-full gap-1.5 rounded-xl py-2 text-[13px] font-bold"
            loading={claiming}
            onClick={onClaim}
          >
            <Gift size={14} />
            {t('claim reward')}
          </Button>
        ))}
    </div>
  );
}
