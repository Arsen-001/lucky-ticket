'use client';

import type { HTMLAttributes } from 'react';
import { ExternalLink } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useGetTournamentByIdQuery } from '@/api/tournaments.api';
import { QueryErrorState } from '@/components/shared/error/QueryErrorState';
import { TournamentCard } from '@/components/pages/tabs/tournaments/TournamentCard';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { PersonalTournament } from '@/types/interfaces/tournaments.interfaces';
import { TournamentJackpotNote } from './TournamentJackpotNote';

interface TournamentDetailsProps extends HTMLAttributes<HTMLDivElement> {
  id: string;
}

/**
 * Header of the tournament detail screen.
 *
 * It renders the very card the catalog list shows — same layout, same prize
 * type, same stat strip, same full-width action. The screen used to carry its
 * own older copy of that card (96px medal plate, prize squeezed into a chip
 * row, join reduced to a pill), so opening a tournament from the list changed
 * how it looked. One component now serves both, in its `detail` variant.
 */
export function TournamentInfo({ id, className, ...rest }: TournamentDetailsProps) {
  const { data, isLoading, isError, refetch } = useGetTournamentByIdQuery(id);
  const t = useAppTranslations();

  const sponsor = data?.sponsor;
  // A sponsored tournament still under review (reachable by direct link) — its
  // sponsor link stays hidden until approved (DOCS §11.8).
  const isModeration = data?.status === 'moderation';

  // A failed detail load must surface an error+retry, not a blank card with an
  // empty name / "soon" countdown (the silent-empty anti-pattern).
  if (isError && !data) {
    return <QueryErrorState className="mt-10" onRetry={() => refetch()} />;
  }

  return (
    <div className={twMerge('max-w-full overflow-hidden', className)} {...rest}>
      <TournamentCard
        variant="detail"
        loading={isLoading}
        // Loading, there is no tournament yet — the card renders skeletons for
        // every field, same as the placeholder rows in the list.
        {...(data ?? ({} as PersonalTournament))}
      />

      {!isLoading && <TournamentJackpotNote className="mt-2.5" />}

      {!isLoading && !isModeration && sponsor?.url && (
        <a
          href={sponsor.url}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-electric-purple/15 text-electric-purple mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition active:scale-[0.99]"
        >
          <ExternalLink className="h-4 w-4" />
          {t('visit sponsor', { name: sponsor.name })}
        </a>
      )}
    </div>
  );
}
