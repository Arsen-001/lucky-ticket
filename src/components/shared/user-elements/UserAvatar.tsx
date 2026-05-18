'use client';
import Image from 'next/image';
import { twMerge } from 'tailwind-merge';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import '@/styles/components/avatar.css';
import '@/styles/components/achievement.css';

export type AvatarStatusColor = 'verified' | 'lucky-player' | 'vip' | 'plain';

const colorVar: Record<AvatarStatusColor, string> = {
  verified: 'rgba(56, 189, 248, 1)',
  'lucky-player': 'rgba(139, 92, 246, 1)',
  vip: 'rgba(248, 189, 62, 1)',
  plain: 'rgba(60, 34, 76, 1)',
};

const buildShineGradient = (colors: string[]): string => {
  if (colors.length === 0) return '';

  if (colors.length === 1) {
    const c = colors[0];
    return `conic-gradient(from 0deg, ${c} 0deg, ${c} 90deg, transparent 90deg, transparent 360deg)`;
  }

  const step = 360 / colors.length;
  const stops = colors.map((c, i) => `${c} ${(step * i).toFixed(2)}deg`);
  stops.push(`${colors[0]} 360deg`);
  return `conic-gradient(from 0deg, ${stops.join(', ')})`;
};

export interface UserAvatarProps {
  src?: string;
  size?: number;
  shadow?: boolean;
  withRing?: boolean;
  ringColor?: AvatarStatusColor;
  ringProgress?: number;
  shineColors?: string[];
  loading?: boolean;
  className?: string;
  alt?: string;
}

export function UserAvatar({
  src,
  size = 54,
  shadow = false,
  withRing = false,
  ringColor = 'plain',
  ringProgress = 0,
  shineColors,
  loading,
  className,
  alt = 'avatar',
}: UserAvatarProps) {
  const containerClassNames = twMerge(
    'flex-center rounded-full aspect-square object-cover object-center p-0.5 relative',
    shadow ? 'avatar-shadow' : 'shadow-none',
    withRing && 'avatar-ring',
    className
  );

  const shineBg = shineColors && shineColors.length > 0 ? buildShineGradient(shineColors) : '';

  const style = withRing
    ? ({
        ['--ring-color' as string]: colorVar[ringColor],
        ['--ring-progress' as string]: `${Math.min(360, Math.max(0, (ringProgress / 100) * 360))}`,
        ...(shineBg ? { ['--ring-shine-bg' as string]: shineBg } : {}),
        width: size,
        height: size,
      } as React.CSSProperties)
    : { width: size, height: size };

  if (loading) {
    return (
      <div style={style} className={containerClassNames}>
        <Skeleton role="img" variant="round" className="h-full w-full" />
      </div>
    );
  }

  if (!src) {
    return <div style={style} className={twMerge(containerClassNames, 'bg-white/5')} />;
  }

  return (
    <div style={style} className={containerClassNames}>
      <Image
        src={src}
        alt={alt}
        priority
        height={size}
        width={size}
        className="h-full w-full rounded-full object-cover"
      />
    </div>
  );
}
