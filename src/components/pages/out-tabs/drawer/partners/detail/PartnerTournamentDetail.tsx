'use client';

import dayjs from 'dayjs';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { CalendarClock, Coins, ExternalLink, ShieldCheck, Trophy, Users } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import {
  useApproveSponsoredTournamentMutation,
  useGetTournamentsQuery,
} from '@/api/tournaments.api';
import { Button } from '@/components/shared/buttons/Button';
import { EmptyDataInfo } from '@/components/shared/EmptyDataInfo';
import { QueryErrorState } from '@/components/shared/error/QueryErrorState';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { Medal } from '@/components/shared/icons/Medal';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { PartnerStatCard } from '../PartnerStatCard';
import { routes } from '@/constants/routes';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useToast } from '@/hooks/useToast';
import { formatCompact } from '@/utils/global/number.utils';
import { urlHost } from '@/utils/global/partners.utils';
import type { TournamentStatus } from '@/types/types/tournaments.types';
import type { MessageIds } from '@/types/types/i18n.types';

export interface PartnerTournamentDetailProps {
  id: string;
}

const tileIcon = 'h-4 w-4';

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

/** Advertiser-facing detail for one created sponsored tournament (DOCS §11.8). */
export function PartnerTournamentDetail({ id }: PartnerTournamentDetailProps) {
  const t = useAppTranslations();
  const router = useRouter();
  const toast = useToast();
  const { data, isLoading, isError, refetch } = useGetTournamentsQuery();
  const [approve, { isLoading: approving }] = useApproveSponsoredTournamentMutation();

  // The advertiser's own tournaments — found by id among createdByMe.
  const tournament = data?.find(tour => tour.id === id && tour.sponsor?.createdByMe);

  if (isError) return <QueryErrorState onRetry={() => refetch()} />;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 pb-8">
        <Skeleton variant="rounded-rectangle" className="h-28" />
        <div className="grid grid-cols-2 gap-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rounded-rectangle" className="h-20" />
          ))}
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <EmptyDataInfo
        icon={<Trophy />}
        title={t('tournament not found')}
        description={t('tournament not found description')}
        extra={
          <Button className="mt-5" onClick={() => router.push(routes.partners.index)}>
            {t('my tournaments')}
          </Button>
        }
      />
    );
  }

  const { name, type, status, prizePool, teamSize, startTime, sponsor } = tournament;
  const isModeration = status === 'moderation';

  const onApprove = async () => {
    try {
      await approve({ tournamentId: id }).unwrap();
      toast.success(t('tournament approved'));
    } catch {
      toast.error(t('something went wrong'));
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-8">
      {/* Hero */}
      <div className="bg-background-overlay border-electric-purple/30 flex flex-col gap-3 rounded-2xl border p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-electric-purple inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider">
            <ShieldCheck className="h-3.5 w-3.5" />
            {t('created by you')}
          </span>
          <span
            className={twMerge(
              'inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase leading-none tracking-wider',
              statusStyle[status]
            )}
          >
            {t(statusKey[status])}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex-center bg-white/8 relative h-14 w-14 shrink-0 overflow-hidden rounded-xl">
            {sponsor?.logoUrl ? (
              <Image
                src={sponsor.logoUrl}
                alt={sponsor.name}
                fill
                unoptimized
                sizes="56px"
                className="object-contain p-1.5"
              />
            ) : (
              <Medal type={type} height={48} />
            )}
          </span>
          <div className="min-w-0">
            <h1 className="text-xl font-extrabold leading-tight text-white">{name}</h1>
            {sponsor?.name && (
              <p className="text-white-secondary truncate text-sm">{sponsor.name}</p>
            )}
          </div>
        </div>

        {sponsor?.url && (
          <a
            href={sponsor.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-pink-secondary inline-flex w-fit max-w-full items-center gap-1.5 text-xs font-semibold"
          >
            <span className="truncate">{urlHost(sponsor.url)}</span>
            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
          </a>
        )}
      </div>

      {/* Moderation → approve */}
      {isModeration && (
        <div className="bg-electric-purple/10 flex flex-col gap-3 rounded-2xl px-4 py-3">
          <div className="flex items-start gap-2">
            <ShieldCheck className="text-electric-purple mt-0.5 h-4 w-4 shrink-0" />
            <span className="text-white-secondary/80 text-xs leading-snug">
              {t('moderation notice')}
            </span>
          </div>
          <Button
            onClick={onApprove}
            loading={approving}
            icon={<ShieldCheck />}
            iconSize={16}
            className="w-full"
          >
            {t('approve')}
          </Button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2.5">
        <PartnerStatCard
          icon={<Coins className={tileIcon} />}
          label={t('prize pool')}
          value={
            <span className="inline-flex items-center gap-1">
              {formatCompact(prizePool)}
              <LcLabel size={14} />
            </span>
          }
        />
        <PartnerStatCard
          icon={<Users className={tileIcon} />}
          label={t('team size')}
          value={teamSize}
        />
        <PartnerStatCard
          icon={<Trophy className={tileIcon} />}
          label={t('tier')}
          value={<span className="capitalize">{t(type)}</span>}
        />
        <PartnerStatCard
          icon={<CalendarClock className={tileIcon} />}
          label={t('starts')}
          value={<span className="text-sm">{dayjs(startTime).format('DD MMM · HH:mm')}</span>}
        />
      </div>
    </div>
  );
}
