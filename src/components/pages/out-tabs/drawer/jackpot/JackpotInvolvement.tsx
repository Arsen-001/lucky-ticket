'use client';

import { Swords, Ticket } from 'lucide-react';
import { Link } from '@/components/shared/links/Link';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { routes } from '@/constants/routes';

interface JackpotInvolvementProps {
  activeTournaments?: number;
  loading?: boolean;
}

export function JackpotInvolvement({ activeTournaments, loading }: JackpotInvolvementProps) {
  const t = useAppTranslations();
  const count = activeTournaments ?? 0;
  const inDraw = count > 0;

  return (
    <SkeletonSuspense
      loading={loading}
      skeleton={<Skeleton variant="rounded-rectangle" className="h-[68px] w-full rounded-2xl" />}
    >
      <div className="card-outlined relative flex items-center gap-3 overflow-hidden rounded-2xl px-4 py-3.5">
        <span className="bg-electric-pink/15 text-electric-pink flex-center h-11 w-11 flex-shrink-0 rounded-xl">
          {inDraw ? <Swords size={20} /> : <Ticket size={20} />}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-sm font-bold text-white">
            {inDraw ? t('youre in {n} active tournaments', { n: count }) : t('not in the draw yet')}
          </span>
          <span className="text-white-secondary text-[12px] font-medium leading-snug">
            {inDraw ? t('any could be the charged one') : t('join a tournament to enter the draw')}
          </span>
        </div>
        <Link
          href={routes.tournaments.index}
          className="bg-pink-gradient flex-shrink-0 rounded-lg px-4 py-2 text-xs font-bold text-white transition-transform active:scale-95"
        >
          {t('play')}
        </Link>
      </div>
    </SkeletonSuspense>
  );
}
