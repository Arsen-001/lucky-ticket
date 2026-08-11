'use client';
import Image from 'next/image';
import { Megaphone, Users } from 'lucide-react';
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
import { pad } from '@/utils/global/date.utils';
import { tierAccentColors } from '@/constants/tier-colors';
import { routes } from '@/constants/routes';
import type { Tournament } from '@/types/interfaces/tournaments.interfaces';
import type { CSSProperties } from 'react';
import '@/styles/components/home-tournament-ticket.css';

export interface HomeUpcomingTournamentCardProps extends Tournament {
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * A tournament on Home, as a ticket.
 *
 * Portrait, so the prize can carry the biggest type on the strip and the tier
 * medal is large enough to be read as a tier rather than as a badge — the
 * previous 256×64 row gave the medal a sliced 74px and the prize the same size
 * as the name. The tier paints the card top-down instead of outlining it in a
 * 1px shine, and the countdown sits on a tear-off foot: punched at both edges,
 * dashed across. @see styles/components/home-tournament-ticket.css
 *
 * Sponsored tournaments (DOCS §11.8) keep their own skin — purple border,
 * banner or spiderweb background, logo in place of the medal — and the same
 * ticket cut, so a paid card reads as one of the strip rather than as an ad
 * pasted onto it.
 */
export function HomeUpcomingTournamentCard({
  id,
  type,
  startTime,
  name,
  prizePool,
  teamSize,
  participantsCount,
  sponsor,
  loading,
  className,
  style,
}: HomeUpcomingTournamentCardProps) {
  const t = useAppTranslations();
  const { leftTime, days, hours, minutes } = useCountDown(startTime);
  // Seconds are noise when the start is days away — and "3d 06:47:04" is the
  // one countdown shape that overflows the foot.
  const countdown = days > 0 ? `${days}${t('day short')} ${pad(hours)}:${pad(minutes)}` : leftTime;
  const accent = type ? tierAccentColors[type] : undefined;

  return (
    <Link
      href={id ? routes.tournaments.getById(id) : routes.tournaments.index}
      // Every word inside this card arrives with the data, so while it loads
      // the link has no name at all — several of them in a row on the home
      // strip, each announced as bare "link".
      aria-label={name || t('tournaments')}
    >
      <div
        style={{
          ...style,
          // Tier wash: strongest behind the medal, gone by the seam, so the foot
          // reads as a separate piece of card stock.
          ...(accent && !sponsor
            ? {
                backgroundImage: `linear-gradient(180deg, ${accent}52 0%, ${accent}12 58%, rgba(0, 0, 0, 0.32) 76%, rgba(0, 0, 0, 0.32) 100%)`,
              }
            : null),
        }}
        className={twMerge(
          'home-tournament-ticket bg-background-overlay relative flex h-[156px] w-[150px] flex-col items-center overflow-hidden rounded-2xl pt-2 transition-transform active:scale-98',
          sponsor && 'home-tournament-ticket-sponsored',
          className
        )}
      >
        {/* Background — chosen banner or the default spiderweb, behind everything */}
        {sponsor && <TournamentSponsorBackground sponsor={sponsor} />}

        <div className="relative z-10 flex w-full items-center justify-between px-2.5">
          <span
            // "Created by you" is 14 characters of letter-spaced caps and does
            // not survive this width — it truncated to "CREATED BY …". The
            // shorter word is shown and the longer one carries the detail.
            title={sponsor?.createdByMe ? t('created by you') : undefined}
            style={{ color: sponsor ? 'var(--color-electric-purple)' : accent }}
            className="flex items-center gap-1 truncate text-[9px] font-black tracking-[0.16em] uppercase"
          >
            {sponsor ? (
              <>
                <Megaphone className="h-2.5 w-2.5 shrink-0" strokeWidth={2.6} />
                <span className="truncate">{t('sponsored')}</span>
              </>
            ) : (
              type && t(type)
            )}
          </span>

          {!loading && (
            <span className="flex shrink-0 items-center gap-0.5 text-[9px] font-bold text-white/45 tabular-nums">
              <Users className="h-2.5 w-2.5" />
              {participantsCount ?? 0}/{teamSize ?? '∞'}
            </span>
          )}
        </div>

        <div className="relative z-10 mt-0.5 flex h-[60px] items-center">
          {sponsor ? (
            sponsor.logoUrl ? (
              <span className="relative block h-[54px] w-[104px] overflow-hidden rounded-lg">
                <Image
                  src={sponsor.logoUrl}
                  alt={sponsor.name}
                  fill
                  unoptimized
                  sizes="104px"
                  className="object-contain"
                />
              </span>
            ) : (
              <Megaphone className="h-10 w-10 text-white/90" strokeWidth={1.6} />
            )
          ) : (
            <Medal className="drop-shadow-3xl" height={60} type={type} loading={loading} />
          )}
        </div>

        <SkeletonSuspense
          loading={loading}
          skeleton={<Skeleton variant="line" textSize="sm" className="mt-1 h-4 w-16" />}
        >
          <span className="relative z-10 mt-0.5 text-[15px] leading-none font-extrabold tabular-nums">
            <GoldenText>
              <span className="inline-flex items-center gap-1">
                {prizePool != null ? formatCompact(prizePool) : ''}
                <LcLabel size={12} />
              </span>
            </GoldenText>
          </span>
        </SkeletonSuspense>

        <SkeletonSuspense
          loading={loading}
          skeleton={<Skeleton variant="line" textSize="sm" className="mt-1.5 h-3 w-24" />}
        >
          <h5 className="relative z-10 mt-1 line-clamp-1 px-2 text-[11px] leading-tight font-bold text-white/85">
            {name}
          </h5>
        </SkeletonSuspense>

        <span className="home-tournament-ticket-seam z-10" />

        <div className="relative z-10 mt-auto flex h-[34px] w-full items-center justify-center">
          <SkeletonSuspense
            loading={loading}
            skeleton={<Skeleton variant="line" textSize="sm" className="h-4 w-20" />}
          >
            <span
              className="text-electric-pink text-[14px] leading-none font-black tabular-nums"
              style={{ textShadow: '0 2px 8px rgba(222, 0, 155, 0.45)' }}
            >
              {countdown || t('soon')}
            </span>
          </SkeletonSuspense>
        </div>
      </div>
    </Link>
  );
}
