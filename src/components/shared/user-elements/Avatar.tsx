'use client';
import Image, { type ImageProps } from 'next/image';
import { twMerge } from 'tailwind-merge';
import { useGetMeQuery } from '@/api/me.api';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import '@/styles/components/avatar.css';

export interface AvatarProps extends Omit<ImageProps, 'src' | 'alt'> {
  shadow?: boolean;
  size?: number;
}

export function Avatar({ className, size = 54, shadow = false, ...rest }: AvatarProps) {
  const { data: me, isLoading } = useGetMeQuery();

  const containerClassNames = twMerge(
    'flex-center rounded-full aspect-square object-cover object-center p-0.5',
    shadow ? 'avatar-shadow' : 'shadow-none',
    className
  );
  const src = me?.avatar;
  if (isLoading) {
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

  return (
    <Image
      className={containerClassNames}
      //TODO: Add fallback image path (from local assets)
      src={src}
      alt="avatar"
      priority
      {...rest}
      height={size}
      width={size}
    />
  );
}
