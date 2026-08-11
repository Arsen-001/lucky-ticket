'use client';

import { Users } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Medal } from '@/components/shared/icons/Medal';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { GoldenText } from '@/components/shared/typography/GoldenText';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useCountDown } from '@/hooks/useCountDown';
import { formatCompact } from '@/utils/global/number.utils';
import { pad } from '@/utils/global/date.utils';
import { LAB_TIER_RGB } from './labTournamentTier.utils';
import type { Tournament } from '@/types/interfaces/tournaments.interfaces';
import '@/styles/components/lab-poster-ticket.css';

export interface LabTournamentPosterTicketCardProps {
  tournament: Tournament;
  className?: string;
}

/**
 * Hybrid A+C — the poster, cut like a ticket.
 *
 * A's proportions (portrait, prize in the biggest type on the strip, a medal
 * big enough to read as a tier) with C's shape: the countdown sits on a
 * tear-off foot, punched at both edges and dashed across.
 *
 * This one shipped for about an hour before the horizontal ticket (option C)
 * replaced it. It stays here because the two differ in what they cost the
 * screen — 188px against 120px — and that trade may be worth revisiting.
 */
export function LabTournamentPosterTicketCard({
  tournament,
  className,
}: LabTournamentPosterTicketCardProps) {
  const t = useAppTranslations();
  const { type, name, prizePool, startTime, teamSize, participantsCount } = tournament;
  const { leftTime, days, hours, minutes } = useCountDown(startTime);
  const countdown = days > 0 ? `${days}${t('day short')} ${pad(hours)}:${pad(minutes)}` : leftTime;
  const rgb = LAB_TIER_RGB[type] ?? LAB_TIER_RGB.bronze;

  return (
    <div
      style={{
        backgroundImage: `linear-gradient(180deg, rgb(${rgb} / 0.32) 0%, rgb(${rgb} / 0.07) 58%, rgba(0, 0, 0, 0.32) 76%, rgba(0, 0, 0, 0.32) 100%)`,
      }}
      className={twMerge(
        'lab-poster-ticket bg-background-overlay relative flex h-[156px] w-[150px] flex-col items-center overflow-hidden rounded-2xl pt-2 transition-transform active:scale-98',
        className
      )}
    >
      <div className="flex w-full items-center justify-between px-2.5">
        <span
          style={{ color: `rgb(${rgb})` }}
          className="text-[9px] font-black tracking-[0.16em] uppercase"
        >
          {t(type)}
        </span>
        <span className="flex items-center gap-0.5 text-[9px] font-bold text-white/45 tabular-nums">
          <Users className="h-2.5 w-2.5" />
          {participantsCount ?? 0}/{teamSize ?? '∞'}
        </span>
      </div>

      <Medal className="drop-shadow-3xl mt-0.5" height={60} type={type} />

      <span className="mt-0.5 text-[15px] leading-none font-extrabold tabular-nums">
        <GoldenText>
          <span className="inline-flex items-center gap-1">
            {formatCompact(prizePool)}
            <LcLabel size={12} />
          </span>
        </GoldenText>
      </span>

      <h5 className="mt-1 line-clamp-1 px-2 text-[11px] leading-tight font-bold text-white/85">
        {name}
      </h5>

      <span className="lab-poster-ticket-seam" />

      <div className="mt-auto flex h-[34px] w-full items-center justify-center">
        <span
          className="text-electric-pink text-[14px] leading-none font-black tabular-nums"
          style={{ textShadow: '0 2px 8px rgba(222, 0, 155, 0.45)' }}
        >
          {countdown || t('soon')}
        </span>
      </div>
    </div>
  );
}
