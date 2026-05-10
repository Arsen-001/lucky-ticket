'use client';
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
import type { TournamentType } from '@/types/types/tournaments.types';
import type { CSSProperties } from 'react';
import '@/styles/components/engine-preview-card.css';

export interface HomeUpcomingTournamentCardProps extends Tournament {
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

const TIER_CLASS: Record<TournamentType, string> = {
  bronze: 'engine-preview-card-tier-bronze',
  silver: 'engine-preview-card-tier-silver',
  gold: 'engine-preview-card-tier-gold',
  platinum: 'engine-preview-card-tier-platinum',
  diamond: 'engine-preview-card-tier-diamond',
};

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
          'flex h-[80px] w-72 items-center gap-2.5 rounded-xl px-3 transition-transform active:scale-99',
          type ? `engine-preview-card--top-shine ${TIER_CLASS[type]}` : 'bg-background-overlay',
          className
        )}
      >
        <div className="flex-center h-[60px] w-[60px] flex-shrink-0">
          <Medal height={48} type={type} loading={loading} />
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
          <SkeletonSuspense
            loading={loading}
            skeleton={<Skeleton variant="line" textSize="sm" className="h-4 w-full" />}
          >
            <h5 className="line-clamp-1 text-[13px] font-bold leading-tight text-white">{name}</h5>
          </SkeletonSuspense>

          <div className="flex items-baseline justify-between gap-2">
            <SkeletonSuspense
              loading={loading}
              skeleton={<Skeleton variant="line" textSize="lg" className="h-5 w-20" />}
            >
              <span
                className="text-lg font-extrabold tabular-nums leading-none"
                style={{ textShadow: '0 1px 4px rgba(248, 189, 62, 0.4)' }}
              >
                <GoldenText>
                  {prizePool?.toLocaleString()} {GlobalConstants.coinName}
                </GoldenText>
              </span>
            </SkeletonSuspense>

            <SkeletonSuspense
              loading={loading}
              skeleton={<Skeleton variant="line" textSize="lg" className="h-5 w-20" />}
            >
              <span
                className="text-electric-pink text-xl font-black tabular-nums leading-none"
                style={{ textShadow: '0 2px 8px rgba(222, 0, 155, 0.45)' }}
              >
                {leftTime || t('soon')}
              </span>
            </SkeletonSuspense>
          </div>
        </div>
      </div>
    </Link>
  );
}
