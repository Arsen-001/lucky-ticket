'use client';

import { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import type { TestQuestStep } from '@/constants/testQuest.constants';

export interface TestQuestStepRowProps {
  step: TestQuestStep;
  /** Level already claimed → the step reads as done (ticked, struck through). */
  done?: boolean;
}

/**
 * One checklist row under the Test-Quest slider. A step with `detail`/`subSteps`
 * is an expandable dropdown revealing the how-to; a plain step is a single row.
 * Purely informational — no navigation, so tapping never leaves the quest screen.
 */
export function TestQuestStepRow({ step, done = false }: TestQuestStepRowProps) {
  const expandable = !!(step.detail || step.subSteps?.length);
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl bg-white/[0.03]">
      <div
        role={expandable ? 'button' : undefined}
        tabIndex={expandable ? 0 : undefined}
        onClick={expandable ? () => setOpen(o => !o) : undefined}
        onKeyDown={
          expandable
            ? e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setOpen(o => !o);
                }
              }
            : undefined
        }
        className={twMerge(
          'flex items-center gap-2 px-2.5 py-1.5',
          expandable && 'cursor-pointer select-none'
        )}
      >
        {done ? (
          <span className="flex-center h-4 w-4 shrink-0 rounded-full bg-success/20">
            <Check size={11} className="text-success" />
          </span>
        ) : (
          <span className="h-4 w-4 shrink-0 rounded-md border border-white/25" />
        )}

        <span
          className={twMerge(
            'min-w-0 flex-1 text-[12px] font-medium leading-snug',
            done ? 'text-white/40 line-through' : 'text-white/85'
          )}
        >
          {step.text}
        </span>

        {expandable && (
          <ChevronDown
            size={14}
            className={twMerge(
              'shrink-0 text-white/40 transition-transform duration-200',
              open && 'rotate-180'
            )}
          />
        )}
      </div>

      {expandable && open && (
        <div className="flex flex-col gap-1 pb-2 pl-[34px] pr-3 animate-fade-in">
          {step.detail && (
            <p className="text-[11px] leading-snug text-white-secondary">{step.detail}</p>
          )}
          {step.subSteps?.map((s, i) => (
            <div key={i} className="flex items-start gap-2 text-[11px] text-white/75">
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-electric-pink/70" />
              <span className="leading-snug">{s}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
