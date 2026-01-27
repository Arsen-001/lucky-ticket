'use client';

import { useAppTranslations } from '@/hooks/useAppTranslations';

interface TournamentDetailsProps {
  id: string;
}

export function TournamentDetails({ id }: TournamentDetailsProps) {
  const t = useAppTranslations();

  return (
    <div className="h-full overflow-hidden inset-container-background">
      <div className="h-full overflow-auto p-5 scrollbar-hidden flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold">{t('tournament details')}</h1>
        <p className="text-lg mt-4 text-pink-secondary">ID: {id}</p>
      </div>
    </div>
  );
}
