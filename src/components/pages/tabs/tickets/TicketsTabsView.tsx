'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  useClaimEngineMutation,
  useClaimEnginesForTierMutation,
  useCompleteEngineCycleMutation,
} from '@/api/engines.api';
import { useGetInventoryQuery } from '@/api/inventory.api';
import { useGetMeQuery } from '@/api/me.api';
import { useGetTicketsQuery } from '@/api/tickets.api';
import { TicketClaimedModal } from '@/components/pages/tabs/tickets/TicketClaimedModal';
import { TicketsTierSummary } from '@/components/pages/tabs/tickets/TicketsTierSummary';
import {
  PARTNERS_TAB_KEY,
  TICKETS_TIER_ORDER,
  type TicketsTabKey,
  type TicketsTierTab,
} from '@/components/pages/tabs/tickets/TicketsTierTabs';
import { TierUnlockedContent } from '@/components/pages/tabs/tickets/TierUnlockedContent';
import { TierLockedContent } from '@/components/pages/tabs/tickets/TierLockedContent';
import { PartnersComingSoon } from '@/components/pages/tabs/home/PartnersComingSoon';
import { useUnlockedTiers } from '@/hooks/useUnlockedTiers';
import { TicketsEnum } from '@/types/enums/ticket.enums';
import { findActiveBooster, findEquippedChip } from '@/utils/global/inventory.utils';
import { effectiveCycleSeconds, engineElapsedSeconds } from '@/utils/global/ticket-engine.utils';
import type { Ticket, TicketType } from '@/types/types/ticket.types';

export function TicketsTabsView() {
  const { data: tickets, isFetching } = useGetTicketsQuery();
  const { data: inventory } = useGetInventoryQuery();
  const { data: me } = useGetMeQuery();
  const isLp = me?.isLuckyPlayer ?? false;
  const isVip = me?.isVIP ?? false;
  const [claimEngine] = useClaimEngineMutation();
  const [claimEnginesForTier] = useClaimEnginesForTierMutation();
  const [completeEngineCycle] = useCompleteEngineCycleMutation();
  const { isTierUnlocked } = useUnlockedTiers();

  const [activeTab, setActiveTab] = useState<TicketsTabKey>(TicketsEnum.BRONZE);
  const [elapsedByEngine, setElapsedByEngine] = useState<Record<string, number>>({});
  const [claimedModal, setClaimedModal] = useState<{
    open: boolean;
    tier: TicketType;
    count: number;
  }>({ open: false, tier: TicketsEnum.BRONZE, count: 0 });

  const enginesByTier = useMemo(() => {
    const next: Record<TicketType, Ticket['engines']> = {
      bronze: [],
      silver: [],
      gold: [],
      platinum: [],
      diamond: [],
    };
    if (!tickets) return next;
    for (const ticket of tickets) {
      next[ticket.ticketType] = ticket.engines ?? [];
    }
    return next;
  }, [tickets]);

  useEffect(() => {
    const allEngines = TICKETS_TIER_ORDER.flatMap(tier => enginesByTier[tier] ?? []);
    if (!allEngines.length) return;

    const tick = () => {
      setElapsedByEngine(prev => {
        let changed = false;
        const next = { ...prev };
        for (const engine of allEngines) {
          const speedChip = findEquippedChip(inventory?.chips, engine.id, 'speed');
          const speedBooster = findActiveBooster(inventory?.boosters, engine.id, 'speed');
          const cycle = effectiveCycleSeconds(engine, {
            speedChip,
            speedBooster,
            isLuckyPlayer: isLp,
            isVip,
          });
          const elapsed = engine.pendingCount > 0 ? cycle : engineElapsedSeconds(engine);
          if (next[engine.id] !== elapsed) {
            next[engine.id] = elapsed;
            changed = true;
          }
          if (engine.pendingCount === 0 && elapsed >= cycle) {
            completeEngineCycle({ engineId: engine.id });
          }
        }
        return changed ? next : prev;
      });
    };

    tick();
    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, [enginesByTier, inventory, completeEngineCycle]);

  const ticketByTier = (tier: TicketType): Ticket | undefined =>
    tickets?.find(item => item.ticketType === tier);

  const tabs: TicketsTierTab[] = [
    ...TICKETS_TIER_ORDER.map<TicketsTierTab>(tier => ({
      key: tier,
      count: (enginesByTier[tier] ?? []).reduce(
        (sum, engine) => sum + (engine.pendingCount > 0 ? 1 : 0),
        0
      ),
      locked: !isTierUnlocked(tier),
    })),
    { key: PARTNERS_TAB_KEY, count: 0 },
  ];

  const handleClaimAllForTier = async (tier: TicketType) => {
    const engines = enginesByTier[tier] ?? [];
    const total = engines.reduce((sum, engine) => sum + (engine.pendingCount || 0), 0);
    if (total === 0) return;
    for (const engine of engines) {
      if (engine.pendingCount > 0) {
        setElapsedByEngine(prev => ({ ...prev, [engine.id]: 0 }));
      }
    }
    setClaimedModal({ open: true, tier, count: total });
    await claimEnginesForTier({ tier });
  };

  const handleClaimEngine = async (tier: TicketType, engineId: string) => {
    const engine = (enginesByTier[tier] ?? []).find(item => item.id === engineId);
    if (!engine || engine.pendingCount <= 0) return;
    const claimed = engine.pendingCount;
    setElapsedByEngine(prev => ({ ...prev, [engineId]: 0 }));
    setClaimedModal({ open: true, tier, count: claimed });
    await claimEngine({ engineId });
  };

  const renderTabContent = () => {
    if (activeTab === PARTNERS_TAB_KEY) {
      return <PartnersComingSoon />;
    }
    const ticket = ticketByTier(activeTab);
    const loading = isFetching && !ticket;
    if (loading || !ticket) {
      return (
        <div className="flex flex-col gap-3">
          <div className="card-outlined bg-purple-gradient rounded-2xl p-4 h-24 animate-pulse" />
          <div className="card-outlined bg-purple-gradient rounded-2xl p-4 h-24 animate-pulse" />
        </div>
      );
    }
    if (!isTierUnlocked(activeTab)) {
      return <TierLockedContent ticket={ticket} />;
    }
    return (
      <TierUnlockedContent
        ticket={ticket}
        tier={activeTab}
        engines={enginesByTier[activeTab] ?? []}
        elapsedByEngine={elapsedByEngine}
        onClaimAll={() => handleClaimAllForTier(activeTab)}
        onClaimEngine={engineId => handleClaimEngine(activeTab, engineId)}
      />
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <TicketsTierSummary
        tabs={tabs}
        loading={isFetching}
        active={activeTab}
        onChange={setActiveTab}
      />

      <div key={activeTab} className="animate-slide-in-bottom">
        {renderTabContent()}
      </div>

      <TicketClaimedModal
        open={claimedModal.open}
        tier={claimedModal.tier}
        count={claimedModal.count}
        onClose={() => setClaimedModal(prev => ({ ...prev, open: false }))}
      />
    </div>
  );
}
