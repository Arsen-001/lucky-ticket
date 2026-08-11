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

export interface LabTournamentPosterCardProps {
  tournament: Tournament;
  className?: string;
}

/**
 * Option A — the tournament as a poster.
 *
 * Portrait card, so the prize gets the biggest type on the strip and the tier
 * medal is large enough to be read as a tier rather than as decoration. Two
 * and a bit fit on a 390px screen, which is the point: the player compares
 * instead of waiting for the carousel to bring the next one round.
 */
export function LabTournamentPosterCard({ tournament, className }: LabTournamentPosterCardProps) {
  const t = useAppTranslations();
  const { type, name, prizePool, startTime, teamSize, participantsCount } = tournament;
  const { leftTime, days, hours, minutes } = useCountDown(startTime);
  const countdown = days > 0 ? `${days}${t('day short')} ${pad(hours)}:${pad(minutes)}` : leftTime;
  const rgb = LAB_TIER_RGB[type] ?? LAB_TIER_RGB.bronze;

  return (
    <div
      style={{
        borderColor: `rgb(${rgb} / 0.35)`,
        backgroundImage: `radial-gradient(115% 65% at 50% 0%, rgb(${rgb} / 0.28) 0%, transparent 72%)`,
      }}
      className={twMerge(
        'bg-background-overlay relative flex h-[156px] w-[150px] flex-col items-center overflow-hidden rounded-2xl border pt-2 transition-transform active:scale-98',
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

      <Medal className="mt-0.5 drop-shadow-3xl" height={62} type={type} />

      <span className="mt-1 text-[15px] leading-none font-extrabold tabular-nums">
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

      {/* Countdown owns the full width of the foot: on a strip of posters the
          only thing the player is comparing is which one starts first. */}
      <div
        style={{ borderColor: `rgb(${rgb} / 0.25)` }}
        className="mt-auto flex h-7 w-full items-center justify-center border-t bg-black/35"
      >
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
