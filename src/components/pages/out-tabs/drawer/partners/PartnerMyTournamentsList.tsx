'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { History, Trophy } from 'lucide-react';
import { EmptyDataInfo } from '@/components/shared/EmptyDataInfo';
import { Pagination } from '@/components/shared/Pagination';
import { PartnerReleaseButton } from './PartnerReleaseButton';
import {
  PartnerMyTournamentCard,
  type PartnerMyTournamentCardProps,
} from './PartnerMyTournamentCard';
import { appConfig } from '@/config/app.config';
import { routes } from '@/constants/routes';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { PersonalTournament } from '@/types/interfaces/tournaments.interfaces';
import { staggerMs } from '@/utils/global/animation.utils';

export interface PartnerMyTournamentsListProps {
  tournaments?: PersonalTournament[];
  loading?: boolean;
  /** Tailors the empty state — `history` has nothing to "create". */
  emptyKind?: 'active' | 'history';
}

const SKELETON_COUNT = 3;
const PAGE_SIZE = appConfig.partners.listPageSize;

export function PartnerMyTournamentsList({
  tournaments,
  loading,
  emptyKind = 'active',
}: PartnerMyTournamentsListProps) {
  const t = useAppTranslations();
  const [page, setPage] = useState(1);
  const listRef = useRef<HTMLDivElement>(null);

  const data = tournaments ?? [];
  const pageCount = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
  // Clamp on render so a shrinking list never strands the view on a dead page.
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * PAGE_SIZE;

  const items: PartnerMyTournamentCardProps[] = loading
    ? (new Array(SKELETON_COUNT).fill({}) as PartnerMyTournamentCardProps[])
    : data.slice(start, start + PAGE_SIZE);

  if (!loading && data.length === 0) {
    return emptyKind === 'history' ? (
      <EmptyDataInfo
        icon={<History />}
        title={t('no finished tournaments')}
        description={t('no finished tournaments description')}
      />
    ) : (
      <EmptyDataInfo
        icon={<Trophy />}
        title={t('no tournaments title')}
        description={t('no tournaments description')}
        extra={<PartnerReleaseButton variant="primary" className="mt-5" />}
      />
    );
  }

  const handlePageChange = (next: number) => {
    setPage(next);
    listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div ref={listRef} className="flex scroll-mt-3 flex-col gap-4">
      <div key={currentPage} className="flex flex-col gap-2.5">
        {items.map((item, index) => {
          const card = (
            <PartnerMyTournamentCard
              loading={loading}
              {...item}
              className="animate-slide-in-bottom"
              style={{ animationDelay: `${staggerMs(index, 100)}ms` }}
            />
          );

          // Tap → the advertiser-facing detail (with the moderation approve action).
          return !loading && item.id ? (
            <Link
              key={item.id}
              href={routes.partners.getById(item.id)}
              className="block transition active:scale-[0.99]"
            >
              {card}
            </Link>
          ) : (
            <div key={item.id ?? index}>{card}</div>
          );
        })}
      </div>

      {!loading && (
        <Pagination page={currentPage} pageCount={pageCount} onPageChange={handlePageChange} />
      )}
    </div>
  );
}
