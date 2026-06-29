'use client';
import Image from 'next/image';
import { Megaphone } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Link } from '@/components/shared/links/Link';
import { Medal } from '@/components/shared/icons/Medal';
import { TournamentSponsorBackground } from '@/components/pages/tabs/tournaments/TournamentSponsorBackground';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { GoldenText } from '@/components/shared/typography/GoldenText';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useCountDown } from '@/hooks/useCountDown';
import { formatCompact } from '@/utils/global/number.utils';
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
  sponsor,
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
          'relative flex h-[80px] w-72 items-center gap-2.5 rounded-xl px-3 transition-transform active:scale-99',
          sponsor
            ? 'engine-preview-card-sponsored'
            : type
              ? `engine-preview-card--top-shine ${TIER_CLASS[type]}`
              : 'bg-background-overlay',
          className
        )}
      >
        {/* Background — chosen banner or the default spiderweb, behind everything */}
        {sponsor && <TournamentSponsorBackground sponsor={sponsor} />}

        {sponsor && (
          <span
            title={sponsor.createdByMe ? t('created by you') : t('sponsored')}
            className="bg-electric-purple flex-center absolute right-2 top-2 z-10 h-5 w-5 rounded-full text-white shadow-md shadow-black/30"
          >
            <Megaphone className="h-3 w-3" strokeWidth={2.6} />
          </span>
        )}

        <div className="relative z-10 h-full w-[95px] flex-shrink-0">
          {sponsor ? (
            sponsor.logoUrl ? (
              <span className="absolute left-2 top-1/2 flex h-[60px] w-[72px] -translate-y-1/2 items-center justify-center overflow-hidden rounded-lg">
                <Image
                  src={sponsor.logoUrl}
                  alt={sponsor.name}
                  fill
                  unoptimized
                  sizes="72px"
                  className="object-contain"
                />
              </span>
            ) : (
              <Megaphone
                className="absolute left-4 top-1/2 h-9 w-9 -translate-y-1/2 text-white/90"
                strokeWidth={1.7}
              />
            )
          ) : (
            <Medal
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 drop-shadow-3xl"
              height={95}
              type={type}
              loading={loading}
            />
          )}
        </div>

        <div className="relative z-10 flex min-w-0 flex-1 flex-col justify-center gap-1.5">
          <SkeletonSuspense
            loading={loading}
            skeleton={<Skeleton variant="line" textSize="sm" className="h-4 w-full" />}
          >
            <h5
              className={twMerge(
                'line-clamp-1 text-[13px] font-bold leading-tight text-white',
                sponsor && 'pr-6'
              )}
            >
              {name}
            </h5>
          </SkeletonSuspense>

          <div className="flex items-baseline justify-between gap-2">
            <SkeletonSuspense
              loading={loading}
              skeleton={<Skeleton variant="line" textSize="lg" className="h-5 w-20" />}
            >
              <span
                className="whitespace-nowrap text-lg font-extrabold tabular-nums leading-none"
                style={{ textShadow: '0 1px 4px rgba(248, 189, 62, 0.4)' }}
              >
                <GoldenText>
                  <span className="inline-flex items-center gap-1">
                    {prizePool != null ? formatCompact(prizePool) : ''}
                    <LcLabel size={16} />
                  </span>
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
