'use client';

import { useGetTopTournamentsQuery } from '@/api/tournaments.api';
import { LabTournamentBoard } from './LabTournamentBoard';
import { LabTournamentHeroBlock } from './LabTournamentHeroBlock';
import { LabTournamentPosterStrip } from './LabTournamentPosterStrip';
import { LabTournamentTicketStrip } from './LabTournamentTicketStrip';

export type LabHomeVariant = 'a' | 'b' | 'c' | 'd';

export interface LabHomeVariantPreviewProps {
  variant: LabHomeVariant;
}

/**
 * Stands in for `HomeUpcomingTournaments` while an option is being judged in
 * place — on Home, under the jackpot row, above the engine. A strip only ever
 * has to be right there; in the lab it is being read one option at a time,
 * which flatters every one of them.
 */
export function LabHomeVariantPreview({ variant }: LabHomeVariantPreviewProps) {
  const { data: tournaments } = useGetTopTournamentsQuery();
  const items = tournaments ?? [];

  if (!items.length) return null;

  if (variant === 'a') return <LabTournamentPosterStrip tournaments={items} />;
  if (variant === 'b') return <LabTournamentHeroBlock tournaments={items} />;
  if (variant === 'c') return <LabTournamentTicketStrip tournaments={items} />;
  return <LabTournamentBoard tournaments={items} />;
}
