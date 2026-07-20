'use client';

import { useState } from 'react';
import { ArrowUpRight, Check, ChevronDown } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Link } from '@/components/shared/links/Link';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { TestQuestStep } from '@/constants/testQuest.constants';

export interface TestQuestStepRowProps {
  step: TestQuestStep;
  /** Level already claimed → the step reads as done (ticked, struck through). */
  done?: boolean;
}

/**
 * One checklist row under the Test-Quest slider. A step with `detail`/`subSteps`
 * is an expandable dropdown (how-to + deep-link inside); a plain step is a
 * single row with an optional inline "go there" link.
 */
export function TestQuestStepRow({ step, done = false }: TestQuestStepRowProps) {
  const t = useAppTranslations();
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
          'flex items-start gap-2.5 px-3 py-2.5',
          expandable && 'cursor-pointer select-none'
        )}
      >
        {done ? (
          <span className="flex-center mt-[1px] h-[18px] w-[18px] shrink-0 rounded-full bg-success/20">
            <Check size={11} className="text-success" />
          </span>
        ) : (
          <span className="mt-[2px] h-[18px] w-[18px] shrink-0 rounded-md border border-white/25" />
        )}

        <span
          className={twMerge(
            'min-w-0 flex-1 text-[13px] font-medium leading-snug',
            done ? 'text-white/40 line-through' : 'text-white/85'
          )}
        >
          {step.text}
        </span>

        {expandable ? (
          <ChevronDown
            size={16}
            className={twMerge(
              'mt-[1px] shrink-0 text-white/40 transition-transform duration-200',
              open && 'rotate-180'
            )}
          />
        ) : (
          !done &&
          step.href && (
            <Link
              href={step.href}
              onClick={e => e.stopPropagation()}
              className="flex-center -my-1 shrink-0 gap-0.5 rounded-lg px-1.5 py-1 text-[11px] font-bold text-electric-pink active:scale-95"
            >
              {t('go')}
              <ArrowUpRight size={13} />
            </Link>
          )
        )}
      </div>

      {expandable && open && (
        <div className="flex flex-col gap-1.5 pb-3 pl-[38px] pr-3 animate-fade-in">
          {step.detail && (
            <p className="text-[12px] leading-snug text-white-secondary">{step.detail}</p>
          )}
          {step.subSteps?.map((s, i) => (
            <div key={i} className="flex items-start gap-2 text-[12px] text-white/75">
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-electric-pink/70" />
              <span className="leading-snug">{s}</span>
            </div>
          ))}
          {step.href && (
            <Link
              href={step.href}
              className="mt-1 inline-flex w-fit items-center gap-1 rounded-lg bg-white/5 px-3 py-1.5 text-[12px] font-bold text-electric-pink active:scale-95"
            >
              {t('go')}
              <ArrowUpRight size={14} />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
