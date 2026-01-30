'use client';

import { useGetLeaderboardQuery } from '@/api/leaderboard.api';
import { LeaderboardListItem } from './LeaderboardListItem';
import { twMerge } from 'tailwind-merge';

interface Props {
  className?: string;
}

export const LeaderboardMyPlace = ({ className }: Props) => {
  const { data, isLoading } = useGetLeaderboardQuery();

  if (isLoading || !data?.myPlace) return null;

  return (
    <div
      className={twMerge(
        'sticky bottom-0 p-4 bg-background/80 backdrop-blur-md border-t border-white/10 mt-auto',
        className
      )}
    >
      <LeaderboardListItem
        rank={data.myPlace.place}
        avatar={data.myPlace.avatar}
        username={data.myPlace.username}
        points={data.myPlace.points}
        rankChange={data.myPlace.rankChange}
        isVerified={data.myPlace.isVerified}
        isPrime={data.myPlace.isPrime}
        className="bg-primary/20 border-primary/30"
      />
    </div>
  );
};
