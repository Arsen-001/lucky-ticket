import type { CSSProperties, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export interface SupportSectionLabelProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function SupportSectionLabel({ children, className, style }: SupportSectionLabelProps) {
  return (
    <h4
      style={style}
      className={twMerge(
        'text-pink-secondary ms-1 text-[10px] font-bold uppercase tracking-widest',
        className
      )}
    >
      {children}
    </h4>
  );
}
