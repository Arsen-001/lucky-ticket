'use client';

import type { TournamentCardProps } from './TournamentCard';
import { TournamentCard } from './TournamentCard';
import { EmptyDataInfo } from '@/components/shared/EmptyDataInfo';
import { useAppTranslations } from '@/hooks/useAppTranslations';

interface TournamentListProps {
  tournaments: TournamentCardProps[];
  isLoading: boolean;
}

export function TournamentList({ tournaments, isLoading }: TournamentListProps) {
  const t = useAppTranslations();

  return (
    <div className="py-5 flex flex-col gap-3">
      {tournaments.map((tournament, index) => (
        <TournamentCard
          key={index}
          loading={isLoading}
          {...tournament}
          style={{ animationDelay: `${index * 60}ms` }}
        />
      ))}
      {!isLoading && tournaments.length === 0 && (
        <EmptyDataInfo
          className="py-10"
          title={t('tournaments not found')}
          description={t('no results description')}
        />
      )}
    </div>
  );
}
