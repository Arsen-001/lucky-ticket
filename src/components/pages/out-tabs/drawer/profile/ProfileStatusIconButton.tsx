'use client';

import type { ReactNode } from 'react';
import { Lock } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export type ProfileStatusVariant = 'verified' | 'activity' | 'vip' | 'lucky-player' | 'share';

export interface ProfileStatusIconButtonProps {
  variant: ProfileStatusVariant;
  icon: ReactNode;
  level?: number;
  locked?: boolean;
  ariaLabel: string;
  onClick?: () => void;
  className?: string;
}

const VARIANT_GRADIENT: Record<ProfileStatusVariant, string> = {
  verified: 'transparent',
  activity: 'transparent',
  vip: 'transparent',
  'lucky-player': 'transparent',
  share: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)',
};

const VARIANT_BORDER: Record<ProfileStatusVariant, string> = {
  verified: 'transparent',
  activity: 'transparent',
  vip: 'transparent',
  'lucky-player': 'transparent',
  share: 'rgba(255, 255, 255, 0.22)',
};

const VARIANT_SHADOW: Record<ProfileStatusVariant, string> = {
  verified: 'none',
  activity: 'none',
  vip: 'none',
  'lucky-player': 'none',
  share: '0 4px 12px -3px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04) inset',
};

const VARIANT_ICON_COLOR: Record<ProfileStatusVariant, string> = {
  verified: 'text-sky-300',
  activity: 'text-electric-pink',
  vip: 'text-gold',
  'lucky-player': 'text-violet-200',
  share: 'text-white/85',
};

export function ProfileStatusIconButton({
  variant,
  icon,
  level,
  locked = false,
  ariaLabel,
  onClick,
  className,
}: ProfileStatusIconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={twMerge(
        'relative flex-center h-13 w-13 shrink-0 rounded-full transition-transform active:scale-95 cursor-pointer',
        locked && 'opacity-70',
        className
      )}
      style={{
        height: 60,
        width: 60,
        background: locked ? 'rgba(255,255,255,0.04)' : VARIANT_GRADIENT[variant],
        border: locked
          ? '1.5px dashed rgba(255,255,255,0.22)'
          : `1.5px solid ${VARIANT_BORDER[variant]}`,
        boxShadow: locked ? 'none' : VARIANT_SHADOW[variant],
      }}
    >
      <span
        className={twMerge('flex-center', locked ? 'text-white/45' : VARIANT_ICON_COLOR[variant])}
        style={locked ? { filter: 'grayscale(1)' } : undefined}
      >
        {icon}
      </span>

      {variant === 'vip' && level !== undefined && !locked && (
        <span
          className="absolute -bottom-1.5 -right-1.5 flex h-7 min-w-[28px] items-center justify-center rounded-full border-2 border-background px-1.5 text-xs font-black leading-none tabular-nums text-background"
          style={{
            background: 'linear-gradient(135deg, #fff5d9 0%, #f8bd3e 50%, #b8860b 100%)',
            boxShadow: '0 3px 10px rgba(248,189,62,0.65)',
          }}
        >
          {level}
        </span>
      )}

      {locked && (
        <span className="absolute -bottom-1 -right-1 flex-center h-7 w-7 rounded-full border-2 border-background bg-white/12 text-white/70">
          <Lock size={13} strokeWidth={3} />
        </span>
      )}
    </button>
  );
}
