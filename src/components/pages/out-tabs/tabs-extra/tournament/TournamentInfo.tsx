'use client';

import type { HTMLAttributes } from 'react';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Lock,
  Plus,
  Sparkles,
  Ticket,
  Users,
  Zap,
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useGetTournamentByIdQuery } from '@/api/tournaments.api';
import { Medal } from '@/components/shared/icons/Medal';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { ShardZoomButton } from '@/components/pages/out-tabs/tabs-extra/tournament/ShardZoomButton';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { GoldenText } from '@/components/shared/typography/GoldenText';
import { Button } from '@/components/shared/buttons/Button';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useCountDown } from '@/hooks/useCountDown';
import { useUnlockedTiers } from '@/hooks/useUnlockedTiers';
import { GlobalConstants } from '@/constants/global.constants';
import type { TicketType } from '@/types/types/ticket.types';
import type { TournamentType } from '@/types/types/tournaments.types';
import { TournamentBetModal } from './TournamentBetModal';
import { TournamentResultModal } from './TournamentResultModal';
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
  const { data, isLoading } = useGetTournamentByIdQuery(id);
  const t = useAppTranslations();
  const { isTierUnlocked } = useUnlockedTiers();
  const [isBetModalOpen, setIsBetModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [resultDismissed, setResultDismissed] = useState(false);

  // TODO: replace with user ticket balance API for the given ticket type
  const availableTickets = 15;

  const isFinished = data?.status === 'finished';
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
    if (tierLocked) return;
    setIsBetModalOpen(true);
  };
  const handleCloseBetModal = () => setIsBetModalOpen(false);
  const handleCloseResultModal = () => {
    setIsResultModalOpen(false);
    setResultDismissed(true);
  };

  const timeChipText = data?.startTime
    ? isFinished
      ? formatEndedAgo(data.startTime, t)
      : leftTimeText || t('soon')
    : t('soon');

  return (
    <div className={twMerge('max-w-full overflow-hidden', className)}>
      <div
        {...rest}
        className={twMerge(
          'w-full rounded-2xl flex items-stretch gap-3 p-3',
          isFinished
            ? 'tournament-card-finished'
            : data?.type
              ? TIER_CLASS[data.type]
              : 'bg-background-overlay'
        )}
      >
        {/* Medal stage — left */}
        <div
          className={twMerge(
            'flex-center bg-white/8 rounded-lg w-24 shrink-0 self-stretch',
            isFinished && 'opacity-80'
          )}
        >
          <Medal
            className="drop-shadow-xl drop-shadow-black/30"
            height={84}
            type={data?.type}
            loading={isLoading}
          />
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
                <span className="font-bold tabular-nums leading-none truncate">{timeChipText}</span>
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
              {isFinished && userResult ? (
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

      <TournamentBetModal
        open={isBetModalOpen}
        onClose={handleCloseBetModal}
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
