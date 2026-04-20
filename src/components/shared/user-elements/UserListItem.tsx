import Image from 'next/image';
import { twMerge } from 'tailwind-merge';
import type { CSSProperties, ReactNode } from 'react';
import { Zap } from 'lucide-react';

import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { VerifiedBadge } from '@/components/shared/badges/VerifiedBadge';
import { PrimeBadge } from '@/components/shared/badges/PrimeBadge';
import { VIPBadge } from '@/components/shared/badges/VIPBadge';

export interface UserListItemProps {
  avatar: string;
  username: string;
  points: number;
  rightContent?: ReactNode;
  leftContent?: ReactNode;
  className?: string;
  style?: CSSProperties;
  loading?: boolean;
  isVerified?: boolean;
  isPrime?: boolean;
  isVIP?: boolean;
  outline?: boolean;
}

export const UserListItem = ({
  avatar,
  username,
  points,
  rightContent,
  leftContent,
  className,
  style,
  loading,
  isVerified,
  isPrime,
  isVIP,
  outline,
}: UserListItemProps) => {
  return (
    <div
      style={style}
      className={twMerge(
        'flex items-center gap-1 p-2 bg-background-overlay/50 rounded-2xl border-2 border-white/5',
        outline && 'border-gray-400',
        className
      )}
    >
      {leftContent !== undefined && (
        <div className="w-8 flex-center font-bold text-gray-400">{leftContent}</div>
      )}
      <div className="flex-available flex-center gap-4 overflow-hidden">
        <div className="relative w-10 h-10">
          <SkeletonSuspense
            loading={loading}
            skeleton={<Skeleton variant="round" className="w-full h-full" />}
          >
            <Image
              src={avatar}
              alt={username}
              fill
              sizes="100%"
              className="rounded-full object-cover"
            />
          </SkeletonSuspense>
        </div>
        <div className="flex-1 flex-col-stretch gap-px min-w-0">
          <SkeletonSuspense
            loading={loading}
            skeleton={<Skeleton variant="line" textSize="sm" className="w-20" />}
          >
            <div className="flex items-start  gap-1 min-w-0">
              <div className="font-semibold truncate ">{username}</div>
              <div className="flex items-center gap-px">
                {isVerified && (
                  <VerifiedBadge
                    className="p-0 h-5.5 aspect-square"
                    hideText
                    classNames={{ icon: 'w-3.5 h-3.5' }}
                  />
                )}
                {isPrime && (
                  <PrimeBadge
                    className="p-0 h-5.5 aspect-square"
                    hideText
                    classNames={{ icon: 'w-3.5 h-3.5' }}
                  />
                )}
                {isVIP && (
                  <VIPBadge
                    className="p-0 h-5.5 aspect-square"
                    hideText
                    classNames={{ icon: 'w-3.5 h-3.5' }}
                  />
                )}
              </div>
            </div>
          </SkeletonSuspense>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <div className="flex items-center gap-1 text-gold">
              <SkeletonSuspense
                loading={loading}
                skeleton={<Skeleton variant="line" textSize="sm" className="w-12" />}
              >
                <Zap className="fill-gold text-gold" size={12} />
                <span className="font-semibold text-xs pt-px">{points}</span>
              </SkeletonSuspense>
            </div>
          </div>
        </div>
        {rightContent !== undefined && rightContent}
      </div>
    </div>
  );
};
