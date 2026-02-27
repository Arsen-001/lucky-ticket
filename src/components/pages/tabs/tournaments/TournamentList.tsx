'use client';

import type { TournamentCardProps } from './TournamentCard';
import { TournamentCard } from './TournamentCard';
import { EmptyDataInfo } from '@/components/shared/EmptyDataInfo';
import { useAppTranslations } from '@/hooks/useAppTranslations';

interface TournamentListProps {
  tournaments: TournamentCardProps[];
  isLoading: boolean;
  filter: string;
  searchValue: string;
}

export function TournamentList({
  tournaments,
  isLoading,
  filter,
  searchValue,
}: TournamentListProps) {
  const t = useAppTranslations();

  return (
    <div
      key={`${filter}-${searchValue}`}
      className="py-5 grid grid-cols-2 gap-x-3 gap-y-4 content-start"
    >
      {tournaments.map((tournament, index) => (
        <TournamentCard
          key={index}
          loading={isLoading}
          {...tournament}
          className="animate-slide-in-bottom"
          style={{ animationDelay: `${index * 50}ms` }}
        />
      ))}
      {!isLoading && tournaments.length === 0 && (
        <div className="col-span-2">
          <EmptyDataInfo
            className="py-10"
            title={t('tournaments not found')}
            description={t('no results description')}
          />
        </div>
      )}
    </div>
  );
}
