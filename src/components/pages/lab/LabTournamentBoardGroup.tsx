'use client';

import dayjs from 'dayjs';
import { LabTournamentBoardRow } from './LabTournamentBoardRow';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useCountDown } from '@/hooks/useCountDown';
import { pad } from '@/utils/global/date.utils';
import type { Tournament } from '@/types/interfaces/tournaments.interfaces';

export interface LabTournamentBoardGroupProps {
  /** Every tournament that starts at the same instant, prize-richest first. */
  tournaments: Tournament[];
}

/**
 * One departure of option D's board: a wall-clock time, the countdown to it,
 * and everything that leaves at it.
 *
 * The grouping is not a nicety — the spawner starts a whole batch on the hour
 * (06/12/18/00 UTC on production), so a flat list repeats one time and one
 * countdown down the whole column. Grouped, the repetition becomes the
 * headline: three tournaments at once, pick a tier.
 */
export function LabTournamentBoardGroup({ tournaments }: LabTournamentBoardGroupProps) {
  const t = useAppTranslations();
  const startTime = tournaments[0]?.startTime;
  const { leftTime, days, hours, minutes } = useCountDown(startTime);
  const countdown = days > 0 ? `${days}${t('day short')} ${pad(hours)}:${pad(minutes)}` : leftTime;

  return (
    <div className="flex flex-col border-b border-white/8 py-1.5 last:border-b-0">
      <div className="flex items-center gap-2 px-3 pb-0.5">
        <span className="text-[13px] leading-none font-extrabold text-white tabular-nums">
          {dayjs(startTime).format('HH:mm')}
        </span>
        <span
          className="text-electric-pink text-[12px] leading-none font-black tabular-nums"
          style={{ textShadow: '0 2px 8px rgba(222, 0, 155, 0.45)' }}
        >
          {countdown || t('soon')}
        </span>
        <span className="h-px flex-1 bg-white/10" />
        <span className="text-[10px] font-bold text-white/35 tabular-nums">
          {tournaments.length}
        </span>
      </div>

      {tournaments.map(tournament => (
        <LabTournamentBoardRow key={tournament.id} tournament={tournament} />
      ))}
    </div>
  );
}
