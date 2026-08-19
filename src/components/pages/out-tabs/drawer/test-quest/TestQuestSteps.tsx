'use client';

import { Gift, ListChecks, Lock, Send } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Button } from '@/components/shared/buttons/Button';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { resolveTestQuestSteps } from '@/constants/testQuest.constants';
import type {
  TestQuestAction,
  TestQuestProgress,
  TestQuestStepDto,
} from '@/types/interfaces/testQuest.interfaces';
import { TestQuestStepRow } from './TestQuestStepRow';

export interface TestQuestStepsProps {
  /** The level currently centred in the slider. */
  level: number;
  /** The level's checklist as the server sent it. Omitted (older backend, or
   *  before the response lands) ⇒ the bundled prototype ladder is drawn. */
  steps?: TestQuestStepDto[];
  /** Level already claimed → every step reads as done. */
  claimed?: boolean;
  /** Level is the current claimable one → show the claim CTA at the bottom. */
  ready?: boolean;
  /** Server verdict: every blocking step is done, so the claim will be accepted.
   *  The CTA is locked until it is — the checklist is a condition, not a hint. */
  stepsComplete?: boolean;
  /** Blocking steps still open — shown on the locked CTA's hint. */
  stepsRemaining?: number;
  claiming?: boolean;
  onClaim?: () => void;
  /** Live channel-subscription status — drives the gate step's done-state and
   *  locks the claim CTA until satisfied. */
  channelSubscribed?: boolean;
  /** Open the channel + re-check membership, unlocking the gate. */
  onVerifyChannel?: () => void;
  verifyingChannel?: boolean;
  /** Live cumulative progress → fills the countable steps' badges. Since
   *  19.08.2026 the server gates the claim on the same numbers, so a badge short
   *  of its target is also the reason the CTA below is locked. */
  progress?: TestQuestProgress;
  /** Per-action total already banked by the claimed levels — used ONLY when
   *  `progress` carries no live counter for that action (older backend), never
   *  as a floor under one: it would pin the badge above the truth. */
  baselines?: Partial<Record<TestQuestAction, number>>;
  /** Lets a host merge the panel into its own card (drop the border/background). */
  className?: string;
  /** Overrides the panel heading — a preview of a future day titles itself by
   *  day, not by level. Defaults to "steps for level {level}". */
  title?: string;
}

/**
 * Checklist panel under the slider — "what to do to complete level N". Tracks
 * whichever card is centred; its steps come from the server (see
 * {@link resolveTestQuestSteps}), which is why a retune in the admin panel shows
 * up here without a deploy.
 * The claim action lives here (bottom), so the card above stays a pure selector.
 */
export function TestQuestSteps({
  level,
  steps: serverSteps,
  claimed,
  ready,
  stepsComplete = true,
  stepsRemaining = 0,
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
  // The label check lives here, not in `resolveTestQuestSteps`: this is where a
  // dictionary exists. A key this build has no words for is dropped instead of
  // printed raw — @see Dictionary.has
  const steps = resolveTestQuestSteps(serverSteps).filter(s => t.has(s.labelKey));
  if (!steps.length) return null;

  // Effective count for a countable step: the live counter when there is one,
  // and only otherwise the floor banked by the claimed levels.
  //
  // It used to be `Math.max(live, floor)` — and that froze the badge. The ladder
  // targets are cumulative LIFETIME totals, so the live counter already carries
  // over between levels on its own; the floor added nothing but an assumption
  // that claiming a level means having done its tasks. Nothing enforced that
  // back then — the checklist was display-only and the claim was gated on the
  // channel alone (it is a real condition since 19.08.2026), so a player who
  // claimed day 11 (share 15) with 10 real shares saw the badge
  // pinned at 15/17 and unmoved by six more shares. Measured on @garmartikyan:
  // referralSharesCount=10, level 20, badge stuck at 15.
  //
  // The floor stays as the fallback for a backend too old to send
  // `stepProgress` at all, which is what it was introduced for.
  const countFor = (action?: TestQuestAction): number | undefined =>
    action ? (progress?.[action] ?? baselines?.[action]) : undefined;

  // The channel gate blocks the claim until the player is subscribed.
  const gateBlocked = steps.some(s => s.gate === 'channel') && !channelSubscribed;
  // …and so does the rest of the checklist. The server refuses the claim while
  // anything countable is short of its target (@see unmetSteps, backend), so a
  // live CTA here would only earn the player a red toast.
  const tasksBlocked = !gateBlocked && !stepsComplete;

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
        (tasksBlocked ? (
          <div className="mt-0.5 flex flex-col gap-1">
            <Button
              disabled
              className="flex-center w-full gap-1.5 rounded-xl bg-white/[0.06] bg-none py-2 text-[13px] font-bold text-white/45"
            >
              <Lock size={14} />
              {t('finish level tasks')}
            </Button>
            <p className="flex-center gap-1 px-1 text-center text-[10px] leading-snug text-white/45">
              {stepsRemaining > 0
                ? t('{n} tasks left to claim', { n: stepsRemaining })
                : t('finish tasks to claim hint')}
            </p>
          </div>
        ) : gateBlocked ? (
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
