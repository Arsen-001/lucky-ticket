import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import type { CSSProperties } from 'react';

import { UserListItem } from '@/components/shared/user-elements/UserListItem';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';

interface Props {
  rank: number;
  avatar: string;
  username: string;
  points: number;
  rankChange: number;
  className?: string;
  style?: CSSProperties;
  loading?: boolean;
  isVerified?: boolean;
  isPrime?: boolean;
  outline?: boolean;
}

export const LeaderboardListItem = ({ rank, loading, rankChange, ...rest }: Props) => {
  const isPositive = rankChange > 0;
  const isNegative = rankChange < 0;

  const rightContent = (
    <>
      {isPositive ? (
        <div className="flex items-center  text-success">
          <ArrowUp size={14} className="stroke-3 mr-0.5" />
          <span className="h-4.5 font-semibold text-sm">{rankChange}</span>
        </div>
      ) : isNegative ? (
        <div className="flex items-center  text-error">
          <ArrowDown size={14} className="stroke-3 mr-0.5" />
          <span className="h-4.5 font-semibold text-sm"> {Math.abs(rankChange)}</span>
        </div>
      ) : (
        <div className="flex items-center  text-gray-secondary">
          <Minus size={14} className="stroke-3 mr-0.5" />
          <span className="h-4.5 font-semibold text-sm">0</span>
        </div>
      )}
    </>
  );

  return (
    <UserListItem
      {...rest}
      loading={loading}
      leftContent={
        <SkeletonSuspense
          loading={loading}
          skeleton={<Skeleton variant="line" textSize="sm" className="w-4" />}
        >
          {rank}
        </SkeletonSuspense>
      }
      rightContent={
        <SkeletonSuspense
          loading={loading}
          skeleton={<Skeleton variant="line" textSize="sm" className="w-6 h-4.5" />}
        >
          {rightContent}
        </SkeletonSuspense>
      }
    />
  );
};
