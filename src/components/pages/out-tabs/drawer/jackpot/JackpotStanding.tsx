'use client';

import { Swords, Ticket } from 'lucide-react';
import { useGetTournamentsQuery } from '@/api/tournaments.api';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { useAppTranslations } from '@/hooks/useAppTranslations';

interface JackpotStandingProps {
  activeTournaments?: number;
  loading?: boolean;
}

/**
 * Where the player stands in the draw — promoted to the second thing on the
 * page. "You're in 3 tournaments" says nothing on its own; "3 of 9 open ones"
 * is a position, and the catalog the count comes from is already cached from
 * the tournaments tab.
 */
export function JackpotStanding({ activeTournaments, loading }: JackpotStandingProps) {
  const t = useAppTranslations();
  const { data: tournaments } = useGetTournamentsQuery();

  const count = activeTournaments ?? 0;
  const inDraw = count > 0;
  // Open = joinable and not yet finished. `moderation` is a sponsored
  // tournament awaiting review — not in the catalog, so not in the draw.
  const openCount = tournaments?.filter(item => item.status === 'upcoming').length;

  const headline =
    inDraw && openCount
      ? t('youre in {n} of {total} open tournaments', { n: count, total: openCount })
      : inDraw
        ? t('youre in {n} active tournaments', { n: count })
        : t('not in the draw yet');

  return (
    <SkeletonSuspense
      loading={loading}
      skeleton={<Skeleton variant="rounded-rectangle" className="h-14 w-full rounded-2xl" />}
    >
      <div className="flex items-center gap-3 border-b border-white/5 pb-4">
        <span className="bg-electric-pink/15 text-electric-pink flex-center h-10 w-10 flex-shrink-0 rounded-xl">
          {inDraw ? <Swords size={18} /> : <Ticket size={18} />}
        </span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-[15px] font-bold text-white">{headline}</span>
          <span className="text-white-secondary text-[12px] font-medium leading-snug">
            {inDraw ? t('any could be the charged one') : t('join a tournament to enter the draw')}
          </span>
        </div>
      </div>
    </SkeletonSuspense>
  );
}
