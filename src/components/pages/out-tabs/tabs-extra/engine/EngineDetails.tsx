'use client';

import { useEffect, useRef, useState } from 'react';
import {
  useClaimEngineMutation,
  useCompleteEngineCycleMutation,
  useInstantClaimEngineMutation,
  useUpgradeEngineCapacityMutation,
  useUpgradeEngineSpeedMutation,
} from '@/api/engines.api';
import {
  useActivateBoosterMutation,
  useEquipChipMutation,
  useGetInventoryQuery,
  useUnequipChipMutation,
} from '@/api/inventory.api';
import { useGetMeQuery } from '@/api/me.api';
import { useGetTicketsQuery } from '@/api/tickets.api';
import { EmptyDataInfo } from '@/components/shared/EmptyDataInfo';
import { QueryErrorState } from '@/components/shared/error/QueryErrorState';
import { ConfirmModal } from '@/components/shared/modals/ConfirmModal';
import { EngineSlotPickerModal } from '@/components/pages/tabs/home/EngineSlotPickerModal';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useToast } from '@/hooks/useToast';
import { useSpendFailure } from '@/hooks/useSpendFailure';
import { useEngineSpeedAvatarBoostPct } from '@/hooks/useEngineSpeedAvatarBoostPct';
import { useTestBadgeCapacityTickets } from '@/hooks/useTestBadgeCapacityTickets';
import { useTestBadgeSpeedBoostPct } from '@/hooks/useTestBadgeSpeedBoostPct';
import { useEngineConfig } from '@/hooks/useEngineConfig';
import { findTicketFlightOrigin, useTicketFlight } from '@/hooks/useTicketFlight';
import {
  chipSlotStarsCost,
  chipUnequipStarsCost,
  findActiveBooster,
  findEquippedChip,
} from '@/utils/global/inventory.utils';
import {
  baselineCycleSeconds,
  effectiveCycleSeconds,
  engineCapacity,
  engineElapsedSeconds,
  findEngineLocation,
} from '@/utils/global/ticket-engine.utils';
import { speedUpgradeLsCost, capacityUpgradeLsCost } from '@/utils/global/economy.utils';
import { EngineCard } from '@/components/pages/out-tabs/tabs-extra/ticket/EngineCard';
import { EngineCubeStatsFace } from '@/components/pages/tabs/home/EngineCubeStatsFace';
import { EngineCubeSlot } from '@/components/pages/tabs/home/EngineCubeSlot';
import { CubeFaceCard } from '@/components/pages/out-tabs/tabs-extra/engine/CubeFaceCard';
import { EngineStatsLedger } from '@/components/pages/out-tabs/tabs-extra/engine/EngineStatsLedger';
import { engineSpeedBoostSources } from '@/utils/global/engine-boosts.utils';
import { displayNameOf } from '@/utils/global/user.utils';
import type { InventoryChip, InventoryChipType } from '@/types/interfaces/inventory.interfaces';

export interface EngineDetailsProps {
  id: string;
}

export function EngineDetails({ id }: EngineDetailsProps) {
  const t = useAppTranslations();
  const toast = useToast();
  const spend = useSpendFailure();
  const launchTicketFlight = useTicketFlight();
  const { data: tickets, isLoading, isError, refetch } = useGetTicketsQuery();
  const { data: me } = useGetMeQuery();
  const { data: inventory } = useGetInventoryQuery();
  const isLp = me?.isLuckyPlayer ?? false;
  const isVip = me?.isVIP ?? false;
  const avatarSpeedPct = useEngineSpeedAvatarBoostPct();
  const badgeSpeedPct = useTestBadgeSpeedBoostPct();
  const badgeCapacity = useTestBadgeCapacityTickets();
  const { tables, upgrade } = useEngineConfig();

  const [equipChipMutation] = useEquipChipMutation();
  const [activateBoosterMutation] = useActivateBoosterMutation();
  const [unequipChip, { isLoading: unequipping }] = useUnequipChipMutation();
  const [claimEngine] = useClaimEngineMutation();
  const [instantClaimEngine] = useInstantClaimEngineMutation();
  const [upgradeEngineSpeed] = useUpgradeEngineSpeedMutation();
  const [upgradeEngineCapacity] = useUpgradeEngineCapacityMutation();
  const [completeEngineCycle] = useCompleteEngineCycleMutation();

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [pickerSlot, setPickerSlot] = useState<{
    category: 'chip' | 'booster';
    type: InventoryChipType;
  } | null>(null);
  const [chipToUnequip, setChipToUnequip] = useState<InventoryChip | null>(null);
  const [pendingPick, setPendingPick] = useState<{
    category: 'chip' | 'booster';
    type: InventoryChipType;
    itemId: string;
  } | null>(null);

  const location = findEngineLocation(tickets, id);
  const engine = location?.engine ?? null;
  const tier = location?.tier ?? null;
  const indexInTier = location?.indexInTier ?? -1;

  const speedChip = engine ? findEquippedChip(inventory?.chips, engine.id, 'speed') : undefined;
  const speedBooster = engine
    ? findActiveBooster(inventory?.boosters, engine.id, 'speed')
    : undefined;
  const capacityChip = engine
    ? findEquippedChip(inventory?.chips, engine.id, 'capacity')
    : undefined;
  const capacityBooster = engine
    ? findActiveBooster(inventory?.boosters, engine.id, 'capacity')
    : undefined;

  // Throttles completion requests: without it a failing (or slow) backend gets
  // re-hit on every 1s tick until the refetch flips `pendingCount`.
  const completionAttemptAtRef = useRef(0);

  useEffect(() => {
    if (!engine) return;
    const tick = () => {
      const cycle = effectiveCycleSeconds(engine, {
        speedChip,
        speedBooster,
        capacityChip,
        capacityBooster,
        isLuckyPlayer: isLp,
        isVip,
        perks: me?.statusPerks,
        avatarBoostPct: avatarSpeedPct,
        badgeBoostPct: badgeSpeedPct,
        badgeCapacityTickets: badgeCapacity,
        tables,
      });
      const elapsed =
        engine.pendingCount > 0 ? cycle : Math.min(cycle, engineElapsedSeconds(engine));
      setElapsedSeconds(elapsed);
      if (engine.pendingCount === 0 && elapsed >= cycle) {
        const now = Date.now();
        if (now - completionAttemptAtRef.current > 15_000) {
          completionAttemptAtRef.current = now;
          completeEngineCycle({ engineId: engine.id });
        }
      }
    };
    tick();
    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, [
    engine,
    speedChip,
    speedBooster,
    capacityChip,
    capacityBooster,
    isLp,
    isVip,
    avatarSpeedPct,
    badgeSpeedPct,
    tables,
    completeEngineCycle,
  ]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 px-5 pb-6">
        <div className="card-outlined bg-purple-gradient h-64 animate-pulse rounded-2xl" />
        <div className="card-outlined bg-purple-gradient h-40 animate-pulse rounded-2xl" />
      </div>
    );
  }

  // A failed /tickets load must surface as an error+retry, not a misleading
  // "engine not found" empty state.
  if (isError && !tickets) {
    return (
      <div className="px-5 py-6">
        <QueryErrorState onRetry={() => refetch()} />
      </div>
    );
  }

  if (!engine || !tier) {
    return (
      <div className="px-5 py-6">
        <EmptyDataInfo title={t('not found')} description={t('engine not found')} />
      </div>
    );
  }

  // Same inputs `EngineCard` uses — including the capacity chip/booster, which
  // move the batch and with it the baseline cycle. Anything less and this
  // screen's cycle disagrees with the countdown ticking on the card above it.
  const cycle = effectiveCycleSeconds(engine, {
    speedChip,
    speedBooster,
    capacityChip,
    capacityBooster,
    isLuckyPlayer: isLp,
    isVip,
    perks: me?.statusPerks,
    avatarBoostPct: avatarSpeedPct,
    badgeBoostPct: badgeSpeedPct,
    badgeCapacityTickets: badgeCapacity,
    tables,
  });
  // What the engine is doing RIGHT NOW — batch and rate off the live cycle, so
  // every number in the stats layer matches the countdown and the ×N on the card.
  // (The old passport quoted a rate computed "before the time-limited booster",
  // which disagreed with the countdown running right above it.)
  const liveCapacity = engineCapacity(engine, {
    capacityChip,
    capacityBooster,
    badgeCapacityTickets: badgeCapacity,
    tables,
  });
  const liveTicketsPerHour = cycle > 0 ? (3600 / cycle) * liveCapacity : 0;

  // The speed stack itemised — same terms `effectiveCycleSeconds` sums, so the
  // total below always agrees with the countdown on the card above.
  const boosts = engineSpeedBoostSources(engine, {
    speedChip,
    speedBooster,
    isLuckyPlayer: isLp,
    isVip,
    perks: me?.statusPerks,
    avatarBoostPct: avatarSpeedPct,
    badgeBoostPct: badgeSpeedPct,
    tables,
  });
  const speedLevel = engine.speedLevel ?? 0;
  const capacityLevel = engine.capacityLevel ?? 0;
  const engineLevel = engine.engineLevel ?? 1;

  const remaining = Math.max(0, cycle - elapsedSeconds);
  const instantClaimCost = Math.max(1, Math.ceil(remaining / 3600));
  // Real running total of tickets this engine has ever claimed (backend counter).
  const lifetimeProduced = engine.lifetimeProduced ?? 0;
  const currentStars = me?.telegramStars ?? 0;

  const requireStars = (cost: number, onPaid: () => void) => {
    if (currentStars < cost) {
      spend.show('stars', { required: cost });
      return;
    }
    onPaid();
  };

  const handleClaim = async () => {
    if (engine.pendingCount <= 0) return;
    setElapsedSeconds(0);
    try {
      await claimEngine({ engineId: engine.id }).unwrap();
    } catch {
      toast.error(t('action failed'));
    }
  };

  const handleInstantClaim = () => {
    // One tap: charges stars, collects this cycle's tickets and restarts the
    // engine — so the local countdown resets exactly as it does after a plain
    // claim. (It used to call `skip`, which only marked the cycle ready and left
    // a second tap to collect; that preserved the AP a claim once awarded, and
    // engine claims have awarded none since 2026-07-08.)
    // Paid action — a failure must surface, never silently refund the stars.
    requireStars(instantClaimCost, async () => {
      // Same celebration a free claim gets (@see EngineCardCycleRow): one ticket
      // per ticket collected, flying to the Tickets tab. The count mirrors the
      // mutation's optimistic patch — pending if there is any, else a full batch.
      launchTicketFlight(
        findTicketFlightOrigin(engine.id),
        tier,
        engine.pendingCount > 0 ? engine.pendingCount : liveCapacity
      );
      setElapsedSeconds(0);
      try {
        await instantClaimEngine({ engineId: engine.id, cost: instantClaimCost }).unwrap();
      } catch (error) {
        await spend.report(error, { required: instantClaimCost });
      }
    });
  };

  const handleUpgradeSpeed = () => {
    const cost = speedUpgradeLsCost(speedLevel, engineLevel, tier, upgrade);
    requireStars(cost, async () => {
      try {
        await upgradeEngineSpeed({ engineId: engine.id, cost }).unwrap();
      } catch (error) {
        await spend.report(error, { required: cost });
      }
    });
  };

  const handleUpgradeCapacity = () => {
    const cost = capacityUpgradeLsCost(capacityLevel, engineLevel, tier, upgrade);
    requireStars(cost, async () => {
      try {
        await upgradeEngineCapacity({ engineId: engine.id, cost }).unwrap();
      } catch (error) {
        await spend.report(error, { required: cost });
      }
    });
  };

  const isSlotPending = (category: 'chip' | 'booster', type: InventoryChipType) =>
    !!pendingPick && pendingPick.category === category && pendingPick.type === type;

  const tierAccent = `var(--color-${tier})`;

  // The passport face quotes the owner's own statuses, exactly as the cube does:
  // the two status rows of the same breakdown — VIP's summand and the Lucky
  // Player factor, separately (they stack since 17.08.2026).
  const statusLabel = isVip ? 'VIP' : isLp ? 'LP' : undefined;
  const vipSpeedBoostPct = boosts.find(s => s.key === 'vip')?.pct ?? 0;
  const luckyPlayerSpeed = boosts.find(s => s.key === 'luckyPlayer');

  return (
    <div className="flex flex-col gap-4 px-5 pb-6">
      <EngineCard
        engine={engine}
        tier={tier}
        index={Math.max(0, indexInTier)}
        elapsedSeconds={elapsedSeconds}
        onClaim={() => handleClaim()}
        onInstantClaim={() => handleInstantClaim()}
        onUpgradeSpeed={() => handleUpgradeSpeed()}
        onUpgradeCapacity={() => handleUpgradeCapacity()}
        reactorVisual="engine"
      />

      <EngineStatsLedger
        accent={tierAccent}
        ticketsPerHour={liveTicketsPerHour}
        capacity={liveCapacity}
        cycleSeconds={cycle}
        baseCycleSeconds={baselineCycleSeconds(engine, {
          capacityChip,
          capacityBooster,
          badgeCapacityTickets: badgeCapacity,
          tables,
        })}
        lifetimeProduced={lifetimeProduced}
        boosts={boosts}
      />

      <CubeFaceCard accent={tierAccent}>
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-5">
          <div className="grid w-full max-w-[260px] grid-cols-2 gap-2">
            <EngineCubeSlot
              category="chip"
              type="speed"
              chip={speedChip}
              loading={isSlotPending('chip', 'speed')}
              onClick={() => setPickerSlot({ category: 'chip', type: 'speed' })}
              onRemove={
                speedChip
                  ? () => {
                      const chip = inventory?.chips.find(item => item.id === speedChip.id);
                      if (chip) setChipToUnequip(chip);
                    }
                  : undefined
              }
            />
            <EngineCubeSlot
              category="chip"
              type="capacity"
              chip={capacityChip}
              loading={isSlotPending('chip', 'capacity')}
              onClick={() => setPickerSlot({ category: 'chip', type: 'capacity' })}
              onRemove={
                capacityChip
                  ? () => {
                      const chip = inventory?.chips.find(item => item.id === capacityChip.id);
                      if (chip) setChipToUnequip(chip);
                    }
                  : undefined
              }
            />
          </div>
          <div className="grid w-full max-w-[260px] grid-cols-2 gap-2">
            <EngineCubeSlot
              category="booster"
              type="speed"
              booster={speedBooster}
              loading={isSlotPending('booster', 'speed')}
              onClick={() => setPickerSlot({ category: 'booster', type: 'speed' })}
            />
            <EngineCubeSlot
              category="booster"
              type="capacity"
              booster={capacityBooster}
              loading={isSlotPending('booster', 'capacity')}
              onClick={() => setPickerSlot({ category: 'booster', type: 'capacity' })}
            />
          </div>
        </div>
      </CubeFaceCard>

      {/* The cube's fourth face — its top. This screen unrolls the cube into a
          column of cards, and the passport was the one face with no card, while
          a badges panel that is on no face of the cube took its place. */}
      <CubeFaceCard accent={tierAccent} aspect="4/3">
        <EngineCubeStatsFace
          lifetimeProduced={lifetimeProduced}
          ticketsPerHour={liveTicketsPerHour}
          engineLevel={engineLevel}
          ownerName={displayNameOf(me)}
          createdAt={engine.createdAt}
          statusLabel={statusLabel}
          statusLevel={isVip ? me?.vipLevel : undefined}
          vipSpeedBoostPct={vipSpeedBoostPct}
          luckyPlayerSpeedMultiplier={luckyPlayerSpeed?.multiplier}
          luckyPlayerSpeedPct={luckyPlayerSpeed?.pct}
          accent={tierAccent}
        />
      </CubeFaceCard>

      <EngineSlotPickerModal
        open={!!pickerSlot}
        category={pickerSlot?.category ?? 'chip'}
        type={pickerSlot?.type ?? 'speed'}
        engineId={engine.id}
        engineTier={tier}
        pendingPickId={pendingPick?.itemId ?? null}
        onClose={() => setPickerSlot(null)}
        onPickChip={async chip => {
          if (!pickerSlot) return;
          // Equipping costs Lucky Stars (DOCS §10.4), so a short balance has to
          // reach the top-up sheet — a toast saying "action failed" reads as a
          // broken button rather than as a price.
          const cost = chipSlotStarsCost(chip, engine.id);
          setPickerSlot(null);
          requireStars(cost, async () => {
            setPendingPick({ category: 'chip', type: chip.type, itemId: chip.id });
            try {
              await equipChipMutation({ chipId: chip.id, engineId: engine.id }).unwrap();
            } catch (error) {
              await spend.report(error, { required: cost });
            } finally {
              setPendingPick(null);
            }
          });
        }}
        onPickBooster={async booster => {
          if (!pickerSlot) return;
          setPendingPick({ category: 'booster', type: booster.type, itemId: booster.id });
          setPickerSlot(null);
          try {
            await activateBoosterMutation({
              boosterId: booster.id,
              engineId: engine.id,
            }).unwrap();
          } catch {
            toast.error(t('action failed'));
          } finally {
            setPendingPick(null);
          }
        }}
      />

      <ConfirmModal
        open={!!chipToUnequip}
        loading={unequipping}
        title={t('unequip chip confirm title')}
        content={
          chipToUnequip ? (
            <p className="text-pink-secondary text-sm">
              {t('unequip chip confirm content', {
                cost: chipUnequipStarsCost(chipToUnequip.level),
              })}
            </p>
          ) : null
        }
        confirmText={t('unequip')}
        onClose={() => setChipToUnequip(null)}
        onConfirm={async () => {
          if (!chipToUnequip) return;
          try {
            await unequipChip({ chipId: chipToUnequip.id }).unwrap();
            setChipToUnequip(null);
          } catch (error) {
            setChipToUnequip(null);
            await spend.report(error, { required: chipUnequipStarsCost(chipToUnequip.level) });
          }
        }}
      />

      {spend.modals}
    </div>
  );
}
