import type { HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';
import { pad } from '@/utils/global/date.utils';
import '@/styles/components/coming-soon.css';

export interface CountdownUnitProps extends HTMLAttributes<HTMLDivElement> {
  /** Remaining amount of this unit — always rendered zero-padded to two digits. */
  value: number;
  /** Localized unit name ("Days", "Часов", "Minuten"). */
  label: string;
  classNames?: {
    value?: string;
    label?: string;
  };
}

/**
 * One tile of the launch countdown (days / hours / minutes / seconds).
 * Presentational only — the ticking lives in `LaunchCountdown`.
 */
export function CountdownUnit({
  value,
  label,
  className,
  classNames,
  style,
  ...rest
}: CountdownUnitProps) {
  return (
    <div
      className={twMerge(
        'shine-card flex flex-1 flex-col items-center gap-1 rounded-2xl px-1 py-3',
        className
      )}
      style={{ ['--shine-card-accent' as string]: 'var(--color-electric-pink)', ...style }}
      {...rest}
    >
      <span
        className={twMerge(
          'countdown-digit text-2xl font-bold leading-none tabular-nums text-white',
          classNames?.value
        )}
      >
        {pad(value)}
      </span>
      <span
        className={twMerge(
          'text-pink-secondary text-[10px] font-bold uppercase tracking-wider',
          classNames?.label
        )}
      >
        {label}
      </span>
    </div>
  );
}
