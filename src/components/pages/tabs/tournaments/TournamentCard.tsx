'use client';
import type { CSSProperties, MouseEvent } from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import dayjs from 'dayjs';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Lock,
  Megaphone,
  ShieldCheck,
  Ticket,
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Button } from '@/components/shared/buttons/Button';
import { ChipShardIcon } from '@/components/shared/icons/ChipShardIcon';
import { Medal } from '@/components/shared/icons/Medal';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { GoldenText } from '@/components/shared/typography/GoldenText';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useSpendFailure } from '@/hooks/useSpendFailure';
import {
  useJoinTournamentMutation,
  useMarkTournamentResultSeenMutation,
} from '@/api/tournaments.api';
import { useGetTicketsQuery } from '@/api/tickets.api';
import { useCountDown } from '@/hooks/useCountDown';
import { useUnlockedTiers } from '@/hooks/useUnlockedTiers';
import { formatCompact, formatNumber } from '@/utils/global/number.utils';
import { useTournamentConfig } from '@/hooks/useTournamentConfig';
import { resolveShardRewards } from '@/utils/global/tournament.utils';
import { routes } from '@/constants/routes';
import type {
  PersonalTournament,
  Tournament,
  TournamentUserResult,
} from '@/types/interfaces/tournaments.interfaces';
import type { TournamentType } from '@/types/types/tournaments.types';
import { TournamentBetModal } from '@/components/pages/out-tabs/tabs-extra/tournament/TournamentBetModal';
import { TournamentResultModal } from '@/components/pages/out-tabs/tabs-extra/tournament/TournamentResultModal';
import { ShardZoomButton } from '@/components/pages/out-tabs/tabs-extra/tournament/ShardZoomButton';
import { TierGateModal } from '@/components/shared/modals/TierGateModal';
import { TournamentSponsorHeader } from './TournamentSponsorHeader';
import { TournamentSponsorBackground } from './TournamentSponsorBackground';
import { TournamentStatCell } from './TournamentStatCell';
import '@/styles/components/tournament-card.css';

/**
 * Tier colour as an `R G B` triplet for the light behind the card.
 *
 * Taken from the same palette the tier's gradient border uses, so the backdrop
 * continues the tier ladder rather than decorating it. @see .tournament-card-glow
 */
const TIER_GLOW: Record<TournamentType, string> = {
  bronze: '172 97 34',
  silver: '168 170 164',
  gold: '248 189 62',
  platinum: '192 190 177',
  diamond: '23 141 136',
};

/**
 * `list` — a row in the catalog: the whole card is the link to the detail page.
 * `detail` — the same card as the detail screen's header. It is already the
 * page it would navigate to, so it doesn't act as a link; in exchange the shard
 * icon becomes tappable (zoom preview), which in the list would fight the
 * card's own tap.
 */
export type TournamentCardVariant = 'list' | 'detail';

export type TournamentCardProps = (Tournament | PersonalTournament) & {
  variant?: TournamentCardVariant;
  loading?: boolean;
  participated?: boolean;
  participatedTicketsCount?: number;
  userResult?: TournamentUserResult;
  resultSeen?: boolean;
  /** Marks this card's Join button as the onboarding-tour "tournament-join" anchor. */
  tourJoinAnchor?: boolean;
  className?: string;
  style?: CSSProperties;
};

const formatEndedAgo = (startTime: string, t: ReturnType<typeof useAppTranslations>): string => {
  const diffMs = Date.now() - new Date(startTime).getTime();
  if (diffMs < 0) return '';
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 60) return t('{n}m ago', { n: Math.max(1, minutes) });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t('{n}h ago', { n: hours });
  const days = Math.floor(hours / 24);
  return t('{n}d ago', { n: days });
};

export function TournamentCard({
  id,
  type,
  startTime,
  name,
  prizePool,
  teamSize,
  participantsCount,
  ticketsTotal,
  entrantsCount,
  places,
  shardType,
  shardsFirst,
  shardsSecond,
  shardsThird,
  status,
  sponsor,
  variant = 'list',
  loading,
  participated = false,
  participatedTicketsCount,
  userResult,
  resultSeen,
  tourJoinAnchor = false,
  className,
  style,
}: TournamentCardProps) {
  const t = useAppTranslations();
  const router = useRouter();
  const spend = useSpendFailure();
  const isDetail = variant === 'detail';
  const { isTierUnlocked } = useUnlockedTiers();
  const { shardRewards } = useTournamentConfig();
  const { data: tickets } = useGetTicketsQuery();
  const [joinTournament] = useJoinTournamentMutation();
  const [markResultSeen] = useMarkTournamentResultSeenMutation();
  const isFinished = status === 'finished';
  // A sponsored tournament the creator just submitted, awaiting review (§11.8) —
  // shown to its creator but not joinable / navigable until approved.
  const isModeration = status === 'moderation';
  // A tournament whose tier sits above the player's AP tier is shown but locked
  // (DOCS §5.2 tier gate / §11). Finished tournaments are never locked.
  const locked = !isFinished && !!type && !isTierUnlocked(type);
  const { leftTimeText, expired, days, hours, minutes } = useCountDown(
    isFinished ? undefined : startTime
  );
  // "Results pending" 5-min window after the tournament ends (deferred draw) —
  // a reverse countdown to the payout, shown instead of a static "started".
  const pendingCountdown = useCountDown(
    !isFinished && startTime ? new Date(new Date(startTime).getTime() + 5 * 60 * 1000) : undefined
  );
  const ticketCount = participatedTicketsCount ?? 0;
  // Countdown hit zero but the backend hasn't marked it finished yet — the
  // join window is closed, results are pending.
  const isStarted = !isFinished && expired && !!startTime;
  const isStartingSoon = !isFinished && !isStarted && days === 0 && hours === 0 && minutes < 60;
  // Card headline pairs with the total prize pool, so it shows the TOTAL shards
  // across the top-3; the bet modal (labeled "1st") still gets the winner's take.
  const { first: firstShards, total: totalShards } = resolveShardRewards(
    { shardsFirst, shardsSecond, shardsThird },
    shardRewards
  );
  const hasUnseenResult = isFinished && !!userResult && !resultSeen;

  const [isBetModalOpen, setIsBetModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);

  const availableTickets = tickets?.find(item => item.ticketType === type)?.count ?? 0;

  const handleJoin = async (ticketsCount: number) => {
    if (!id) return;
    try {
      await joinTournament({ tournamentId: id, ticketsCount }).unwrap();
    } catch (error) {
      setIsBetModalOpen(false);
      await spend.report(error, { required: ticketsCount });
    }
  };

  const handleResultClose = () => {
    setIsResultModalOpen(false);
    if (id) markResultSeen({ tournamentId: id });
  };

  const handleActionClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // A locked tier used to swallow the tap silently. Say what the gate is and
    // open the screen that closes it instead.
    if (locked) {
      setIsLockModalOpen(true);
      return;
    }
    if (isStarted) return;
    if (isFinished) {
      setIsResultModalOpen(true);
    } else {
      setIsBetModalOpen(true);
    }
  };

  const handleCardClick = () => {
    if (loading || isModeration) return;
    if (locked) {
      setIsLockModalOpen(true);
      return;
    }
    if (!id) return;
    router.push(routes.tournaments.getById(id));
  };

  const timeChipText = isFinished
    ? formatEndedAgo(startTime, t)
    : isStarted
      ? pendingCountdown.expired
        ? t('started')
        : pendingCountdown.leftTimeShort
      : leftTimeText || t('soon');

  // Grouped while it fits — «960,000» is the same figure the bet modal and the
  // result screen show, and the old «960K» made the card disagree with both.
  // Eight figures and up it goes compact instead: at 24px on a 320px card the
  // full number would push the countdown chip off the edge.
  const prizeText =
    prizePool == null
      ? ''
      : prizePool >= 10_000_000
        ? formatCompact(prizePool)
        : formatNumber(prizePool);

  return (
    <>
      <div
        // Locked, the card opens the gate dialog rather than navigating — a
        // screen reader announcing "link" would promise a page that never loads.
        // On the detail screen the card is the page itself: no role, no tab
        // stop, no tap target — only the buttons inside it act.
        role={isDetail ? undefined : locked ? 'button' : 'link'}
        tabIndex={isDetail ? undefined : 0}
        onClick={isDetail ? undefined : handleCardClick}
        onKeyDown={
          isDetail
            ? undefined
            : e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCardClick();
                }
              }
        }
        style={style}
        className={twMerge(
          'relative w-full overflow-hidden rounded-2xl flex flex-col p-3 transition-transform focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white',
          // Locked cards stay tappable — the tap now explains the gate, so
          // neither `cursor-not-allowed` nor `aria-disabled` would be true.
          isDetail || isModeration ? 'cursor-default' : 'active:scale-99 cursor-pointer',
          // A plain hairline, not the tier's gradient border: the tier is now
          // said by the light behind the card and by the medal, and running
          // both at once put a coloured outline around every row in the list.
          isFinished
            ? 'tournament-card-finished'
            : sponsor
              ? 'tournament-card-sponsored'
              : 'bg-background-overlay border border-white/8',
          locked && 'opacity-70 saturate-[0.55]',
          className
        )}
      >
        {/* Background — chosen banner or the default spiderweb, behind everything */}
        {sponsor && <TournamentSponsorBackground sponsor={sponsor} />}

        {/* Sponsored header strip — the dominant "this is not a game tournament" cue */}
        {sponsor && <TournamentSponsorHeader sponsor={sponsor} />}

        {/* Tier light. Skipped for sponsors (their banner owns the backdrop)
            and for finished cards, which are deliberately colourless. */}
        {!sponsor && !isFinished && type && (
          <span
            aria-hidden
            style={{ '--tier-glow': TIER_GLOW[type] } as CSSProperties}
            className="tournament-card-glow pointer-events-none absolute inset-0 rounded-2xl"
          />
        )}

        {/* Head — medal, name, prize, date, countdown */}
        <div className="relative z-10 flex items-start gap-3">
          {/* The medal stands on its own — no plate. The 96px grey square it
              used to sit in was empty box around a transparent asset. Sponsors
              keep one: an arbitrary brand logo needs a surface. */}
          <div
            className={twMerge(
              'relative shrink-0',
              (loading || sponsor) && 'size-14 overflow-hidden rounded-lg',
              loading && 'skeleton',
              !loading && sponsor && 'flex-center bg-white/8',
              isFinished && 'opacity-80'
            )}
          >
            {!loading &&
              (sponsor ? (
                sponsor.logoUrl ? (
                  <Image
                    src={sponsor.logoUrl}
                    alt={sponsor.name}
                    fill
                    unoptimized
                    sizes="56px"
                    className="object-contain p-2"
                  />
                ) : (
                  <Megaphone className="h-8 w-8 text-white/90" strokeWidth={1.6} />
                )
              ) : (
                <Medal className="drop-shadow-lg drop-shadow-black/40" height={56} type={type} />
              ))}
            {locked && (
              <span className="flex-center absolute inset-0 rounded-lg bg-black/45 backdrop-blur-[1px]">
                <Lock className="text-white/90" size={22} strokeWidth={2.4} />
              </span>
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <SkeletonSuspense
              loading={loading}
              skeleton={<Skeleton variant="line" textSize="sm" className="w-full max-w-40" />}
            >
              <h5 className="line-clamp-1 text-sm leading-tight font-bold text-white">{name}</h5>
            </SkeletonSuspense>

            {/* The number that decides whether to join, finally sized like it.
                Grouped rather than compact: «960,000» is the figure the bet
                modal and the result screen also show, and «960K» made the card
                disagree with both. */}
            <SkeletonSuspense
              loading={loading}
              skeleton={<Skeleton variant="line" textSize="xl" className="w-32" />}
            >
              <GoldenText
                className="inline-flex items-center gap-1.5 text-2xl leading-none font-extrabold tabular-nums"
                style={{ textShadow: '0 1px 6px rgba(248, 189, 62, 0.45)' }}
              >
                {prizeText}
                <LcLabel size={18} />
              </GoldenText>
            </SkeletonSuspense>

            <SkeletonSuspense
              loading={loading}
              skeleton={<Skeleton variant="line" textSize="xs" className="w-24" />}
            >
              <span className="inline-flex items-center gap-1 text-[11px] leading-none text-white/45">
                <CalendarDays className="h-3 w-3 shrink-0" />
                <span suppressHydrationWarning className="tabular-nums">
                  {/* No year: tournaments run within days, so it cost ~30px to
                      say nothing. */}
                  {dayjs(startTime).format('DD/MM · HH:mm')}
                </span>
              </span>
            </SkeletonSuspense>
          </div>

          <SkeletonSuspense
            loading={loading}
            skeleton={<Skeleton variant="rounded-rectangle" className="h-6 w-16" />}
          >
            <span
              suppressHydrationWarning
              className={twMerge(
                // shrink-0: nothing beside it gives way, so a squeeze here used
                // to silently eat the trailing "m" of a two-digit-hour value.
                'inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-1 leading-none text-white',
                isFinished
                  ? 'bg-white/5 text-white/65'
                  : isStarted
                    ? 'bg-teal/20'
                    : isStartingSoon
                      ? 'bg-electric-pink/30'
                      : 'bg-white/6'
              )}
            >
              <Clock
                className={twMerge(
                  'h-3 w-3 shrink-0',
                  isStarted
                    ? 'text-teal'
                    : isStartingSoon
                      ? 'text-electric-pink'
                      : 'text-pink-secondary'
                )}
                strokeWidth={2.4}
              />
              <span className="truncate text-[11px] leading-none font-bold tabular-nums">
                {timeChipText}
              </span>
            </span>
          </SkeletonSuspense>
        </div>

        {/* Facts, captioned. The row this replaced printed a bare «96» that
            meant seats but read as players — @see TournamentStatCell. */}
        <SkeletonSuspense
          loading={loading}
          skeleton={<Skeleton variant="rounded-rectangle" className="mt-2.5 h-11" />}
        >
          <div className="relative z-10 mt-2.5 flex items-stretch divide-x divide-white/10 rounded-xl bg-black/25">
            <TournamentStatCell caption={t('shards title')}>
              {shardType && type ? (
                isDetail ? (
                  <ShardZoomButton type={shardType} tier={type} size={15} />
                ) : (
                  <ChipShardIcon type={shardType} tier={type} size={15} />
                )
              ) : null}
              <span className="text-[15px] leading-none font-extrabold text-white tabular-nums">
                ×{totalShards}
              </span>
            </TournamentStatCell>

            <TournamentStatCell caption={participantsCount != null ? t('seats taken') : t('seats')}>
              <span className="text-[15px] leading-none font-extrabold text-white tabular-nums">
                {participantsCount != null ? (
                  <>
                    {formatCompact(participantsCount)}
                    <span className="text-white/40">/{teamSize == null ? '∞' : teamSize}</span>
                  </>
                ) : (
                  // Nothing to divide by: without a participant count the card
                  // can only honestly state the capacity, so the caption above
                  // switches with it rather than implying a total.
                  (teamSize ?? '∞')
                )}
              </span>
            </TournamentStatCell>
          </div>
        </SkeletonSuspense>

        {/* Action — full width, so the card ends on what it wants you to do */}
        <SkeletonSuspense
          loading={loading}
          skeleton={<Skeleton variant="rounded-rectangle" className="mt-2.5 h-9" />}
        >
          <div className="relative z-10 mt-2.5 flex items-center gap-2">
            {participated && !isFinished && (
              <span className="bg-success/20 text-success inline-flex shrink-0 items-center gap-1 rounded-xl px-2.5 py-2.5 text-[11px] leading-none font-bold">
                <Ticket className="h-3 w-3 shrink-0" />
                <span className="tabular-nums">×{ticketCount}</span>
              </span>
            )}

            {isModeration ? (
              <span className="text-electric-purple border-electric-purple/30 bg-electric-purple/15 flex-center flex-1 gap-1.5 rounded-xl border px-3 py-2.5 text-[11px] leading-none font-extrabold tracking-[0.14em] uppercase">
                <ShieldCheck size={12} strokeWidth={2.6} />
                {t('status moderation')}
              </span>
            ) : isFinished && userResult ? (
              <Button
                variant="purpleGradient"
                icon={<CheckCircle2 strokeWidth={2.6} />}
                iconSize={13}
                onClick={handleActionClick}
                className={twMerge(
                  'flex-1 rounded-xl px-3 py-2.5 text-[11px] leading-none font-extrabold tracking-[0.14em] uppercase',
                  'shadow-[0_4px_14px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.18)]',
                  'transition-transform active:scale-95',
                  hasUnseenResult && 'animate-pulse'
                )}
              >
                {/* Same reset as the join button — @see the note there. */}
                <span className="leading-none font-extrabold">{t('result')}</span>
              </Button>
            ) : isFinished ? (
              <button
                type="button"
                onClick={handleActionClick}
                className="flex-center flex-1 cursor-pointer rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-[11px] leading-none font-extrabold tracking-[0.14em] text-white/65 uppercase transition-transform hover:bg-white/8 active:scale-95"
              >
                {t('ended')}
              </button>
            ) : locked ? (
              <span className="flex-center flex-1 gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-[11px] leading-none font-extrabold tracking-[0.14em] text-white/55 uppercase">
                <Lock size={12} strokeWidth={2.6} />
                {t('locked')}
              </span>
            ) : isStarted ? (
              <span className="text-teal border-teal/30 bg-teal/15 flex-center flex-1 gap-1.5 rounded-xl border px-3 py-2.5 text-[11px] leading-none font-extrabold tracking-[0.14em] uppercase">
                <Clock size={12} strokeWidth={2.6} />
                {t('started')}
              </span>
            ) : (
              <Button
                // Anchor only once loaded — locking the tour onto the skeleton
                // card's button makes the spotlight drift when data lands.
                data-tour={tourJoinAnchor && !loading ? 'tournament-join' : undefined}
                disabled={loading}
                onClick={handleActionClick}
                className={twMerge(
                  'tap-target relative flex-1 rounded-xl py-2.5 text-[12px] leading-none font-extrabold tracking-[0.14em] uppercase',
                  'transition-transform active:scale-95',
                  participated && 'bg-success',
                  !participated && isStartingSoon && 'animate-pulse'
                )}
              >
                {/* Spelled out, not «Join» / «Add»: the button runs the full
                    width now, and a two-letter verb on a 300px bar says less
                    than it has room for — «Add» in particular never said add
                    WHAT.

                    `font-extrabold` repeated here on purpose: the base layer
                    sets `* { font-weight: 400 }`, so a nested element does not
                    inherit the button's weight — it is reset by the star
                    selector. @see styles/global/base-layer.css */}
                <span className="leading-none font-extrabold">
                  {t(participated ? 'add tickets' : 'join tournament')}
                </span>
              </Button>
            )}
          </div>
        </SkeletonSuspense>
      </div>

      <TournamentBetModal
        open={isBetModalOpen}
        onClose={() => setIsBetModalOpen(false)}
        onConfirm={handleJoin}
        tournamentName={name ?? ''}
        tournamentType={type ?? 'bronze'}
        shardType={shardType}
        topShards={firstShards}
        availableTickets={availableTickets}
        participated={participated}
        participatedTicketsCount={participatedTicketsCount}
        ticketsTotal={ticketsTotal}
        entrantsCount={entrantsCount}
      />

      <TournamentResultModal
        open={isResultModalOpen}
        onClose={handleResultClose}
        tournamentId={id}
        tournamentName={name ?? ''}
        tournamentType={type ?? 'bronze'}
        shardType={shardType}
        result={userResult}
        total={participantsCount}
        places={places}
      />

      <TierGateModal
        open={isLockModalOpen}
        onClose={() => setIsLockModalOpen(false)}
        tier={type ?? 'bronze'}
        titleId="tournament locked"
      />

      {spend.modals}
    </>
  );
}
