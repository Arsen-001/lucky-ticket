'use client';
import { Clock, Trophy } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Link } from '@/components/shared/links/Link';
import { Medal } from '@/components/shared/icons/Medal';
import { GoldenText } from '@/components/shared/typography/GoldenText';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useCountDown } from '@/hooks/useCountDown';
import { GlobalConstants } from '@/constants/global.constants';
import { routes } from '@/constants/routes';
import type { Tournament } from '@/types/interfaces/tournaments.interfaces';
import type { CSSProperties } from 'react';

export interface HomeUpcomingTournamentCardProps extends Tournament {
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function HomeUpcomingTournamentCard({
  id,
  type,
  startTime,
  name,
  prizePool,
  loading,
  className,
  style,
}: HomeUpcomingTournamentCardProps) {
  const t = useAppTranslations();
  const { leftTime } = useCountDown(startTime);

  return (
    <Link href={id ? routes.tournaments.getById(id) : routes.tournaments.index}>
      <div
        style={style}
        className={twMerge(
          'card-outlined bg-purple-gradient flex h-[80px] w-72 items-center gap-2.5 rounded-xl px-3 transition-transform active:scale-99',
          className
        )}
      >
        <div className="flex-center bg-white/6 h-[60px] w-[60px] flex-shrink-0 rounded-lg">
          <Medal height={48} type={type} loading={loading} />
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
          <SkeletonSuspense
            loading={loading}
            skeleton={<Skeleton variant="line" textSize="sm" className="h-4 w-full" />}
          >
            <h5 className="line-clamp-1 text-sm font-extrabold leading-tight text-white">{name}</h5>
          </SkeletonSuspense>

          <SkeletonSuspense
            loading={loading}
            skeleton={<Skeleton variant="line" textSize="xs" className="h-3 w-24" />}
          >
            <div className="flex items-center gap-2 text-[11px] font-bold tabular-nums">
              <span className="inline-flex items-center gap-1">
                <Trophy size={11} className="text-gold flex-shrink-0" strokeWidth={2.4} />
                <GoldenText>
                  {prizePool?.toLocaleString()} {GlobalConstants.coinName}
                </GoldenText>
              </span>
              <span aria-hidden className="text-pink-secondary">
                ·
              </span>
              <span className="text-electric-pink inline-flex items-center gap-1">
                <Clock size={10} strokeWidth={2.6} />
                <span>{leftTime || t('soon')}</span>
              </span>
            </div>
          </SkeletonSuspense>
        </div>
      </div>
    </Link>
  );
}
