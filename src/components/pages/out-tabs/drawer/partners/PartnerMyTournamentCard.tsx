'use client';

import type { CSSProperties } from 'react';
import dayjs from 'dayjs';
import { CalendarDays, Users } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Medal } from '@/components/shared/icons/Medal';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { formatCompact } from '@/utils/global/number.utils';
import type { PersonalTournament } from '@/types/interfaces/tournaments.interfaces';
import type { TournamentStatus } from '@/types/types/tournaments.types';
import type { MessageIds } from '@/types/types/i18n.types';

export type PartnerMyTournamentCardProps = Partial<PersonalTournament> & {
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
};

const statusStyle: Record<TournamentStatus, string> = {
  moderation: 'bg-electric-purple/20 text-electric-purple',
  upcoming: 'bg-success/20 text-success',
  finished: 'bg-white/5 text-white/55',
};

const statusKey: Record<TournamentStatus, MessageIds> = {
  moderation: 'status moderation',
  upcoming: 'status active',
  finished: 'status completed',
};

/** Compact management row for one of the advertiser's created tournaments. */
export function PartnerMyTournamentCard({
  name,
  type,
  status,
  prizePool,
  teamSize,
  startTime,
  loading,
  className,
  style,
}: PartnerMyTournamentCardProps) {
  const t = useAppTranslations();

  return (
    <div
      style={style}
      className={twMerge(
        'bg-background-overlay border-l-electric-purple/60 flex items-center gap-3 rounded-2xl border-s-[3px] p-3',
        className
      )}
    >
      {/* Tier medal */}
      <div
        className={twMerge(
          'relative h-12 w-12 shrink-0 overflow-hidden rounded-lg',
          loading ? 'skeleton' : 'flex-center bg-white/8'
        )}
      >
        {!loading && <Medal type={type} height={40} />}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        {/* Row 1: name + status */}
        <div className="flex items-start justify-between gap-2">
          <SkeletonSuspense
            loading={loading}
            skeleton={<Skeleton variant="line" textSize="sm" className="max-w-32" />}
          >
            <h5 className="line-clamp-1 text-sm font-bold leading-tight text-white">{name}</h5>
          </SkeletonSuspense>
          {!loading && status && (
            <span
              className={twMerge(
                'inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase leading-none tracking-wider',
                statusStyle[status]
              )}
            >
              {t(statusKey[status])}
            </span>
          )}
        </div>

        {/* Row 2: prize + team + start */}
        <SkeletonSuspense
          loading={loading}
          skeleton={<Skeleton variant="rounded-rectangle" className="h-4 w-2/3" />}
        >
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] leading-none">
            <span className="inline-flex items-center gap-1 font-bold text-white">
              {prizePool != null ? formatCompact(prizePool) : ''}
              <LcLabel size={12} />
            </span>
            <span className="text-white-secondary/70 inline-flex items-center gap-1 font-semibold tabular-nums">
              <Users className="h-3 w-3" />
              {teamSize}
            </span>
            {startTime && (
              <span className="text-white-secondary/70 inline-flex items-center gap-1 font-semibold tabular-nums">
                <CalendarDays className="h-3 w-3" />
                {dayjs(startTime).format('DD MMM · HH:mm')}
              </span>
            )}
          </div>
        </SkeletonSuspense>
      </div>
    </div>
  );
}
