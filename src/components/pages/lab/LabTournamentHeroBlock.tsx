'use client';

import { useState } from 'react';
import { Users } from 'lucide-react';
import { Medal } from '@/components/shared/icons/Medal';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { GoldenText } from '@/components/shared/typography/GoldenText';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useCountDown } from '@/hooks/useCountDown';
import { formatCompact } from '@/utils/global/number.utils';
import { pad } from '@/utils/global/date.utils';
import { LabTournamentQueueChip } from './LabTournamentQueueChip';
import { LabTournamentsHeading } from './LabTournamentsHeading';
import { LAB_TIER_RGB, byStartTime } from './labTournamentTier.utils';
import type { Tournament } from '@/types/interfaces/tournaments.interfaces';

export interface LabTournamentHeroBlockProps {
  tournaments: Tournament[];
}

/**
 * Option B — one tournament decided on, the rest as a timetable.
 *
 * The hero is the one that starts next and it is the only place with a Join
 * button, so Home stops being a place you can only *look* at tournaments from.
 * The chips underneath are the schedule: tapping one swaps the hero, so all
 * seven stay reachable without a single card leaving the screen on a timer.
 */
export function LabTournamentHeroBlock({ tournaments }: LabTournamentHeroBlockProps) {
  const t = useAppTranslations();
  const items = byStartTime(tournaments);
  const [activeIndex, setActiveIndex] = useState(0);
  const active = items[activeIndex] ?? items[0];

  const { leftTime, days, hours, minutes } = useCountDown(active?.startTime);
  const countdown = days > 0 ? `${days}${t('day short')} ${pad(hours)}:${pad(minutes)}` : leftTime;
  const rgb = LAB_TIER_RGB[active?.type] ?? LAB_TIER_RGB.bronze;

  if (!active) return null;

  return (
    <div className="flex flex-col gap-2">
      <LabTournamentsHeading count={items.length} />

      <div className="px-4">
        <div
          style={{
            borderColor: `rgb(${rgb} / 0.45)`,
            backgroundImage: `radial-gradient(80% 140% at 8% 50%, rgb(${rgb} / 0.28) 0%, transparent 65%)`,
          }}
          className="bg-background-overlay relative flex h-[104px] items-center gap-2 overflow-hidden rounded-2xl border px-3"
        >
          <Medal className="drop-shadow-3xl shrink-0" height={82} type={active.type} />

          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex items-center gap-2">
              <span
                style={{ color: `rgb(${rgb})` }}
                className="text-[9px] font-black tracking-[0.16em] uppercase"
              >
                {t(active.type)}
              </span>
              <span className="flex items-center gap-0.5 text-[9px] font-bold text-white/45 tabular-nums">
                <Users className="h-2.5 w-2.5" />
                {active.participantsCount ?? 0}/{active.teamSize ?? '∞'}
              </span>
            </div>

            <h5 className="line-clamp-1 text-[13px] leading-tight font-bold text-white">
              {active.name}
            </h5>

            <span className="text-[19px] leading-none font-extrabold tabular-nums">
              <GoldenText>
                <span className="inline-flex items-center gap-1">
                  {formatCompact(active.prizePool)}
                  <LcLabel size={14} />
                </span>
              </GoldenText>
            </span>
          </div>

          <div className="flex w-[92px] shrink-0 flex-col items-center gap-1.5">
            <span
              className="text-electric-pink text-[15px] leading-none font-black tabular-nums"
              style={{ textShadow: '0 2px 8px rgba(222, 0, 155, 0.45)' }}
            >
              {countdown || t('soon')}
            </span>
            <span className="bg-pink-gradient flex-center h-11 w-full rounded-lg text-[12px] font-bold text-white">
              {t('join')}
            </span>
          </div>
        </div>
      </div>

      <div className="scrollbar-hidden flex gap-2 overflow-x-auto px-4 pb-1">
        {items.map((tournament, index) => (
          <LabTournamentQueueChip
            key={tournament.id}
            tournament={tournament}
            active={index === activeIndex}
            onSelect={() => setActiveIndex(index)}
          />
        ))}
      </div>
    </div>
  );
}
