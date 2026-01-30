'use client';

import { useGetLeaderboardQuery } from '@/api/leaderboard.api';
import { LeaderboardListItem } from './LeaderboardListItem';
import type { HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

export const LeaderboardList = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  const { data, isLoading } = useGetLeaderboardQuery();

  const places = data?.places || [];
  const otherEntries = !isLoading ? [...places].slice(3) : new Array(17).fill(1);

  return (
    <div
      className={twMerge('bg-purple-gradient p-5 rounded-t-4xl flex-col-stretch gap-2', className)}
      {...props}
    >
      {otherEntries.map((entry, index) => (
        <LeaderboardListItem
          loading={isLoading}
          key={entry.username || index}
          rank={entry.place}
          avatar={entry.avatar}
          username={entry.username}
          points={entry.points}
          rankChange={entry.rankChange}
          isVerified={entry.isVerified}
          isPrime={entry.isPrime}
        />
      ))}
    </div>
  );
};
