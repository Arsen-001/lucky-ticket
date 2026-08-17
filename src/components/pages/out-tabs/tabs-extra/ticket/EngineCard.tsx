'use client';

import { twMerge } from 'tailwind-merge';
import { useGetInventoryQuery } from '@/api/inventory.api';
import { useGetMeQuery } from '@/api/me.api';
import { useEngineSpeedAvatarBoostPct } from '@/hooks/useEngineSpeedAvatarBoostPct';
import { useTestBadgeCapacityTickets } from '@/hooks/useTestBadgeCapacityTickets';
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
import { tierAccentColors } from '@/constants/tier-colors';

export interface EngineCardProps {
  engine: TicketEngine;
  tier: TicketType;
  index: number;
  elapsedSeconds: number;
  onClaim: (engineId: string) => void;
  onInstantClaim: (engineId: string) => void;
  onUpgradeSpeed: (engineId: string) => void;
  onUpgradeCapacity: (engineId: string) => void;
  /** An upgrade of this engine is in flight — the boost buttons hold. */
  upgradePending?: boolean;
  /** A claim (free or paid) of this engine is in flight — the cycle buttons hold. */
  claimPending?: boolean;
  /**
   * Home-cube face layout. The card is laid out inside the cube's 300px design
   * square and the whole square is then SCALED to the cube's footprint
   * (`--engine-cube-scale`, 0.859 on a 390px phone), so a size written here is
   * not the size the player sees — multiply by that scale first. Type in this
   * branch is therefore deliberately LARGER than the full-size card's, which is
   * never scaled: 14px here lands at 12.0px on the device.
   *
   * Sizing it "small because it's compact" is what made this face unreadable
   * twice — 8px declared arrived as 6.5px. The square is nearly full (16px of
   * slack out of 300), so most of the room for the current sizes came from the
   * scale, not from here. Floor guarded by `tests/engine-cube-face-type.test.ts`.
   */
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
  upgradePending = false,
  claimPending = false,
  compact = false,
  reactorVisual = 'ticket',
  tourAnchor = false,
  className,
}: EngineCardProps) {
  const { data: inventory } = useGetInventoryQuery();
  // Scope the `me` subscription to status flags only — a Lucky-Stars change on
  // any engine action must not re-render every card for a value it doesn't use.
  const { isLp, isVip, statusPerks } = useGetMeQuery(undefined, {
    selectFromResult: ({ data }) => ({
      isLp: data?.isLuckyPlayer ?? false,
      isVip: data?.isVIP ?? false,
      statusPerks: data?.statusPerks,
    }),
  });
  const avatarSpeedPct = useEngineSpeedAvatarBoostPct();
  const badgeSpeedPct = useTestBadgeSpeedBoostPct();
  const badgeCapacity = useTestBadgeCapacityTickets();
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
    perks: statusPerks,
    avatarBoostPct: avatarSpeedPct,
    badgeBoostPct: badgeSpeedPct,
    badgeCapacityTickets: badgeCapacity,
    tables,
  });
  const capacity = engineCapacity(engine, {
    capacityChip,
    capacityBooster,
    badgeCapacityTickets: badgeCapacity,
    tables,
  });
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

  const glow = tierAccentColors[tier];

  return (
    <div
      className={twMerge(
        compact
          ? 'flex flex-col justify-between h-full overflow-hidden rounded-2xl p-[10px] animate-slide-in-bottom'
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

      <div className={twMerge('flex flex-col', compact ? 'gap-[5px]' : 'mt-3 gap-2')}>
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
          busy={claimPending}
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
          upgradePending={upgradePending}
        />
      </div>
    </div>
  );
}
