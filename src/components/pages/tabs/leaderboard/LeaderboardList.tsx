'use client';

import { useGetLeaderboardQuery } from '@/api/leaderboard.api';
import { LeaderboardListItem } from './LeaderboardListItem';
import type { HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';
import { Divider } from '@/components/shared/Divider';
import type { LeaderboardEntry } from '@/types/interfaces/leaderboard.interfaces';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export const LeaderboardList = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  const t = useAppTranslations();
  const { data, isLoading } = useGetLeaderboardQuery();

  const places = data?.places || [];
  const myPlace = data?.myPlace;
  const otherEntries = !isLoading ? [...places].slice(3) : new Array(17).fill(1);

  const isMyPlace = (place: LeaderboardEntry['place']) => myPlace && place === myPlace?.place;

  return (
    <div className={twMerge('flex-col-stretch flex-1', className)} {...props}>
      <div className="bg-purple-gradient p-5 rounded-t-4xl flex-col-stretch gap-2 flex-1 border-b border-white/10">
        {otherEntries.map((entry, index) => (
          <div
            className={
              isMyPlace(entry.place) ? 'sticky w-full bottom-3 mt-auto backdrop-blur-lg' : undefined
            }
            key={index}
          >
            <LeaderboardListItem
              loading={isLoading}
              rank={entry.place}
              avatar={entry.avatar}
              username={entry.username}
              points={entry.points}
              rankChange={entry.rankChange}
              isVerified={entry.isVerified}
              isPrime={entry.isPrime}
              outline={isMyPlace(entry.place)}
              className="animate-slide-in-bottom"
              style={{ animationDelay: `${index * 50}ms` }}
            />
          </div>
        ))}
        {myPlace && myPlace?.place > 20 && (
          <>
            <Divider classNames={{ title: 'font-semibold' }} className="border-white/10">
              {t('your place')}
            </Divider>
            <div className={'sticky w-full bottom-3 mt-auto backdrop-blur-lg'}>
              <LeaderboardListItem
                loading={isLoading}
                rank={myPlace.place}
                avatar={myPlace.avatar}
                username={myPlace.username}
                points={myPlace.points}
                rankChange={myPlace.rankChange}
                isVerified={myPlace.isVerified}
                isPrime={myPlace.isPrime}
                outline
                className="animate-slide-in-bottom"
                style={{ animationDelay: '300ms' }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
