'use client';

import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export interface SegmentToggleOption<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

export interface SegmentToggleProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: SegmentToggleOption<T>[];
  className?: string;
  classNames?: { button?: string; active?: string };
}

/**
 * Compact segmented control — a row of equal-width options where the active one
 * carries the pink gradient (the project's selected-button language). Generic
 * over the value union so it stays type-safe for any small enum choice.
 */
export function SegmentToggle<T extends string>({
  value,
  onChange,
  options,
  className,
  classNames,
}: SegmentToggleProps<T>) {
  return (
    <div className={twMerge('flex gap-1 rounded-xl bg-white/5 p-1', className)} role="tablist">
      {options.map(option => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={twMerge(
              'tap-target relative flex-center flex-1 gap-1.5 rounded-lg px-3 py-2 text-[13px] font-bold transition active:scale-[0.98]',
              active
                ? twMerge('bg-pink-gradient text-white shadow', classNames?.active)
                : twMerge('text-white-secondary hover:text-white', classNames?.button)
            )}
          >
            {option.icon}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
