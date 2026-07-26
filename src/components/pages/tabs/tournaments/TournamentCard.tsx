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
  Cpu,
  Lock,
  Megaphone,
  MemoryStick,
  ShieldCheck,
  Sparkles,
  Ticket,
  Users,
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Button } from '@/components/shared/buttons/Button';
import { Medal } from '@/components/shared/icons/Medal';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { GoldenText } from '@/components/shared/typography/GoldenText';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useToast } from '@/hooks/useToast';
import {
  useJoinTournamentMutation,
  useMarkTournamentResultSeenMutation,
} from '@/api/tournaments.api';
import { useGetTicketsQuery } from '@/api/tickets.api';
import { useCountDown } from '@/hooks/useCountDown';
import { useUnlockedTiers } from '@/hooks/useUnlockedTiers';
import { formatCompact } from '@/utils/global/number.utils';
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
import { TournamentSponsorHeader } from './TournamentSponsorHeader';
import { TournamentSponsorBackground } from './TournamentSponsorBackground';
import '@/styles/components/tournament-card.css';

export type TournamentCardProps = (Tournament | PersonalTournament) & {
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
  shardType,
  shardsFirst,
  shardsSecond,
  shardsThird,
  status,
  sponsor,
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
  const toast = useToast();
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
  const tierClass: Record<TournamentType, string> = {
    bronze: 'tournament-card-tier-bronze',
    silver: 'tournament-card-tier-silver',
    gold: 'tournament-card-tier-gold',
    platinum: 'tournament-card-tier-platinum',
    diamond: 'tournament-card-tier-diamond',
  };
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
  const ShardIcon = shardType === 'capacity' ? MemoryStick : Cpu;
  // Card headline pairs with the total prize pool, so it shows the TOTAL shards
  // across the top-3; the bet modal (labeled "1st") still gets the winner's take.
  const { first: firstShards, total: totalShards } = resolveShardRewards(
    { shardsFirst, shardsSecond, shardsThird },
    shardRewards
  );
  const hasUnseenResult = isFinished && !!userResult && !resultSeen;

  const [isBetModalOpen, setIsBetModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);

  const availableTickets = tickets?.find(item => item.ticketType === type)?.count ?? 0;

  const handleJoin = async (ticketsCount: number) => {
    if (!id) return;
    try {
      await joinTournament({ tournamentId: id, ticketsCount }).unwrap();
    } catch {
      toast.error(t('action failed'));
    }
  };

  const handleResultClose = () => {
    setIsResultModalOpen(false);
    if (id) markResultSeen({ tournamentId: id });
  };

  const handleActionClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (locked || isStarted) return;
    if (isFinished) {
      setIsResultModalOpen(true);
    } else {
      setIsBetModalOpen(true);
    }
  };

  const handleCardClick = () => {
    if (loading || !id || locked || isModeration) return;
    router.push(routes.tournaments.getById(id));
  };

  const timeChipText = isFinished
    ? formatEndedAgo(startTime, t)
    : isStarted
      ? pendingCountdown.expired
        ? t('started')
        : pendingCountdown.leftTimeShort
      : leftTimeText || t('soon');

  return (
    <>
      <div
        role="link"
        tabIndex={0}
        onClick={handleCardClick}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCardClick();
          }
        }}
        style={style}
        aria-disabled={locked || undefined}
        className={twMerge(
          'w-full rounded-2xl flex flex-col p-3 transition-transform focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white',
          locked
            ? 'cursor-not-allowed'
            : isModeration
              ? 'cursor-default'
              : 'active:scale-99 cursor-pointer',
          isFinished
            ? 'tournament-card-finished'
            : sponsor
              ? 'tournament-card-sponsored'
              : type
                ? tierClass[type]
                : 'bg-background-overlay',
          locked && 'opacity-70 saturate-[0.55]',
          className
        )}
      >
        {/* Background — chosen banner or the default spiderweb, behind everything */}
        {sponsor && <TournamentSponsorBackground sponsor={sponsor} />}

        {/* Sponsored header strip — the dominant "this is not a game tournament" cue */}
        {sponsor && <TournamentSponsorHeader sponsor={sponsor} />}

        <div className="relative z-10 flex items-stretch gap-3">
          {/* Medal stage — left (sponsor logo replaces the tier medal) */}
          <div
            className={twMerge(
              'w-24 shrink-0 self-stretch rounded-lg relative overflow-hidden',
              loading ? 'skeleton' : 'flex-center bg-white/8',
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
                    sizes="96px"
                    className="object-contain p-2.5"
                  />
                ) : (
                  <Megaphone className="h-10 w-10 text-white/90" strokeWidth={1.6} />
                )
              ) : (
                <Medal className="drop-shadow-xl drop-shadow-black/30" height={84} type={type} />
              ))}
            {locked && (
              <span className="flex-center absolute inset-0 rounded-lg bg-black/45 backdrop-blur-[1px]">
                <Lock className="text-white/90" size={26} strokeWidth={2.4} />
              </span>
            )}
          </div>

          {/* Right column — 4 rows */}
          <div className="flex flex-1 min-w-0 flex-col gap-1.5">
            {/* Row 1: Name */}
            <SkeletonSuspense
              loading={loading}
              skeleton={<Skeleton variant="line" textSize="sm" className="w-full max-w-40" />}
            >
              <h5 className="line-clamp-1 text-sm font-bold leading-tight text-white">{name}</h5>
            </SkeletonSuspense>

            {/* Row 2: Date (full) + Countdown */}
            <SkeletonSuspense
              loading={loading}
              skeleton={<Skeleton variant="rounded-rectangle" className="h-6 w-2/3" />}
            >
              <div className="flex items-center justify-between gap-1.5 text-[11px] leading-none min-w-0">
                <span className="inline-flex items-center gap-1 rounded-md bg-white/5 px-1.5 py-1 leading-none shrink-0">
                  <CalendarDays className="w-3 h-3 text-pink-secondary shrink-0" />
                  <span
                    suppressHydrationWarning
                    className="font-semibold text-white/90 tabular-nums leading-none"
                  >
                    {/* No year: this row is exactly full at 390px, and the
                        countdown beside it is the number that decides whether
                        to join. Tournaments run within days, so the year was
                        costing ~30px to say nothing. */}
                    {dayjs(startTime).format('DD/MM · HH:mm')}
                  </span>
                </span>
                <span
                  suppressHydrationWarning
                  className={twMerge(
                    // shrink-0, not min-w-0: the date chip beside it never
                    // shrinks, so this one absorbed every squeeze and silently
                    // ate the trailing "m" of any two-digit-hour countdown.
                    'inline-flex items-center gap-1 rounded-md px-1.5 py-1 leading-none text-white shrink-0',
                    isFinished
                      ? 'bg-white/5 text-white/65'
                      : isStarted
                        ? 'bg-teal/20'
                        : isStartingSoon
                          ? 'bg-electric-pink/30'
                          : 'bg-white/5'
                  )}
                >
                  <Clock
                    className={twMerge(
                      'w-3 h-3 shrink-0',
                      isStarted
                        ? 'text-teal'
                        : isStartingSoon
                          ? 'text-electric-pink'
                          : 'text-pink-secondary'
                    )}
                    strokeWidth={2.4}
                  />
                  <span className="font-bold tabular-nums leading-none truncate">
                    {timeChipText}
                  </span>
                </span>
              </div>
            </SkeletonSuspense>

            {/* Row 3: LC + Shards (rewards) */}
            <SkeletonSuspense
              loading={loading}
              skeleton={<Skeleton variant="rounded-rectangle" className="h-7" />}
            >
              <div className="flex items-center gap-2 rounded-lg bg-white/5 px-2 py-1.5">
                <div className="flex items-center gap-1.5 flex-1 min-w-0 leading-none">
                  <Sparkles className="w-3.5 h-3.5 text-pink-secondary shrink-0" />
                  <GoldenText
                    className="inline-flex items-center gap-1 text-sm font-extrabold tabular-nums leading-none truncate"
                    style={{ textShadow: '0 1px 4px rgba(248, 189, 62, 0.45)' }}
                  >
                    {prizePool != null ? formatCompact(prizePool) : ''}
                    <LcLabel size={14} />
                  </GoldenText>
                </div>
                <div className="h-3.5 w-px bg-white/15 shrink-0" />
                <div className="flex items-center gap-1 shrink-0 leading-none">
                  <ShardIcon
                    className="w-3.5 h-3.5 text-pink-secondary shrink-0"
                    strokeWidth={2.4}
                  />
                  <span className="text-xs font-bold text-white tabular-nums leading-none">
                    ×{totalShards}
                  </span>
                </div>
              </div>
            </SkeletonSuspense>

            {/* Row 4: Players + Tickets + Add/Join button */}
            <div className="flex items-center gap-1.5 min-w-0">
              <SkeletonSuspense
                loading={loading}
                skeleton={<Skeleton variant="rounded-rectangle" className="h-7 w-12" />}
              >
                <span className="inline-flex items-center gap-1 rounded-md bg-white/5 px-1.5 py-1.5 leading-none shrink-0 text-[11px]">
                  <Users className="w-3 h-3 text-pink-secondary shrink-0" />
                  <span className="font-semibold text-white/90 tabular-nums leading-none">
                    {participantsCount != null
                      ? `${formatCompact(participantsCount)} / ${teamSize == null ? '∞' : teamSize}`
                      : teamSize == null
                        ? '∞'
                        : teamSize}
                  </span>
                </span>
              </SkeletonSuspense>

              <SkeletonSuspense
                loading={loading}
                skeleton={<Skeleton variant="rounded-rectangle" className="h-7 w-12" />}
              >
                {participated && !isFinished ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-success/20 px-1.5 py-1.5 text-success font-bold text-[11px] leading-none shrink-0">
                    <Ticket className="w-3 h-3 shrink-0" />
                    <span className="tabular-nums leading-none">×{ticketCount}</span>
                  </span>
                ) : null}
              </SkeletonSuspense>

              <SkeletonSuspense
                loading={loading}
                skeleton={<Skeleton variant="rounded-rectangle" className="h-8 w-24 ml-auto" />}
              >
                {isModeration ? (
                  <span className="text-electric-purple border-electric-purple/30 bg-electric-purple/15 ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-[11px] font-extrabold uppercase leading-none tracking-[0.14em]">
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
                      'ml-auto shrink-0 py-2 px-3 rounded-full text-[11px] font-extrabold uppercase tracking-[0.14em] leading-none',
                      'shadow-[0_4px_14px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.18)]',
                      'transition-transform active:scale-95',
                      hasUnseenResult && 'animate-pulse'
                    )}
                  >
                    <span className="leading-none">{t('result')}</span>
                  </Button>
                ) : isFinished ? (
                  <button
                    type="button"
                    onClick={handleActionClick}
                    className="ml-auto shrink-0 inline-flex items-center justify-center px-3 py-2 rounded-full bg-white/5 border border-white/10 text-[11px] font-extrabold uppercase tracking-[0.14em] text-white/65 leading-none transition-transform active:scale-95 cursor-pointer hover:bg-white/8"
                  >
                    {t('ended')}
                  </button>
                ) : locked ? (
                  <span className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-[11px] font-extrabold uppercase leading-none tracking-[0.14em] text-white/55">
                    <Lock size={12} strokeWidth={2.6} />
                    {t('locked')}
                  </span>
                ) : isStarted ? (
                  <span className="text-teal border-teal/30 bg-teal/15 ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-[11px] font-extrabold uppercase leading-none tracking-[0.14em]">
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
                      'ml-auto shrink-0 py-2 px-4 rounded-full text-[11px] font-extrabold uppercase tracking-[0.14em] leading-none',
                      'shadow-[0_4px_14px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.28)]',
                      'transition-transform active:scale-95',
                      participated && 'bg-success',
                      !participated && isStartingSoon && 'animate-pulse'
                    )}
                  >
                    <span className="leading-none">{t(participated ? 'add' : 'join')}</span>
                  </Button>
                )}
              </SkeletonSuspense>
            </div>
          </div>
        </div>
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
      />

      <TournamentResultModal
        open={isResultModalOpen}
        onClose={handleResultClose}
        tournamentName={name ?? ''}
        tournamentType={type ?? 'bronze'}
        shardType={shardType}
        result={userResult}
        total={participantsCount}
      />
    </>
  );
}
