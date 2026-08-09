'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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
} from '@/components/pages/tabs/tickets/tickets-tabs.constants';
import { TierUnlockedContent } from '@/components/pages/tabs/tickets/TierUnlockedContent';
import { TierLockedContent } from '@/components/pages/tabs/tickets/TierLockedContent';
import { PartnersComingSoon } from '@/components/pages/tabs/home/PartnersComingSoon';
import { useUnlockedTiers } from '@/hooks/useUnlockedTiers';
import { useToast } from '@/hooks/useToast';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useEngineSpeedAvatarBoostPct } from '@/hooks/useEngineSpeedAvatarBoostPct';
import { useTestBadgeSpeedBoostPct } from '@/hooks/useTestBadgeSpeedBoostPct';
import { useEngineConfig } from '@/hooks/useEngineConfig';
import { TicketsEnum } from '@/types/enums/ticket.enums';
import { findActiveBooster, findEquippedChip } from '@/utils/global/inventory.utils';
import {
  effectiveCycleSeconds,
  engineElapsedSeconds,
  resolveClaimedCount,
} from '@/utils/global/ticket-engine.utils';
import type { Ticket, TicketType } from '@/types/types/ticket.types';
import { QueryErrorState } from '@/components/shared/error/QueryErrorState';

export function TicketsTabsView() {
  const t = useAppTranslations();
  const toast = useToast();
  const { data: tickets, isFetching, isError, refetch } = useGetTicketsQuery();
  const { data: inventory } = useGetInventoryQuery();
  const { data: me } = useGetMeQuery();
  const isLp = me?.isLuckyPlayer ?? false;
  const isVip = me?.isVIP ?? false;
  // Server-resolved bulk-claim capability (VIP > LP, admin-tunable). Older API
  // without statusPerks → LP-only, matching the historical hardcoded gate.
  const canBulkClaim = me?.statusPerks ? me.statusPerks.bulkClaimEnabled : isLp;
  const avatarSpeedPct = useEngineSpeedAvatarBoostPct();
  const badgeSpeedPct = useTestBadgeSpeedBoostPct();
  const { tables } = useEngineConfig();
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

  // Throttles per-engine completion requests: without it a failing (or slow)
  // backend gets re-hit on every 1s tick until the refetch flips `pendingCount`.
  const completionAttemptAtRef = useRef<Record<string, number>>({});

  useEffect(() => {
    const allEngines = TICKETS_TIER_ORDER.flatMap(tier => enginesByTier[tier] ?? []);
    if (!allEngines.length) return;

    const tick = () => {
      // Compute outside the setState updater — dispatching from inside it is a
      // side effect React requires updaters not to have.
      const next: Record<string, number> = {};
      const due: string[] = [];
      for (const engine of allEngines) {
        const speedChip = findEquippedChip(inventory?.chips, engine.id, 'speed');
        const speedBooster = findActiveBooster(inventory?.boosters, engine.id, 'speed');
        const cycle = effectiveCycleSeconds(engine, {
          speedChip,
          speedBooster,
          isLuckyPlayer: isLp,
          isVip,
          perks: me?.statusPerks,
          avatarBoostPct: avatarSpeedPct,
          badgeBoostPct: badgeSpeedPct,
          tables,
        });
        next[engine.id] = engine.pendingCount > 0 ? cycle : engineElapsedSeconds(engine);
        if (engine.pendingCount === 0 && next[engine.id] >= cycle) due.push(engine.id);
      }

      setElapsedByEngine(prev => {
        const changed = allEngines.some(engine => prev[engine.id] !== next[engine.id]);
        return changed ? { ...prev, ...next } : prev;
      });

      const now = Date.now();
      for (const engineId of due) {
        if (now - (completionAttemptAtRef.current[engineId] ?? 0) > 15_000) {
          completionAttemptAtRef.current[engineId] = now;
          completeEngineCycle({ engineId });
        }
      }
    };

    tick();
    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
    // `avatarSpeedPct`, `badgeSpeedPct` and `tables` feed the same cycle
    // computation as the rest — see HomeEnginesSlider.
  }, [
    enginesByTier,
    inventory,
    isLp,
    isVip,
    avatarSpeedPct,
    badgeSpeedPct,
    tables,
    completeEngineCycle,
  ]);

  if (isError) return <QueryErrorState onRetry={() => refetch()} />;

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

  // The celebration modal opens only after the server confirms — a "+N added
  // to inventory" splash followed by a silent optimistic rollback would lie.
  // The count it shows is the server's own `claimed`, not the local sum, for
  // the same reason: see `resolveClaimedCount`.
  const handleClaimAllForTier = async (tier: TicketType) => {
    const engines = enginesByTier[tier] ?? [];
    const total = engines.reduce((sum, engine) => sum + (engine.pendingCount || 0), 0);
    if (total === 0) return;
    try {
      const response = await claimEnginesForTier({ tier }).unwrap();
      const claimed = resolveClaimedCount(response, total);
      setElapsedByEngine(prev => {
        const next = { ...prev };
        for (const engine of engines) {
          if (engine.pendingCount > 0) next[engine.id] = 0;
        }
        return next;
      });
      // A confirmed zero means someone else drained the tier first — the tickets
      // cache already settled, so celebrating "+0" would be the only lie left.
      if (claimed > 0) setClaimedModal({ open: true, tier, count: claimed });
    } catch {
      toast.error(t('claim failed'));
    }
  };

  const handleClaimEngine = async (tier: TicketType, engineId: string) => {
    const engine = (enginesByTier[tier] ?? []).find(item => item.id === engineId);
    if (!engine || engine.pendingCount <= 0) return;
    const pending = engine.pendingCount;
    try {
      const response = await claimEngine({ engineId }).unwrap();
      const claimed = resolveClaimedCount(response, pending);
      setElapsedByEngine(prev => ({ ...prev, [engineId]: 0 }));
      if (claimed > 0) setClaimedModal({ open: true, tier, count: claimed });
    } catch {
      toast.error(t('claim failed'));
    }
  };

  const renderTabContent = () => {
    if (activeTab === PARTNERS_TAB_KEY) {
      return <PartnersComingSoon />;
    }
    const ticket = ticketByTier(activeTab);
    if (isFetching && !ticket) {
      return (
        <div className="flex flex-col gap-3">
          <div className="card-outlined bg-purple-gradient rounded-2xl p-4 h-24 animate-pulse" />
          <div className="card-outlined bg-purple-gradient rounded-2xl p-4 h-24 animate-pulse" />
        </div>
      );
    }
    // The mock returns all 5 tiers, but the UI must not bank on the real
    // backend doing the same forever — a missing tier record renders as an
    // empty zero-count tier, never as an infinite skeleton.
    const resolvedTicket: Ticket = ticket ?? {
      id: activeTab,
      ticketType: activeTab,
      count: 0,
      engines: [],
    };
    if (!isTierUnlocked(activeTab)) {
      return <TierLockedContent ticket={resolvedTicket} />;
    }
    return (
      <TierUnlockedContent
        ticket={resolvedTicket}
        tier={activeTab}
        engines={enginesByTier[activeTab] ?? []}
        elapsedByEngine={elapsedByEngine}
        // "Claim all" is an admin-tunable status perk (LP-only by default). Read
        // the backend-resolved capability from me.statusPerks so the button
        // matches what the server enforces; fall back to LP-only on an older API.
        onClaimAll={canBulkClaim ? () => handleClaimAllForTier(activeTab) : undefined}
        onClaimEngine={engineId => handleClaimEngine(activeTab, engineId)}
      />
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div data-tour="tickets">
        <TicketsTierSummary
          tabs={tabs}
          // First load only — background refetches (every claim invalidates
          // `tickets`) must not flash the label skeletons.
          loading={isFetching && !tickets}
          active={activeTab}
          onChange={setActiveTab}
        />
      </div>

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
