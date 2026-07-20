'use client';

import { Gift, ListChecks } from 'lucide-react';
import { Button } from '@/components/shared/buttons/Button';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { resolveTestQuestSteps } from '@/constants/testQuest.constants';
import { TestQuestStepRow } from './TestQuestStepRow';

export interface TestQuestStepsProps {
  /** The level currently centred in the slider. */
  level: number;
  /** Its one-line task, split into the checklist below. */
  task: string;
  /** Level already claimed → every step reads as done. */
  claimed?: boolean;
  /** Level is the current claimable one → show the claim CTA at the bottom. */
  ready?: boolean;
  claiming?: boolean;
  onClaim?: () => void;
}

/**
 * Checklist panel under the slider — "what to do to complete level N". Tracks
 * whichever card is centred; its steps come from {@link resolveTestQuestSteps}.
 * The claim action lives here (bottom), so the card above stays a pure selector.
 */
export function TestQuestSteps({
  level,
  task,
  claimed,
  ready,
  claiming,
  onClaim,
}: TestQuestStepsProps) {
  const t = useAppTranslations();
  const steps = resolveTestQuestSteps(level, task);
  if (!steps.length) return null;

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-background-overlay p-3">
      <div className="flex items-center gap-2">
        <div className="flex-center h-7 w-7 rounded-lg bg-gradient-to-br from-electric-pink to-electric-purple shadow-md shadow-black/30">
          <ListChecks size={14} className="text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-extrabold leading-tight">
            {t('steps for level {level}', { level })}
          </h3>
          <p className="line-clamp-1 text-[11px] text-pink-secondary">{t('steps blurb')}</p>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        {steps.map((step, i) => (
          <TestQuestStepRow key={i} step={step} done={claimed} />
        ))}
      </div>

      {ready && (
        <Button
          className="flex-center animate-task-pulse mt-1 w-full gap-1.5 rounded-xl py-2.5 text-sm font-bold"
          loading={claiming}
          onClick={onClaim}
        >
          <Gift size={14} />
          {t('claim reward')}
        </Button>
      )}
    </div>
  );
}
