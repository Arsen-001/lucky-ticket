'use client';

import { useAppTranslations } from '@/hooks/useAppTranslations';
import { twMerge } from 'tailwind-merge';
import type { TournamentPlace } from '@/types/interfaces/tournaments.interfaces';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';

interface TournamentPlacementsTableProps {
  places?: TournamentPlace[];
  isLoading?: boolean;
}

export function TournamentPlacementsTable({ places, isLoading }: TournamentPlacementsTableProps) {
  const t = useAppTranslations();

  const row = ({
    place,
    prize,
    isHeader,
    loading,
  }: {
    place: string;
    prize: string;
    isHeader?: boolean;
    loading?: boolean;
  }) => (
    <div
      key={`place_${place}`}
      className={twMerge(
        'w-full flex items-center text-sm font-semibold gap-1',
        isHeader && 'font-bold text-white-secondary'
      )}
    >
      <div className="w-25 rounded-l-sm overflow-hidden">
        <SkeletonSuspense
          loading={loading}
          skeleton={<Skeleton variant="line" className="w-full rounded-none" />}
        >
          <div className="w-full bg-background-overlay px-2 py-0.5">{place}</div>
        </SkeletonSuspense>
      </div>
      <div className="w-full rounded-r-sm overflow-hidden">
        <SkeletonSuspense
          loading={loading}
          skeleton={<Skeleton variant="line" className="w-full rounded-none" />}
        >
          <div className="w-full bg-background-overlay truncate px-2 py-0.5">{prize}</div>
        </SkeletonSuspense>
      </div>
    </div>
  );

  return (
    <div className="flex-col-stretch gap-0.5 bg-purple-gradient rounded-md p-0.5">
      {row({ place: t('place'), prize: t('prize'), isHeader: true })}
      {isLoading
        ? Array.from({ length: 10 }).map((_, index) => (
            <div
              key={`loading_${index}`}
              className="flex justify-between items-center text-sm font-medium"
            >
              {row({
                place: '',
                prize: '',
                loading: true,
              })}
            </div>
          ))
        : places?.map((item, index) => {
            const displayPlace = item.to ? `${item.from}-${item.to}` : String(item.from);
            const prize = t('{percent} of the total prize pool', { percent: item?.percentage });

            return (
              <div
                key={`place_${index}`}
                className="flex justify-between items-center text-sm font-medium"
              >
                {row({
                  place: displayPlace,
                  prize,
                })}
              </div>
            );
          })}
    </div>
  );
}
