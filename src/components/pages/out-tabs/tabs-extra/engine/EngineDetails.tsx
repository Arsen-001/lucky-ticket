'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { ConfirmModal } from '@/components/shared/modals/ConfirmModal';
import { EngineSlotPickerModal } from '@/components/pages/tabs/home/EngineSlotPickerModal';
import { NotEnoughStarsModal } from '@/components/pages/tabs/home/NotEnoughStarsModal';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { routes } from '@/constants/routes';
import {
  chipEquipStarsCost,
  findActiveBooster,
  findEquippedChip,
} from '@/utils/global/inventory.utils';
import {
  effectiveCycleSeconds,
  engineCapacity,
  engineElapsedSeconds,
  findEngineLocation,
} from '@/utils/global/ticket-engine.utils';
import { EngineCard } from '@/components/pages/out-tabs/tabs-extra/ticket/EngineCard';
import {
  DEFAULT_BADGE_DEFS,
  EngineCubeBadgesFace,
} from '@/components/pages/tabs/home/EngineCubeBadgesFace';
import { EngineCubeSlot } from '@/components/pages/tabs/home/EngineCubeSlot';
import { EngineCubeStatsFace } from '@/components/pages/tabs/home/EngineCubeStatsFace';
import { CubeFaceCard } from '@/components/pages/out-tabs/tabs-extra/engine/CubeFaceCard';
import type { InventoryChip, InventoryChipType } from '@/types/interfaces/inventory.interfaces';

export interface EngineDetailsProps {
  id: string;
}

export function EngineDetails({ id }: EngineDetailsProps) {
  const t = useAppTranslations();
  const { data: tickets, isLoading } = useGetTicketsQuery();
  const { data: me } = useGetMeQuery();
  const { data: inventory } = useGetInventoryQuery();
  const isLp = me?.isLuckyPlayer ?? false;
  const isVip = me?.isVIP ?? false;

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
  const [starsModal, setStarsModal] = useState<{ open: boolean; required: number }>({
    open: false,
    required: 0,
  });
  const router = useRouter();

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

  useEffect(() => {
    if (!engine) return;
    const tick = () => {
      const cycle = effectiveCycleSeconds(engine, {
        speedChip,
        speedBooster,
        isLuckyPlayer: isLp,
        isVip,
      });
      const elapsed =
        engine.pendingCount > 0 ? cycle : Math.min(cycle, engineElapsedSeconds(engine));
      setElapsedSeconds(elapsed);
      if (engine.pendingCount === 0 && elapsed >= cycle) {
        completeEngineCycle({ engineId: engine.id });
      }
    };
    tick();
    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, [engine, speedChip, speedBooster, isLp, isVip, completeEngineCycle]);

  if (isLoading) {
    return <div className="px-5 py-4 text-pink-secondary text-sm">{t('loading')}</div>;
  }

  if (!engine || !tier) {
    return (
      <div className="px-5 py-6">
        <EmptyDataInfo title={t('not found')} description={t('engine not found')} />
      </div>
    );
  }

  const cycle = effectiveCycleSeconds(engine, {
    speedChip,
    speedBooster,
    isLuckyPlayer: isLp,
    isVip,
  });
  const capacity = engineCapacity(engine, { capacityChip, capacityBooster });
  // Productivity is "before time-limited booster" but *with* permanent boosts
  // (engine/speed levels, chip, status) — so status must be included here too.
  const baseCycleSeconds = effectiveCycleSeconds(engine, {
    speedChip,
    isLuckyPlayer: isLp,
    isVip,
  });
  const baseCapacity = engineCapacity(engine, { capacityChip });
  const ticketsPerHour = baseCycleSeconds > 0 ? (3600 / baseCycleSeconds) * baseCapacity : 0;

  const speedLevel = engine.speedLevel ?? 0;
  const capacityLevel = engine.capacityLevel ?? 0;
  const engineLevel = engine.engineLevel ?? 1;

  const remaining = Math.max(0, cycle - elapsedSeconds);
  const instantClaimCost = Math.max(1, Math.ceil(remaining / 3600));
  const lifetimeProduced = engineLevel * (capacity + 5) * 17;
  const currentStars = me?.telegramStars ?? 0;

  const handleTopUpStars = (amount: number) => {
    setStarsModal(prev => ({ ...prev, open: false }));
    router.push(`${routes.wallet}?topUp=${amount}`);
  };

  const requireStars = (cost: number, onPaid: () => void) => {
    if (currentStars < cost) {
      setStarsModal({ open: true, required: cost });
      return;
    }
    onPaid();
  };

  const handleClaim = () => {
    if (engine.pendingCount <= 0) return;
    setElapsedSeconds(0);
    claimEngine({ engineId: engine.id });
  };

  const handleInstantClaim = () => {
    requireStars(instantClaimCost, () => {
      setElapsedSeconds(0);
      instantClaimEngine({ engineId: engine.id, cost: instantClaimCost });
    });
  };

  const handleUpgradeSpeed = () => {
    const cost = 5 + speedLevel * 3;
    requireStars(cost, () => {
      upgradeEngineSpeed({ engineId: engine.id, cost });
    });
  };

  const handleUpgradeCapacity = () => {
    const cost = 8 + capacityLevel * 4;
    requireStars(cost, () => {
      upgradeEngineCapacity({ engineId: engine.id, cost });
    });
  };

  const isSlotPending = (category: 'chip' | 'booster', type: InventoryChipType) =>
    !!pendingPick && pendingPick.category === category && pendingPick.type === type;

  const tierAccent = `var(--color-${tier})`;
  const badges = DEFAULT_BADGE_DEFS({
    spark: engineLevel >= 1,
    speed: speedLevel >= 3,
    capacity: capacityLevel >= 3,
    veteran: lifetimeProduced >= 1000,
  });

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

      <CubeFaceCard accent={tierAccent} aspect="4/3">
        <EngineCubeStatsFace
          lifetimeProduced={lifetimeProduced}
          ticketsPerHour={ticketsPerHour}
          engineLevel={engineLevel}
          ownerName={me?.username}
          createdAt={engine.cycleStartedAt}
          accent={tierAccent}
        />
      </CubeFaceCard>

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

      <CubeFaceCard accent={tierAccent} aspect="4/3">
        <EngineCubeBadgesFace badges={badges} accent={tierAccent} />
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
          setPendingPick({ category: 'chip', type: chip.type, itemId: chip.id });
          setPickerSlot(null);
          try {
            await equipChipMutation({ chipId: chip.id, engineId: engine.id }).unwrap();
          } finally {
            setPendingPick(null);
          }
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
                cost: chipEquipStarsCost(chipToUnequip.level),
              })}
            </p>
          ) : null
        }
        confirmText={t('unequip')}
        onClose={() => setChipToUnequip(null)}
        onConfirm={async () => {
          if (!chipToUnequip) return;
          await unequipChip({ chipId: chipToUnequip.id }).unwrap();
          setChipToUnequip(null);
        }}
      />

      <NotEnoughStarsModal
        open={starsModal.open}
        onClose={() => setStarsModal(prev => ({ ...prev, open: false }))}
        requiredStars={starsModal.required}
        currentStars={currentStars}
        onTopUp={handleTopUpStars}
      />
    </div>
  );
}
