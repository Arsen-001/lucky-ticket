import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export interface HeaderStatPillProps {
  icon: ReactNode;
  value: ReactNode;
  accent?: ReactNode;
  onClick?: () => void;
  ariaLabel?: string;
}

export function HeaderStatPill({ icon, value, accent, onClick, ariaLabel }: HeaderStatPillProps) {
  const baseClassName =
    'inline-flex min-h-[24px] items-center gap-1.5 rounded-full border border-white/8 bg-white/5 px-2.5 py-0.5 text-xs font-semibold text-white/85 backdrop-blur-sm';

  const content = (
    <>
      {icon}
      <span className="leading-none tabular-nums">{value}</span>
      {accent && <span className="text-gold font-bold leading-none">{accent}</span>}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={ariaLabel}
        className={twMerge(baseClassName, 'transition-all hover:bg-white/10 active:scale-95')}
      >
        {content}
      </button>
    );
  }

  return <div className={baseClassName}>{content}</div>;
}
