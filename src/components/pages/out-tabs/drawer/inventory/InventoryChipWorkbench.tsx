'use client';

import { useAppTranslations } from '@/hooks/useAppTranslations';
import { isChipReadyToLevelUp } from '@/utils/global/inventory.utils';
import type { InventoryChip, InventoryShardCount } from '@/types/interfaces/inventory.interfaces';
import type { EngineSlotInfo } from '@/utils/global/inventory.utils';
import { ChipActionRow } from './ChipActionRow';
import { InventorySectionHeading } from './InventorySectionHeading';

export interface InventoryChipWorkbenchProps {
  chips: InventoryChip[];
  shards: InventoryShardCount[];
  slots: EngineSlotInfo[];
  levelingUpChipId?: string;
  unequippingChipId?: string;
  onEquip: (chip: InventoryChip) => void;
  onUnequip: (chip: InventoryChip) => void;
  onLevelUp: (chip: InventoryChip) => void;
}

/**
 * The collection split by what the player can do with it right now: chips whose
 * next level is already paid for, chips currently working on an engine, and the
 * rest. Every row carries its own actions, so nothing needs opening first.
 */
export function InventoryChipWorkbench({
  chips,
  shards,
  slots,
  levelingUpChipId,
  unequippingChipId,
  onEquip,
  onUnequip,
  onLevelUp,
}: InventoryChipWorkbenchProps) {
  const t = useAppTranslations();

  const ready = chips.filter(chip => isChipReadyToLevelUp(chip, shards));
  const installed = chips.filter(chip => !ready.includes(chip) && chip.equippedOnEngineId);
  const reserve = chips.filter(chip => !ready.includes(chip) && !chip.equippedOnEngineId);

  const groups = [
    { key: 'ready', label: t('ready to upgrade'), items: ready, accent: 'var(--color-gold)' },
    { key: 'installed', label: t('installed'), items: installed, accent: undefined },
    { key: 'reserve', label: t('in reserve'), items: reserve, accent: undefined },
  ].filter(group => group.items.length > 0);

  return (
    <div className="flex flex-col gap-4">
      {groups.map(group => (
        <section key={group.key} className="flex flex-col gap-2">
          <InventorySectionHeading
            label={group.label}
            count={group.items.length}
            accent={group.accent}
          />
          <div className="flex flex-col gap-2">
            {group.items.map((chip, index) => (
              <ChipActionRow
                key={chip.id}
                chip={chip}
                index={index}
                availableShards={
                  shards.find(s => s.type === chip.type && s.quality === chip.quality)?.count ?? 0
                }
                engineNumber={slots.find(slot => slot.id === chip.equippedOnEngineId)?.number}
                isLevelingUp={levelingUpChipId === chip.id}
                isUnequipping={unequippingChipId === chip.id}
                onEquip={onEquip}
                onUnequip={onUnequip}
                onLevelUp={onLevelUp}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
