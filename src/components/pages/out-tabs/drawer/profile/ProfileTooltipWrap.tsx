import type { ReactNode } from 'react';
import '@/styles/components/profile.css';

export interface ProfileTooltipWrapProps {
  active: boolean;
  tooltipText?: string;
  children: ReactNode;
}

/** Wraps a status icon button and shows a short-lived tooltip bubble under it. */
export function ProfileTooltipWrap({ active, tooltipText, children }: ProfileTooltipWrapProps) {
  return (
    <span className="relative">
      {children}
      {active && tooltipText && (
        <span
          role="status"
          className="profile-badge-tooltip animate-fade-in pointer-events-none absolute left-1/2 top-full z-20 mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/12 bg-black/85 px-2.5 py-1.5 text-[10px] font-semibold text-white shadow-lg backdrop-blur-md"
        >
          {tooltipText}
        </span>
      )}
    </span>
  );
}
