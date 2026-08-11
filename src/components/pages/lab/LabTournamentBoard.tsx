'use client';

import { LabTournamentBoardGroup } from './LabTournamentBoardGroup';
import { LabTournamentsHeading } from './LabTournamentsHeading';
import { byStartTime } from './labTournamentTier.utils';
import type { Tournament } from '@/types/interfaces/tournaments.interfaces';

export interface LabTournamentBoardProps {
  tournaments: Tournament[];
  /** How many tournament lines Home is willing to spend on this. */
  maxRows?: number;
}

/**
 * Option D — no carousel at all: the next departures, grouped by the minute
 * they leave, richest prize first inside a group.
 *
 * Nothing moves except one countdown per group, all the lines are readable at
 * once, and the rest of the field is one tap away in the heading. The trade is
 * deliberate: it gives up the medals' shelf appeal for a schedule the player
 * can plan around.
 */
export function LabTournamentBoard({ tournaments, maxRows = 3 }: LabTournamentBoardProps) {
  const sorted = byStartTime(tournaments);

  const groups: Tournament[][] = [];
  let used = 0;
  for (const tournament of sorted) {
    if (used >= maxRows) break;
    const last = groups[groups.length - 1];
    if (last && last[0].startTime === tournament.startTime) last.push(tournament);
    else groups.push([tournament]);
    used += 1;
  }
  groups.forEach(group => group.sort((a, b) => (b.prizePool ?? 0) - (a.prizePool ?? 0)));

  return (
    <div className="flex flex-col gap-2">
      <LabTournamentsHeading count={sorted.length} />

      <div className="px-4">
        <div className="bg-background-overlay overflow-hidden rounded-2xl border border-white/8">
          {groups.map(group => (
            <LabTournamentBoardGroup key={group[0].id} tournaments={group} />
          ))}
        </div>
      </div>
    </div>
  );
}
