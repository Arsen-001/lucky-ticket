'use client';

import { useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { TaskFrequency } from '@/types/enums/tasks.enums';
import type { MessageIds } from '@/types/types/i18n.types';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export interface TasksFrequencyTabsProps {
  active: TaskFrequency;
  onChange: (frequency: TaskFrequency) => void;
  counts: Record<TaskFrequency, number>;
  className?: string;
}

const FREQUENCY_ORDER: readonly TaskFrequency[] = [
  TaskFrequency.DAILY,
  TaskFrequency.WEEKLY,
  TaskFrequency.ONCE,
];

const FREQUENCY_LABEL_KEY: Record<TaskFrequency, MessageIds> = {
  [TaskFrequency.DAILY]: 'daily',
  [TaskFrequency.WEEKLY]: 'weekly',
  [TaskFrequency.ONCE]: 'one time',
};

/**
 * How often a task comes back — the coarsest cut of the tasks screen, sitting
 * directly above the category chips.
 *
 * Deliberately NOT chips: two pill rows stacked read as one confusing control,
 * and the filled slab they used to sit in fights the app's backdrop. An
 * underlined rail says "these are sections" while the row below stays "these
 * are filters".
 */
export function TasksFrequencyTabs({
  active,
  onChange,
  counts,
  className,
}: TasksFrequencyTabsProps) {
  const t = useAppTranslations();
  const tabRefs = useRef<Map<TaskFrequency, HTMLButtonElement>>(new Map());
  const [underline, setUnderline] = useState<{ left: number; width: number } | null>(null);

  useEffect(() => {
    const el = tabRefs.current.get(active);
    if (!el) return;
    setUnderline({ left: el.offsetLeft, width: el.offsetWidth });
  }, [active, counts, t]);

  return (
    <div className={twMerge('px-4', className)}>
      <div className="relative flex items-stretch justify-center gap-7 border-b border-white/8">
        {FREQUENCY_ORDER.map(frequency => {
          const isActive = frequency === active;
          const ready = counts[frequency];
          return (
            <button
              key={frequency}
              type="button"
              role="tab"
              aria-selected={isActive}
              ref={el => {
                if (el) tabRefs.current.set(frequency, el);
                else tabRefs.current.delete(frequency);
              }}
              onClick={() => onChange(frequency)}
              className={twMerge(
                'relative flex items-center gap-1.5 pb-2.5 text-[15px] font-bold whitespace-nowrap transition-colors duration-300 active:scale-95',
                isActive ? 'text-white' : 'text-white-secondary/70'
              )}
            >
              <span className="capitalize leading-none">{t(FREQUENCY_LABEL_KEY[frequency])}</span>
              {ready > 0 && (
                <span
                  className={twMerge(
                    'flex-center h-5 min-w-5 rounded-full px-[5px] text-[11px] font-bold tabular-nums transition-colors duration-300',
                    isActive ? 'bg-electric-pink text-white' : 'bg-white/10 text-white-secondary'
                  )}
                >
                  {ready}
                </span>
              )}
            </button>
          );
        })}

        {/* Rides the rail rather than filling the tab: the count badge already
            carries the colour, so a second saturated block would shout. */}
        {underline && (
          <span
            aria-hidden
            // `left-0` is load-bearing: without an explicit inset an absolutely
            // positioned child falls back to its static position, which inside
            // a `justify-center` flex row is the centre — so the measured
            // offsets would be applied on top of that and the bar would sit
            // off past the last tab.
            className="bg-pink-gradient shadow-electric-pink/40 pointer-events-none absolute -bottom-px left-0 h-[3px] rounded-full shadow-[0_0_10px] transition-[transform,width] duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ width: underline.width, transform: `translateX(${underline.left}px)` }}
          />
        )}
      </div>
    </div>
  );
}
