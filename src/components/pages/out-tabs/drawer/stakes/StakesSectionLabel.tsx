import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export interface StakesSectionLabelProps {
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function StakesSectionLabel({ children, action, className }: StakesSectionLabelProps) {
  return (
    <div className={twMerge('flex items-center justify-between pb-2 pt-5', className)}>
      <div className="text-pink-secondary text-[11px] font-bold uppercase tracking-wider">
        {children}
      </div>
      {action}
    </div>
  );
}
