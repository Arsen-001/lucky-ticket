import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export interface ProgressProps {
  children?: ReactNode;
  percentage: number;
  className?: string;
  classNames?: {
    bar?: string;
    children?: string;
  };
}

export function Progress({ className, classNames, percentage, children }: ProgressProps) {
  return (
    <div
      className={twMerge(
        'relative overflow-hidden w-full h-3 rounded-full bg-background-overlay',
        className
      )}
    >
      <div
        style={{ width: `${percentage}%` }}
        className={twMerge(
          'h-full absolute start-0 top-0 bottom-0 bg-pink-gradient transition-all duration-250',
          classNames?.bar
        )}
      ></div>
      {children && (
        <div
          className={twMerge(
            'text-xs text-white leading-none relative z-1 w-fit top-1/2 -translate-y-1/2',
            classNames?.children
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}
