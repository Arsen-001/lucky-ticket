import { twMerge } from 'tailwind-merge';
import type { HTMLAttributes } from 'react';

export function GoldenText({ className, children, ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span {...rest} className={twMerge('text-gold', className)}>
      {children}
    </span>
  );
}
