'use client';

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
import '@/styles/components/lab-tournament-ticket.css';

export interface LabTournamentTicketCardProps {
  tournament: Tournament;
  className?: string;
}

/**
 * Option C — the card is a ticket.
 *
 * Same information as today, in a shape that belongs to this product and not
 * to a generic carousel: a torn-off stub carrying the tier medal, a dashed
 * tear line, and two punched notches the backdrop shows through. The tier
 * colour paints the stub instead of a hairline, so the ladder is legible at a
 * glance rather than as a 1px shine.
 */
export function LabTournamentTicketCard({ tournament, className }: LabTournamentTicketCardProps) {
  const t = useAppTranslations();
  const { type, name, prizePool, startTime, teamSize, participantsCount } = tournament;
  const { leftTime, days, hours, minutes } = useCountDown(startTime);
  const countdown = days > 0 ? `${days}${t('day short')} ${pad(hours)}:${pad(minutes)}` : leftTime;
  const rgb = LAB_TIER_RGB[type] ?? LAB_TIER_RGB.bronze;

  return (
    <div
      style={{ backgroundColor: `rgb(${rgb} / 0.10)` }}
      className={twMerge(
        'lab-ticket-card bg-background-overlay relative flex h-[80px] w-[238px] items-stretch rounded-xl transition-transform active:scale-98',
        className
      )}
    >
      {/* Stub — the tier lives here, painted rather than outlined. */}
      <div
        style={{
          background: `linear-gradient(160deg, rgb(${rgb} / 0.45) 0%, rgb(${rgb} / 0.12) 100%)`,
        }}
        className="flex-center w-[62px] shrink-0 rounded-l-xl"
      >
        <Medal className="drop-shadow-3xl" height={54} type={type} />
      </div>

      <span className="lab-ticket-seam" />

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 px-2.5">
        <div className="flex items-center justify-between gap-2">
          <span
            style={{ color: `rgb(${rgb})` }}
            className="text-[8.5px] font-black tracking-[0.16em] uppercase"
          >
            {t(type)}
          </span>
          <span className="text-[9px] font-bold text-white/40 tabular-nums">
            {participantsCount ?? 0}/{teamSize ?? '∞'}
          </span>
        </div>

        <h5 className="line-clamp-1 text-[12px] leading-tight font-bold text-white">{name}</h5>

        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[14px] leading-none font-extrabold tabular-nums">
            <GoldenText>
              <span className="inline-flex items-center gap-1">
                {formatCompact(prizePool)}
                <LcLabel size={12} />
              </span>
            </GoldenText>
          </span>
          <span
            className="text-electric-pink text-[14px] leading-none font-black tabular-nums"
            style={{ textShadow: '0 2px 8px rgba(222, 0, 155, 0.45)' }}
          >
            {countdown || t('soon')}
          </span>
        </div>
      </div>
    </div>
  );
}
