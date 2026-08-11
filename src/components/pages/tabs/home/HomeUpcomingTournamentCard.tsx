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
 * The tier lives on a torn-off stub — painted with the tier colour rather than
 * outlined in a 1px shine, and wide enough to carry a 54px medal — and the
 * tournament itself on the body: name, prize, countdown. The seam between them
 * is punched at both ends and dashed across.
 * @see styles/components/home-tournament-ticket.css
 *
 * The stub being on the LEFT is what makes the strip's half-visible neighbour
 * worth showing: it leads with its tier and its name instead of a countdown
 * sliced through the middle of a digit, which is what the old centred carousel
 * faded out at both edges.
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
  // one countdown shape that overflows the card's bottom row.
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
          ...(accent && !sponsor ? { backgroundColor: `${accent}1A` } : null),
        }}
        className={twMerge(
          'home-tournament-ticket bg-background-overlay relative flex h-[80px] w-[238px] items-stretch overflow-hidden rounded-xl transition-transform active:scale-98',
          sponsor && 'home-tournament-ticket-sponsored',
          className
        )}
      >
        {/* Background — chosen banner or the default spiderweb, behind everything */}
        {sponsor && <TournamentSponsorBackground sponsor={sponsor} />}

        {/* Stub — the tier lives here, painted rather than outlined. */}
        <div
          style={
            accent && !sponsor
              ? { background: `linear-gradient(160deg, ${accent}73 0%, ${accent}1F 100%)` }
              : undefined
          }
          className="flex-center relative z-10 w-[62px] shrink-0 rounded-l-xl"
        >
          {sponsor ? (
            sponsor.logoUrl ? (
              <span className="relative block h-[48px] w-[52px] overflow-hidden rounded-lg">
                <Image
                  src={sponsor.logoUrl}
                  alt={sponsor.name}
                  fill
                  unoptimized
                  sizes="52px"
                  className="object-contain"
                />
              </span>
            ) : (
              <Megaphone className="h-7 w-7 text-white/90" strokeWidth={1.7} />
            )
          ) : (
            <Medal className="drop-shadow-3xl" height={54} type={type} loading={loading} />
          )}
        </div>

        <span className="home-tournament-ticket-seam z-10" />

        <div className="relative z-10 flex min-w-0 flex-1 flex-col justify-center gap-1 px-2.5">
          <div className="flex items-center justify-between gap-2">
            <span
              // "Created by you" is 14 characters of letter-spaced caps and does
              // not survive this width — it truncated to "CREATED BY …". The
              // shorter word is shown and the longer one carries the detail.
              title={sponsor?.createdByMe ? t('created by you') : undefined}
              style={{ color: sponsor ? 'var(--color-electric-purple)' : accent }}
              className="flex items-center gap-1 truncate text-[8.5px] font-black tracking-[0.16em] uppercase"
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
              <span className="flex shrink-0 items-center gap-0.5 text-[9px] font-bold text-white/40 tabular-nums">
                <Users className="h-2.5 w-2.5" />
                {participantsCount ?? 0}/{teamSize ?? '∞'}
              </span>
            )}
          </div>

          <SkeletonSuspense
            loading={loading}
            skeleton={<Skeleton variant="line" textSize="sm" className="h-3 w-full" />}
          >
            <h5 className="line-clamp-1 text-[12px] leading-tight font-bold text-white">{name}</h5>
          </SkeletonSuspense>

          <div className="flex items-baseline justify-between gap-2">
            <SkeletonSuspense
              loading={loading}
              skeleton={<Skeleton variant="line" textSize="sm" className="h-4 w-14" />}
            >
              <span className="text-[14px] leading-none font-extrabold tabular-nums">
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
              skeleton={<Skeleton variant="line" textSize="sm" className="h-4 w-16" />}
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
      </div>
    </Link>
  );
}
