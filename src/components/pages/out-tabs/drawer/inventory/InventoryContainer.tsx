'use client';

import { useState } from 'react';
import {
  useActivateBoosterMutation,
  useEquipChipMutation,
  useGetInventoryQuery,
  useLevelUpChipMutation,
  useMintChipMutation,
  useUnequipChipMutation,
} from '@/api/inventory.api';
import { useGetTicketsQuery } from '@/api/tickets.api';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useToast } from '@/hooks/useToast';
import { useSpendFailure } from '@/hooks/useSpendFailure';
import { buildEngineSlots } from '@/utils/global/inventory.utils';
import type { InventoryBooster, InventoryChip } from '@/types/interfaces/inventory.interfaces';
import { BoosterActivateModal } from './BoosterActivateModal';
import { ChipEquipModal } from './ChipEquipModal';
import { ChipMintModal } from './ChipMintModal';
import { InventoryScreen } from './InventoryScreen';
import { QueryErrorState } from '@/components/shared/error/QueryErrorState';

export function InventoryContainer() {
  const t = useAppTranslations();
  const toast = useToast();
  const spend = useSpendFailure();
  const { data, isLoading, isError, refetch } = useGetInventoryQuery();
  const { data: tickets } = useGetTicketsQuery();
  const [equipChipMutation, { isLoading: equipping }] = useEquipChipMutation();
  const [unequipChipMutation] = useUnequipChipMutation();
  const [levelUpChipMutation] = useLevelUpChipMutation();
  const [mintChipMutation, { isLoading: minting }] = useMintChipMutation();
  const [activateBoosterMutation, { isLoading: activating }] = useActivateBoosterMutation();

  const [equipChip, setEquipChip] = useState<InventoryChip | undefined>(undefined);
  const [activateBooster, setActivateBooster] = useState<InventoryBooster | undefined>(undefined);
  const [mintOpen, setMintOpen] = useState(false);
  const [animatingChipId, setAnimatingChipId] = useState<string | undefined>(undefined);
  const [unequipPendingId, setUnequipPendingId] = useState<string | undefined>(undefined);

  const chips = data?.chips ?? [];
  const shards = data?.shards ?? [];
  const boosters = data?.boosters ?? [];
  const slots = buildEngineSlots(tickets, chips);

  if (isError) return <QueryErrorState onRetry={() => refetch()} />;

  const shardsAvailableFor = (chip: InventoryChip) =>
    shards.find(s => s.type === chip.type && s.quality === chip.quality)?.count ?? 0;

  const handleLevelUp = (chip: InventoryChip) => {
    if (animatingChipId) return;
    if (shardsAvailableFor(chip) < chip.shardsForNextLevel) return;
    setAnimatingChipId(chip.id);
    window.setTimeout(async () => {
      try {
        await levelUpChipMutation({ chipId: chip.id }).unwrap();
      } catch (error) {
        await spend.report(error, { required: chip.shardsForNextLevel });
      }
      setAnimatingChipId(undefined);
    }, 700);
  };

  const handleEquipConfirm = async (engineId: string) => {
    if (!equipChip) return;
    try {
      await equipChipMutation({ chipId: equipChip.id, engineId }).unwrap();
      setEquipChip(undefined);
    } catch {
      toast.error(t('action failed'));
    }
  };

  const handleUnequip = async (chip: InventoryChip) => {
    setUnequipPendingId(chip.id);
    try {
      await unequipChipMutation({ chipId: chip.id }).unwrap();
    } catch (error) {
      await spend.report(error);
    } finally {
      setUnequipPendingId(undefined);
    }
  };

  const handleActivateConfirm = async (engineId: string) => {
    if (!activateBooster) return;
    try {
      await activateBoosterMutation({ boosterId: activateBooster.id, engineId }).unwrap();
      setActivateBooster(undefined);
    } catch {
      toast.error(t('action failed'));
    }
  };

  const handleMintConfirm = async (params: {
    type: InventoryChip['type'];
    quality: InventoryChip['quality'];
  }) => {
    try {
      await mintChipMutation(params).unwrap();
      setMintOpen(false);
    } catch (error) {
      setMintOpen(false);
      await spend.report(error);
    }
  };

  return (
    <>
      <InventoryScreen
        chips={chips}
        shards={shards}
        boosters={boosters}
        slots={slots}
        isLoading={isLoading}
        levelingUpChipId={animatingChipId}
        unequippingChipId={unequipPendingId}
        onEquip={setEquipChip}
        onUnequip={handleUnequip}
        onLevelUp={handleLevelUp}
        onActivateBooster={setActivateBooster}
        onMint={() => setMintOpen(true)}
      />

      <ChipEquipModal
        open={!!equipChip}
        chip={equipChip}
        loading={equipping}
        onClose={() => setEquipChip(undefined)}
        onConfirm={handleEquipConfirm}
      />
      <BoosterActivateModal
        open={!!activateBooster}
        booster={activateBooster}
        loading={activating}
        onClose={() => setActivateBooster(undefined)}
        onConfirm={handleActivateConfirm}
      />
      <ChipMintModal
        open={mintOpen}
        loading={minting}
        onClose={() => setMintOpen(false)}
        onConfirm={handleMintConfirm}
        shards={shards}
      />

      {spend.modals}
    </>
  );
}
