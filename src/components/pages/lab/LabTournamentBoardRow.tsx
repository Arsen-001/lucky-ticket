'use client';

import { Users } from 'lucide-react';
import { Medal } from '@/components/shared/icons/Medal';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { GoldenText } from '@/components/shared/typography/GoldenText';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { formatCompact } from '@/utils/global/number.utils';
import { LAB_TIER_RGB } from './labTournamentTier.utils';
import type { Tournament } from '@/types/interfaces/tournaments.interfaces';

export interface LabTournamentBoardRowProps {
  tournament: Tournament;
}

/**
 * One line of option D's board. It carries no clock of its own: the start time
 * and the countdown belong to the group above it, because tournaments are
 * spawned in batches and every row of a batch would otherwise repeat the same
 * two numbers.
 */
export function LabTournamentBoardRow({ tournament }: LabTournamentBoardRowProps) {
  const t = useAppTranslations();
  const { type, name, prizePool, teamSize, participantsCount } = tournament;
  const rgb = LAB_TIER_RGB[type] ?? LAB_TIER_RGB.bronze;

  return (
    <div className="flex h-[44px] items-center gap-2 px-3">
      <span style={{ background: `rgb(${rgb})` }} className="h-5 w-[2px] shrink-0 rounded-full" />

      <Medal className="shrink-0" height={26} type={type} />

      <h5 className="line-clamp-1 flex-1 text-[12px] leading-tight font-bold text-white">{name}</h5>

      <span className="flex items-center gap-0.5 text-[9px] font-bold text-white/35 tabular-nums">
        <Users className="h-2.5 w-2.5" />
        {participantsCount ?? 0}/{teamSize ?? '∞'}
      </span>

      <span className="w-[62px] shrink-0 text-end text-[13px] leading-none font-extrabold tabular-nums">
        <GoldenText>
          <span className="inline-flex items-center gap-1">
            {formatCompact(prizePool)}
            <LcLabel size={11} />
          </span>
        </GoldenText>
      </span>

      <span className="sr-only">{t(type)}</span>
    </div>
  );
}
