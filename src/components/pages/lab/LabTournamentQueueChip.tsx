'use client';

import { twMerge } from 'tailwind-merge';
import { Medal } from '@/components/shared/icons/Medal';
import { formatCompact } from '@/utils/global/number.utils';
import { LAB_TIER_RGB } from './labTournamentTier.utils';
import type { Tournament } from '@/types/interfaces/tournaments.interfaces';

export interface LabTournamentQueueChipProps {
  tournament: Tournament;
  active: boolean;
  onSelect: () => void;
}

/**
 * One stop on option B's queue: the tier medal and the prize.
 *
 * It carried the start time first, and on real data that read as broken —
 * tournaments are spawned in batches, so the row showed 18:00 three times over.
 * The prize is what actually separates one chip from its neighbour; the clock
 * lives on the hero, which is the one the player is being asked about.
 */
export function LabTournamentQueueChip({
  tournament,
  active,
  onSelect,
}: LabTournamentQueueChipProps) {
  const rgb = LAB_TIER_RGB[tournament.type] ?? LAB_TIER_RGB.bronze;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      style={active ? { borderColor: `rgb(${rgb})`, background: `rgb(${rgb} / 0.14)` } : undefined}
      className={twMerge(
        'flex h-[54px] w-[58px] shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl border transition-colors',
        active ? 'border' : 'border-white/10 bg-white/4'
      )}
    >
      <Medal height={26} type={tournament.type} />
      <span
        className={twMerge(
          'text-[10px] leading-none font-extrabold tabular-nums',
          active ? 'text-gold' : 'text-gold/60'
        )}
      >
        {formatCompact(tournament.prizePool)}
      </span>
    </button>
  );
}
