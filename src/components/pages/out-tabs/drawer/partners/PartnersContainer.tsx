'use client';

import { useState } from 'react';
import { History, Radio, ShieldCheck, Trophy, Wallet } from 'lucide-react';
import { useGetPartnerStatsQuery } from '@/api/partners.api';
import { useGetTournamentsQuery } from '@/api/tournaments.api';
import { QueryErrorState } from '@/components/shared/error/QueryErrorState';
import { SegmentToggle } from '@/components/shared/form-elements/SegmentToggle';
import { TonAmount } from '@/components/shared/icons/TonAmount';
import { PartnerStatCard } from './PartnerStatCard';
import { PartnerReleaseButton } from './PartnerReleaseButton';
import { PartnersComingSoonBanner } from './PartnersComingSoonBanner';
import { PartnerMyTournamentsList } from './PartnerMyTournamentsList';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { usePartnersEnabled } from '@/hooks/usePartnersEnabled';

type CabinetView = 'active' | 'history';

export function PartnersContainer() {
  const t = useAppTranslations();
  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
    refetch: refetchStats,
  } = useGetPartnerStatsQuery();
  const {
    data: allTournaments,
    isLoading: toursLoading,
    isError: toursError,
    refetch: refetchTours,
  } = useGetTournamentsQuery();

  const [view, setView] = useState<CabinetView>('active');

  // The advertiser's own tournaments — the ones they created (DOCS §11.8).
  const myTournaments = (allTournaments ?? []).filter(tour => tour.sponsor?.createdByMe);

  // Active = still ongoing (upcoming + in review); History = finished runs.
  const activeList = myTournaments.filter(tour => tour.status !== 'finished');
  const historyList = myTournaments.filter(tour => tour.status === 'finished');
  const visible = view === 'active' ? activeList : historyList;

  const portalEnabled = usePartnersEnabled();

  if (statsError || toursError) {
    return (
      <QueryErrorState
        onRetry={() => {
          refetchStats();
          refetchTours();
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5 pb-8">
      {!portalEnabled && <PartnersComingSoonBanner />}

      <div className="grid grid-cols-2 gap-2.5">
        <PartnerStatCard
          highlighted
          icon={<Wallet className="h-4 w-4" />}
          label={t('balance')}
          value={<TonAmount value={stats?.balanceTon ?? 0} size={16} />}
          loading={statsLoading}
        />
        <PartnerStatCard
          icon={<Trophy className="h-4 w-4" />}
          label={t('created')}
          value={stats?.created ?? 0}
          loading={statsLoading}
        />
        <PartnerStatCard
          icon={<Radio className="h-4 w-4" />}
          label={t('active')}
          value={stats?.active ?? 0}
          loading={statsLoading}
        />
        <PartnerStatCard
          icon={<ShieldCheck className="h-4 w-4" />}
          label={t('status moderation')}
          value={stats?.inReview ?? 0}
          loading={statsLoading}
        />
      </div>

      <PartnerReleaseButton className="w-full" />

      <section className="flex flex-col gap-2.5">
        <h2 className="text-base font-extrabold text-white">{t('my tournaments')}</h2>

        <SegmentToggle<CabinetView>
          value={view}
          onChange={setView}
          options={[
            { value: 'active', label: t('status active'), icon: <Radio className="h-4 w-4" /> },
            { value: 'history', label: t('history'), icon: <History className="h-4 w-4" /> },
          ]}
        />

        {/* key={view} resets pagination when switching tabs */}
        <PartnerMyTournamentsList
          key={view}
          tournaments={visible}
          loading={toursLoading}
          emptyKind={view}
        />
      </section>
    </div>
  );
}
