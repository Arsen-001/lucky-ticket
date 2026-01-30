'use client';

import { useGetLeaderboardQuery } from '@/api/leaderboard.api';
import { LeaderboardTopItem } from './LeaderboardTopItem';
import type { HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

export const LeaderboardTop3 = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  const { data, isLoading } = useGetLeaderboardQuery();

  const places = data?.places || [];
  const topThree = !isLoading ? [...places].slice(0, 3) : new Array(3).fill(1);

  const orderedTopThree = [topThree[1], topThree[0], topThree[2]].filter(Boolean);

  return (
    <div className={twMerge('flex justify-center items-end m-auto', className)} {...props}>
      {orderedTopThree.map((entry, index) => (
        <LeaderboardTopItem
          loading={isLoading}
          key={entry.username || index}
          name={entry.username}
          points={entry.points}
          image={entry.avatar}
          place={entry.place || index}
        />
      ))}
    </div>
  );
};
