'use client';

import type { HTMLAttributes } from 'react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import dayjs from 'dayjs';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  ExternalLink,
  Lock,
  Megaphone,
  Plus,
  ShieldCheck,
  Sparkles,
  Ticket,
  Users,
  Zap,
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import {
  useGetTournamentByIdQuery,
  useJoinTournamentMutation,
  useMarkTournamentResultSeenMutation,
} from '@/api/tournaments.api';
import { useGetTicketsQuery } from '@/api/tickets.api';
import { useToast } from '@/hooks/useToast';
import { Medal } from '@/components/shared/icons/Medal';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { ShardZoomButton } from '@/components/pages/out-tabs/tabs-extra/tournament/ShardZoomButton';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { GoldenText } from '@/components/shared/typography/GoldenText';
import { Button } from '@/components/shared/buttons/Button';
import { QueryErrorState } from '@/components/shared/error/QueryErrorState';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useCountDown } from '@/hooks/useCountDown';
import { useUnlockedTiers } from '@/hooks/useUnlockedTiers';
import { GlobalConstants } from '@/constants/global.constants';
import type { TicketType } from '@/types/types/ticket.types';
import type { TournamentType } from '@/types/types/tournaments.types';
import { TournamentBetModal } from './TournamentBetModal';
import { TournamentResultModal } from './TournamentResultModal';
import { TournamentJackpotNote } from './TournamentJackpotNote';
import { TournamentSponsorBackground } from '@/components/pages/tabs/tournaments/TournamentSponsorBackground';
import { TournamentSponsorHeader } from '@/components/pages/tabs/tournaments/TournamentSponsorHeader';
import '@/styles/components/tournament-card.css';

interface TournamentDetailsProps extends HTMLAttributes<HTMLDivElement> {
  id: string;
}

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

const TIER_CLASS: Record<TournamentType, string> = {
  bronze: 'tournament-card-tier-bronze',
  silver: 'tournament-card-tier-silver',
  gold: 'tournament-card-tier-gold',
  platinum: 'tournament-card-tier-platinum',
  diamond: 'tournament-card-tier-diamond',
};

export function TournamentInfo({ id, className, ...rest }: TournamentDetailsProps) {
  const { data, isLoading, isError, refetch } = useGetTournamentByIdQuery(id);
  const t = useAppTranslations();
  const toast = useToast();
  const { isTierUnlocked } = useUnlockedTiers();
  const { data: tickets } = useGetTicketsQuery();
  const [joinTournament] = useJoinTournamentMutation();
  const [markResultSeen] = useMarkTournamentResultSeenMutation();
  const [isBetModalOpen, setIsBetModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [resultDismissed, setResultDismissed] = useState(false);

  const availableTickets = tickets?.find(item => item.ticketType === data?.type)?.count ?? 0;

  const isFinished = data?.status === 'finished';
  const sponsor = data?.sponsor;
  // A sponsored tournament still under review (reachable by direct link) — not
  // joinable until approved (DOCS §11.8); mirrors the list-card guard.
  const isModeration = data?.status === 'moderation';
  const tierLocked = data ? !isTierUnlocked(data.type as TicketType) : false;
  const { leftTimeText, days, hours, minutes } = useCountDown(
    isFinished ? undefined : data?.startTime
  );
  const isStartingSoon = !isFinished && days === 0 && hours === 0 && minutes < 60;
  const topShards = GlobalConstants.tournamentShardRewards.first;
  const participated = !!data?.participated;
  const ticketCount = data?.participatedTicketsCount ?? 0;
  const userResult = data?.userResult;
  const hasUnseenResult = isFinished && !!userResult && !data?.resultSeen && !resultDismissed;
  const shouldShowResultModal = isFinished && !data?.resultSeen && !resultDismissed;

  // Auto-open result modal once after data loads
  useEffect(() => {
    if (shouldShowResultModal && !isResultModalOpen) {
      setIsResultModalOpen(true);
    }
  }, [shouldShowResultModal, isResultModalOpen]);

  const handleOpenBetModal = () => {
    if (tierLocked || isModeration) return;
    setIsBetModalOpen(true);
  };
  const handleCloseBetModal = () => setIsBetModalOpen(false);
  const handleJoin = async (ticketsCount: number) => {
    try {
      await joinTournament({ tournamentId: id, ticketsCount }).unwrap();
    } catch {
      toast.error(t('action failed'));
    }
  };
  const handleCloseResultModal = () => {
    setIsResultModalOpen(false);
    setResultDismissed(true);
    if (id) markResultSeen({ tournamentId: id });
  };

  const timeChipText = data?.startTime
    ? isFinished
      ? formatEndedAgo(data.startTime, t)
      : leftTimeText || t('soon')
    : t('soon');

  // A failed detail load must surface an error+retry, not a blank card with an
  // empty name / "soon" countdown (the silent-empty anti-pattern).
  if (isError && !data) {
    return <QueryErrorState className="mt-10" onRetry={() => refetch()} />;
  }

  return (
    <div className={twMerge('max-w-full overflow-hidden', className)}>
      <div
        {...rest}
        className={twMerge(
          'w-full rounded-2xl flex flex-col p-3',
          isFinished
            ? 'tournament-card-finished'
            : sponsor
              ? 'tournament-card-sponsored'
              : data?.type
                ? TIER_CLASS[data.type]
                : 'bg-background-overlay'
        )}
      >
        {/* Background + header for sponsored tournaments (mirrors TournamentCard) */}
        {sponsor && <TournamentSponsorBackground sponsor={sponsor} />}
        {sponsor && <TournamentSponsorHeader sponsor={sponsor} />}

        <div className="relative z-10 flex items-stretch gap-3">
          {/* Medal stage — left (sponsor logo replaces the tier medal) */}
          <div
            className={twMerge(
              'flex-center bg-white/8 rounded-lg w-24 shrink-0 self-stretch relative overflow-hidden',
              isFinished && 'opacity-80'
            )}
          >
            {sponsor ? (
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
              <Medal
                className="drop-shadow-xl drop-shadow-black/30"
                height={84}
                type={data?.type}
                loading={isLoading}
              />
            )}
          </div>

          {/* Right column — 4 rows (mirrors TournamentCard) */}
          <div className="flex flex-1 min-w-0 flex-col gap-1.5">
            {/* Row 1: Name */}
            <SkeletonSuspense
              loading={isLoading}
              skeleton={<Skeleton variant="line" textSize="sm" className="w-full max-w-40" />}
            >
              <h5 className="text-sm font-bold text-white leading-tight line-clamp-1">
                {data?.name}
              </h5>
            </SkeletonSuspense>

            {/* Row 2: Date (full) + Countdown */}
            <SkeletonSuspense
              loading={isLoading}
              skeleton={<Skeleton variant="rounded-rectangle" className="h-6 w-2/3" />}
            >
              <div className="flex items-center justify-between gap-1.5 text-[11px] leading-none min-w-0">
                <span className="inline-flex items-center gap-1 rounded-md bg-white/5 px-1.5 py-1 leading-none shrink-0">
                  <CalendarDays className="w-3 h-3 text-pink-secondary shrink-0" />
                  <span className="font-semibold text-white/90 tabular-nums leading-none">
                    {data?.startTime ? dayjs(data.startTime).format('DD/MM/YYYY · HH:mm') : ''}
                  </span>
                </span>
                <span
                  className={twMerge(
                    'inline-flex items-center gap-1 rounded-md px-1.5 py-1 leading-none text-white min-w-0',
                    isFinished
                      ? 'bg-white/5 text-white/65'
                      : isStartingSoon
                        ? 'bg-electric-pink/30'
                        : 'bg-white/5'
                  )}
                >
                  <Clock
                    className={twMerge(
                      'w-3 h-3 shrink-0',
                      isStartingSoon ? 'text-electric-pink' : 'text-pink-secondary'
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
              loading={isLoading}
              skeleton={<Skeleton variant="rounded-rectangle" className="h-7" />}
            >
              <div className="flex items-center gap-2 rounded-lg bg-white/5 px-2 py-1.5">
                <div className="flex items-center gap-1.5 flex-1 min-w-0 leading-none">
                  <Sparkles className="w-3.5 h-3.5 text-pink-secondary shrink-0" />
                  <GoldenText
                    className="inline-flex items-center gap-1 text-sm font-extrabold tabular-nums leading-none truncate"
                    style={{ textShadow: '0 1px 4px rgba(248, 189, 62, 0.45)' }}
                  >
                    {data?.prizePool?.toLocaleString()}
                    <LcLabel size={14} />
                  </GoldenText>
                </div>
                <div className="h-3.5 w-px bg-white/15 shrink-0" />
                <div className="flex items-center gap-1 shrink-0 leading-none">
                  {data?.shardType && (
                    <ShardZoomButton type={data.shardType} tier={data.type} size={16} />
                  )}
                  <span className="text-xs font-bold text-white tabular-nums leading-none">
                    ×{topShards}
                  </span>
                </div>
              </div>
            </SkeletonSuspense>

            {!isLoading && <TournamentJackpotNote />}

            {/* Row 4: Players + Tickets + Add/Join/View Result/Ended */}
            <div className="flex items-center gap-1.5 min-w-0">
              <SkeletonSuspense
                loading={isLoading}
                skeleton={<Skeleton variant="rounded-rectangle" className="h-7 w-12" />}
              >
                <span className="inline-flex items-center gap-1 rounded-md bg-white/5 px-1.5 py-1.5 leading-none shrink-0 text-[11px]">
                  <Users className="w-3 h-3 text-pink-secondary shrink-0" />
                  <span className="font-semibold text-white/90 tabular-nums leading-none">
                    {data?.teamSize ?? ''}
                  </span>
                </span>
              </SkeletonSuspense>

              <SkeletonSuspense
                loading={isLoading}
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
                loading={isLoading}
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
                    onClick={() => setIsResultModalOpen(true)}
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
                    onClick={() => setIsResultModalOpen(true)}
                    className="ml-auto shrink-0 inline-flex items-center justify-center px-3 py-2 rounded-full bg-white/5 border border-white/10 text-[11px] font-extrabold uppercase tracking-[0.14em] text-white/65 leading-none transition-transform active:scale-95 cursor-pointer hover:bg-white/8"
                  >
                    {t('ended')}
                  </button>
                ) : (
                  <Button
                    disabled={isLoading || tierLocked}
                    onClick={handleOpenBetModal}
                    icon={
                      tierLocked ? (
                        <Lock strokeWidth={2.6} />
                      ) : participated ? (
                        <Plus strokeWidth={3} />
                      ) : isStartingSoon ? (
                        <Zap strokeWidth={2.6} />
                      ) : (
                        <Sparkles strokeWidth={2.4} />
                      )
                    }
                    iconSize={13}
                    className={twMerge(
                      'ml-auto shrink-0 py-2 px-4 rounded-full text-[11px] font-extrabold uppercase tracking-[0.14em] leading-none overflow-hidden',
                      'shadow-[0_4px_14px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.28)]',
                      'transition-transform active:scale-95',
                      participated && 'bg-success',
                      !participated && isStartingSoon && 'animate-pulse'
                    )}
                  >
                    <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
                      <span className="absolute -top-1/2 -left-1/2 h-[200%] w-[55%] bg-gradient-to-r from-transparent via-white/40 to-transparent animate-task-shine" />
                    </span>
                    <span className="leading-none relative">
                      {t(tierLocked ? 'locked' : participated ? 'add' : 'join')}
                    </span>
                  </Button>
                )}
              </SkeletonSuspense>
            </div>
          </div>
        </div>
      </div>

      {!isLoading && !isModeration && sponsor?.url && (
        <a
          href={sponsor.url}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-electric-purple/15 text-electric-purple mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition active:scale-[0.99]"
        >
          <ExternalLink className="h-4 w-4" />
          {t('visit sponsor', { name: sponsor.name })}
        </a>
      )}

      <TournamentBetModal
        open={isBetModalOpen}
        onClose={handleCloseBetModal}
        onConfirm={handleJoin}
        tournamentName={data?.name ?? ''}
        tournamentType={data?.type ?? 'bronze'}
        shardType={data?.shardType}
        availableTickets={availableTickets}
        participated={data?.participated}
        participatedTicketsCount={data?.participatedTicketsCount}
      />

      <TournamentResultModal
        open={isResultModalOpen}
        onClose={handleCloseResultModal}
        tournamentName={data?.name ?? ''}
        tournamentType={data?.type ?? 'bronze'}
        shardType={data?.shardType}
        result={userResult}
      />
    </div>
  );
}
