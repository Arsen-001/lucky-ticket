import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export type HeaderStatPillAccent = 'gold' | 'pink' | 'purple';

export interface HeaderStatPillProps {
  icon: ReactNode;
  value: ReactNode;
  accent?: HeaderStatPillAccent;
  onClick?: () => void;
  ariaLabel?: string;
  flightTarget?: string;
  /** `data-tour` anchor id for the onboarding tour spotlight. */
  dataTour?: string;
}

const ACCENT_ICON_BG: Record<HeaderStatPillAccent, string> = {
  gold: 'bg-background',
  pink: 'bg-electric-pink/25',
  purple: 'bg-electric-purple/30',
};

const ACCENT_BORDER: Record<HeaderStatPillAccent, string> = {
  gold: 'border-gold/20',
  pink: 'border-electric-pink/25',
  purple: 'border-electric-purple/25',
};

const ACCENT_SHADOW: Record<HeaderStatPillAccent, string> = {
  gold: '0 1px 8px -2px color-mix(in srgb, var(--color-gold) 50%, transparent), 0 0 0 1px rgba(255,255,255,0.04) inset',
  pink: '0 1px 8px -2px color-mix(in srgb, var(--color-electric-pink) 50%, transparent), 0 0 0 1px rgba(255,255,255,0.04) inset',
  purple:
    '0 1px 8px -2px color-mix(in srgb, var(--color-electric-purple) 60%, transparent), 0 0 0 1px rgba(255,255,255,0.04) inset',
};

export function HeaderStatPill({
  icon,
  value,
  accent = 'gold',
  onClick,
  ariaLabel,
  flightTarget,
  dataTour,
}: HeaderStatPillProps) {
  const baseClassName = twMerge(
    'inline-flex h-7 shrink-0 items-center gap-1 rounded-full border bg-white/5 pl-0.5 pr-2.5 text-xs font-bold text-white backdrop-blur-sm',
    ACCENT_BORDER[accent]
  );

  const iconSlotClassName = twMerge(
    'flex-center h-6 w-6 shrink-0 rounded-full',
    ACCENT_ICON_BG[accent]
  );

  const content = (
    <>
      <span className={iconSlotClassName} data-flight-target={flightTarget}>
        {icon}
      </span>
      <span className="leading-none tabular-nums tracking-tight">{value}</span>
    </>
  );

  const style = { boxShadow: ACCENT_SHADOW[accent] };

  if (onClick) {
    return (
      <button
        type="button"
        data-tour={dataTour}
        onClick={onClick}
        aria-label={ariaLabel}
        className={twMerge(baseClassName, 'transition-all hover:bg-white/10 active:scale-95')}
        style={style}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={baseClassName} style={style} data-tour={dataTour}>
      {content}
    </div>
  );
}
