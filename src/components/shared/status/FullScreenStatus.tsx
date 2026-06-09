'use client';

import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

interface FullScreenStatusProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  /** Tailwind classes for the icon circle, e.g. 'bg-error/15 text-error'. */
  accentClassName?: string;
}

/**
 * Full-screen, opaque, blocking status screen (no internet / maintenance). The
 * opaque background intentionally hides the app behind it — these are states
 * where the app cannot be used until the condition clears.
 */
export function FullScreenStatus({
  icon,
  title,
  description,
  action,
  accentClassName,
}: FullScreenStatusProps) {
  return (
    <div className="bg-background animate-fade-in fixed inset-0 z-[1100] flex flex-col items-center justify-center gap-5 overflow-hidden px-8 text-center">
      <span
        aria-hidden
        className="bg-electric-pink/15 pointer-events-none absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full blur-3xl"
      />
      <span
        aria-hidden
        className="bg-electric-purple/15 pointer-events-none absolute -bottom-24 -right-16 h-60 w-60 rounded-full blur-3xl"
      />

      <div className={twMerge('flex-center relative h-20 w-20 rounded-full', accentClassName)}>
        {icon}
      </div>

      <div className="relative flex flex-col gap-2">
        <h2 className="text-xl font-extrabold text-white">{title}</h2>
        <p className="text-white-secondary max-w-[20rem] text-sm font-medium leading-relaxed">
          {description}
        </p>
      </div>

      {action && <div className="relative">{action}</div>}
    </div>
  );
}
