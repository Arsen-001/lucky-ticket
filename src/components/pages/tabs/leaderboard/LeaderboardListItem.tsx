import Image from 'next/image';
import { ArrowDown, ArrowUp, Minus, Trophy } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { VerifiedBadge } from '@/components/shared/badges/VerifiedBadge';
import { PrimeBadge } from '@/components/shared/badges/PrimeBadge';

interface Props {
  rank: number;
  avatar: string;
  username: string;
  points: number;
  rankChange: number;
  className?: string;
  loading?: boolean;
  isVerified?: boolean;
  isPrime?: boolean;
  outline?: boolean;
}

export const LeaderboardListItem = ({
  rank,
  avatar,
  username,
  points,
  rankChange,
  className,
  loading,
  isVerified,
  isPrime,
  outline,
}: Props) => {
  const isPositive = rankChange > 0;
  const isNegative = rankChange < 0;

  return (
    <div
      className={twMerge(
        'flex items-center gap-1 p-3 bg-background-overlay/50 rounded-2xl border-2 border-white/5',
        outline && 'border-gray-400',
        className
      )}
    >
      <div className="w-8 flex-center font-bold text-gray-400">
        <SkeletonSuspense
          loading={loading}
          skeleton={<Skeleton variant="text" textSize="sm" className="w-4" />}
        >
          {rank}
        </SkeletonSuspense>
      </div>
      <div className="flex-available flex-center gap-4 overflow-hidden">
        <div className="relative w-10 h-10">
          <SkeletonSuspense
            loading={loading}
            skeleton={<Skeleton variant="round" className="w-full h-full" />}
          >
            <Image src={avatar} alt={username} fill className="rounded-full object-cover" />
          </SkeletonSuspense>
        </div>
        <div className="flex-1 flex-col-stretch gap-px min-w-0">
          <SkeletonSuspense
            loading={loading}
            skeleton={<Skeleton variant="text" textSize="sm" className="w-20" />}
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
              </div>
            </div>
          </SkeletonSuspense>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <SkeletonSuspense
              loading={loading}
              skeleton={<Skeleton variant="text" textSize="sm" className="w-8" />}
            >
              <>
                {isPositive ? (
                  <div className="flex items-center  text-success">
                    <ArrowUp size={14} className="stroke-3 mr-0.5" />
                    <span className="h-4 font-semibold text-sm">{rankChange}</span>
                  </div>
                ) : isNegative ? (
                  <div className="flex items-center  text-error">
                    <ArrowDown size={14} className="stroke-3 mr-0.5" />
                    <span className="h-4 font-semibold text-sm"> {Math.abs(rankChange)}</span>
                  </div>
                ) : (
                  <div className="flex items-center  text-gray-secondary">
                    <Minus size={14} className="stroke-3 mr-0.5" />
                    <span className="h-4 font-semibold text-sm">0</span>
                  </div>
                )}
              </>
            </SkeletonSuspense>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-gold">
          <SkeletonSuspense
            loading={loading}
            skeleton={<Skeleton variant="text" textSize="sm" className="w-12" />}
          >
            <>
              <Trophy className="stroke-2" size={16} />
              <span className="font-semibold text-lg h-6.25">{points}</span>
            </>
          </SkeletonSuspense>
        </div>
      </div>
    </div>
  );
};
