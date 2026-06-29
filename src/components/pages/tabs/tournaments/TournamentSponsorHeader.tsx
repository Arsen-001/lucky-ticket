'use client';

import { twMerge } from 'tailwind-merge';
import { TournamentSponsorBadge } from './TournamentSponsorBadge';
import type { TournamentSponsor } from '@/types/interfaces/tournaments.interfaces';

export interface TournamentSponsorHeaderProps {
  sponsor: TournamentSponsor;
  className?: string;
}

/**
 * Full-bleed header strip atop a sponsored tournament card — the single biggest
 * cue that sets it apart from the platform's own tournaments. Carries the
 * sponsor pill ("Created by you" / "Sponsored") plus the advertiser brand on an
 * electric-purple band. The negative margins bleed it to the card's padded edge.
 */
export function TournamentSponsorHeader({ sponsor, className }: TournamentSponsorHeaderProps) {
  return (
    <div
      className={twMerge(
        'border-electric-purple/30 bg-electric-purple/15 relative z-10 -mx-3 -mt-3 mb-3 flex items-center gap-2 rounded-t-2xl border-b px-3 py-2',
        className
      )}
    >
      <TournamentSponsorBadge sponsor={sponsor} />
      <span className="min-w-0 flex-1 truncate text-[11px] font-semibold text-white/75">
        {sponsor.name}
      </span>
    </div>
  );
}
