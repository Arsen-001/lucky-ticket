'use client';
import { PlayerPhoto } from '@/components/shared/user-elements/PlayerPhoto';
import { twMerge } from 'tailwind-merge';
import { useGetMeQuery } from '@/api/me.api';
import { useMounted } from '@/hooks/useMounted';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import '@/styles/components/avatar.css';

export interface AvatarProps {
  className?: string;
  shadow?: boolean;
  size?: number;
}

export function Avatar({ className, size = 54, shadow = false }: AvatarProps) {
  const { data: me, isLoading } = useGetMeQuery();
  // `me` resolves only on the client, so its avatar differs between the server
  // render (no data → skeleton) and the first client render — a hydration
  // mismatch. Gate on mount so both render the skeleton first, then swap in the
  // real avatar after hydration.
  const mounted = useMounted();

  const containerClassNames = twMerge(
    'flex-center rounded-full aspect-square object-cover object-center p-0.5',
    shadow ? 'avatar-shadow' : 'shadow-none',
    className
  );
  const src = me?.avatar;
  if (!mounted || isLoading) {
    return (
      <div
        style={{
          width: size,
          height: size,
        }}
        className={containerClassNames}
      >
        <Skeleton role="img" variant="round" className="w-full h-full" />
      </div>
    );
  }

  if (!src) return null;

  return <PlayerPhoto className={containerClassNames} src={src} alt="avatar" size={size} eager />;
}
