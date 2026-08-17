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
import { useGetMeQuery } from '@/api/me.api';
import { useGetTicketsQuery } from '@/api/tickets.api';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useToast } from '@/hooks/useToast';
import { useSpendFailure } from '@/hooks/useSpendFailure';
import {
  buildEngineSlots,
  chipSlotStarsCost,
  chipUnequipStarsCost,
} from '@/utils/global/inventory.utils';
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
  const { data: me } = useGetMeQuery();
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

  /**
   * A price the balance cannot cover ends in the top-up sheet, never in a dead
   * control. Both slot actions used to disable their button instead — the
   * player saw a greyed "Unequip · 8 ★" with nothing to tap and no route to
   * Stars, which reads as a broken screen rather than as a price. `show()`
   * exists for exactly this: a shortfall the screen can see BEFORE it asks, so
   * a local check and a server refusal open the same sheet.
   */
  const shortOnStars = (cost: number) => {
    if (cost <= 0) return false;
    if ((me?.telegramStars ?? 0) >= cost) return false;
    spend.show('stars', { required: cost });
    return true;
  };

  const handleEquipConfirm = async (engineId: string) => {
    if (!equipChip) return;
    const price = chipSlotStarsCost(equipChip, engineId);
    if (shortOnStars(price)) {
      // Close the picker first: the top-up sheet is the answer now, and two
      // stacked panels leave the player tapping the wrong one.
      setEquipChip(undefined);
      return;
    }
    try {
      await equipChipMutation({ chipId: equipChip.id, engineId }).unwrap();
      setEquipChip(undefined);
    } catch (error) {
      // Equipping is a paid action (DOCS §10.4) — a short balance has to reach
      // the top-up sheet, with the price the modal just quoted.
      await spend.report(error, { required: price });
    }
  };

  const handleUnequip = async (chip: InventoryChip) => {
    if (shortOnStars(chipUnequipStarsCost(chip.level))) return;
    setUnequipPendingId(chip.id);
    try {
      await unequipChipMutation({ chipId: chip.id }).unwrap();
    } catch (error) {
      await spend.report(error, { required: chipUnequipStarsCost(chip.level) });
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
