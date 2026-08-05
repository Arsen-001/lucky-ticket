'use client';

import { twMerge } from 'tailwind-merge';
import { useGetInventoryQuery } from '@/api/inventory.api';
import { useGetMeQuery } from '@/api/me.api';
import { useEngineSpeedAvatarBoostPct } from '@/hooks/useEngineSpeedAvatarBoostPct';
import { useTestBadgeSpeedBoostPct } from '@/hooks/useTestBadgeSpeedBoostPct';
import { useEngineConfig } from '@/hooks/useEngineConfig';
import { EngineCardStatsHeader } from '@/components/pages/out-tabs/tabs-extra/ticket/EngineCardStatsHeader';
import { EngineCardCycleRow } from '@/components/pages/out-tabs/tabs-extra/ticket/EngineCardCycleRow';
import { EngineCardBoostControls } from '@/components/pages/out-tabs/tabs-extra/ticket/EngineCardBoostControls';
import { effectiveCycleSeconds, engineCapacity } from '@/utils/global/ticket-engine.utils';
import { findActiveBooster, findEquippedChip } from '@/utils/global/inventory.utils';
import { speedUpgradeLsCost, capacityUpgradeLsCost } from '@/utils/global/economy.utils';
import type { TicketEngine } from '@/types/interfaces/ticket.interfaces';
import type { TicketType } from '@/types/types/ticket.types';
import '@/styles/components/engine-card.css';
import { staggerMs } from '@/utils/global/animation.utils';

const TIER_GLOW: Record<TicketType, string> = {
  bronze: '#E08A3A',
  silver: '#D8D8D8',
  gold: '#FFD56A',
  platinum: '#E2E0D0',
  diamond: '#3FD9CF',
};

export interface EngineCardProps {
  engine: TicketEngine;
  tier: TicketType;
  index: number;
  elapsedSeconds: number;
  onClaim: (engineId: string) => void;
  onInstantClaim: (engineId: string) => void;
  onUpgradeSpeed: (engineId: string) => void;
  onUpgradeCapacity: (engineId: string) => void;
  compact?: boolean;
  /** What to show in the reactor circle — defaults to tickets */
  reactorVisual?: 'ticket' | 'engine';
  /** When true, marks the reactor dial as the onboarding-tour "engine" anchor. */
  tourAnchor?: boolean;
  className?: string;
}

/**
 * Thin container: computes the engine's derived stats and composes three
 * independent pieces —
 *   • {@link EngineCardStatsHeader} (reactor + level + stat pills, `memo`),
 *   • {@link EngineCardCycleRow} (pending/countdown + claim/skip, the live part),
 *   • {@link EngineCardBoostControls} (upgrade rows, `memo`).
 * A claim / skip / countdown tick changes only the cycle row's inputs, so the
 * memoized header and boost rows are skipped and their reactor image never
 * re-renders — "obnovit tolko to chto menyayetsya".
 */
export function EngineCard({
  engine,
  tier,
  index,
  elapsedSeconds,
  onClaim,
  onInstantClaim,
  onUpgradeSpeed,
  onUpgradeCapacity,
  compact = false,
  reactorVisual = 'ticket',
  tourAnchor = false,
  className,
}: EngineCardProps) {
  const { data: inventory } = useGetInventoryQuery();
  // Scope the `me` subscription to status flags only — a Lucky-Stars change on
  // any engine action must not re-render every card for a value it doesn't use.
  const { isLp, isVip } = useGetMeQuery(undefined, {
    selectFromResult: ({ data }) => ({
      isLp: data?.isLuckyPlayer ?? false,
      isVip: data?.isVIP ?? false,
    }),
  });
  const avatarSpeedPct = useEngineSpeedAvatarBoostPct();
  const badgeSpeedPct = useTestBadgeSpeedBoostPct();
  const { tables, upgrade } = useEngineConfig();
  const speedChip = findEquippedChip(inventory?.chips, engine.id, 'speed');
  const speedBooster = findActiveBooster(inventory?.boosters, engine.id, 'speed');
  const capacityChip = findEquippedChip(inventory?.chips, engine.id, 'capacity');
  const capacityBooster = findActiveBooster(inventory?.boosters, engine.id, 'capacity');
  const cycle = effectiveCycleSeconds(engine, {
    speedChip,
    speedBooster,
    capacityChip,
    capacityBooster,
    isLuckyPlayer: isLp,
    isVip,
    avatarBoostPct: avatarSpeedPct,
    badgeBoostPct: badgeSpeedPct,
    tables,
  });
  const capacity = engineCapacity(engine, { capacityChip, capacityBooster, tables });
  const pending = engine.pendingCount > 0;
  const remaining = Math.max(0, cycle - elapsedSeconds);

  const speedLevel = engine.speedLevel ?? 0;
  const capacityLevel = engine.capacityLevel ?? 0;
  const engineLevel = engine.engineLevel ?? 1;

  // Displayed prices must come from the same config the charge handlers use —
  // an inline copy of the formula diverges on the first rebalance.
  const speedCost = speedUpgradeLsCost(speedLevel, engineLevel, tier, upgrade);
  const capacityCost = capacityUpgradeLsCost(capacityLevel, engineLevel, tier, upgrade);
  const instantClaimCost = Math.max(1, Math.ceil(remaining / 3600));

  const glow = TIER_GLOW[tier];

  return (
    <div
      className={twMerge(
        compact
          ? 'flex flex-col justify-between h-full overflow-hidden rounded-2xl p-[11px] animate-slide-in-bottom'
          : 'card-outlined bg-purple-gradient rounded-2xl p-[17px] animate-slide-in-bottom',
        className
      )}
      style={{ animationDelay: `${staggerMs(index, 60)}ms` }}
    >
      <EngineCardStatsHeader
        tier={tier}
        engineLevel={engineLevel}
        cycle={cycle}
        capacity={capacity}
        compact={compact}
        reactorVisual={reactorVisual}
        tourAnchor={tourAnchor}
      />

      <div className={twMerge('flex flex-col', compact ? 'gap-1.5' : 'mt-3 gap-2')}>
        <EngineCardCycleRow
          engineId={engine.id}
          pendingCount={engine.pendingCount}
          tier={tier}
          capacity={capacity}
          remaining={remaining}
          pending={pending}
          compact={compact}
          instantClaimCost={instantClaimCost}
          glow={glow}
          onClaim={onClaim}
          onInstantClaim={onInstantClaim}
        />

        <EngineCardBoostControls
          engineId={engine.id}
          speedLevel={speedLevel}
          capacityLevel={capacityLevel}
          speedCost={speedCost}
          capacityCost={capacityCost}
          compact={compact}
          onUpgradeSpeed={onUpgradeSpeed}
          onUpgradeCapacity={onUpgradeCapacity}
        />
      </div>
    </div>
  );
}
