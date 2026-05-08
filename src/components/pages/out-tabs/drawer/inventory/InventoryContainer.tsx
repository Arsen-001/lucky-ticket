'use client';

import { useState } from 'react';
import { Plus, Sparkles, Zap } from 'lucide-react';
import {
  useActivateBoosterMutation,
  useEquipChipMutation,
  useGetInventoryQuery,
  useLevelUpChipMutation,
  useMintChipMutation,
  useUnequipChipMutation,
} from '@/api/inventory.api';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { InventoryBooster, InventoryChip } from '@/types/interfaces/inventory.interfaces';
import { BoosterActivateModal } from './BoosterActivateModal';
import { ChipEquipModal } from './ChipEquipModal';
import { ChipMintModal } from './ChipMintModal';
import { InventoryBoosterItem } from './InventoryBoosterItem';
import { InventoryBuildersStrip } from './InventoryBuildersStrip';
import { InventoryItem } from './InventoryItem';
import { InventoryTierFilter, type InventoryTierFilterValue } from './InventoryTierFilter';
import { InventoryShardsStrip } from './InventoryShardsStrip';
import { InventoryTypeFilter, type InventoryTypeFilterValue } from './InventoryTypeFilter';

export function InventoryContainer() {
  const t = useAppTranslations();
  const { data, isLoading } = useGetInventoryQuery();
  const [equipChipMutation, { isLoading: equipping }] = useEquipChipMutation();
  const [unequipChipMutation] = useUnequipChipMutation();
  const [levelUpChipMutation] = useLevelUpChipMutation();
  const [mintChipMutation, { isLoading: minting }] = useMintChipMutation();
  const [activateBoosterMutation, { isLoading: activating }] = useActivateBoosterMutation();

  const [tierFilter, setTierFilter] = useState<InventoryTierFilterValue>('all');
  const [typeFilter, setTypeFilter] = useState<InventoryTypeFilterValue>('all');
  const [equipChip, setEquipChip] = useState<InventoryChip | undefined>(undefined);
  const [activateBooster, setActivateBooster] = useState<InventoryBooster | undefined>(undefined);
  const [mintOpen, setMintOpen] = useState(false);
  const [animatingChipId, setAnimatingChipId] = useState<string | undefined>(undefined);
  const [unequipPendingId, setUnequipPendingId] = useState<string | undefined>(undefined);

  const chips = data?.chips ?? [];
  const shards = data?.shards ?? [];
  const builders = data?.builders ?? {
    bronze: 0,
    silver: 0,
    gold: 0,
    platinum: 0,
    diamond: 0,
  };
  const boosters = data?.boosters ?? [];

  const isBoostersView = typeFilter === 'boosters';
  const chipTypeFilter: 'all' | 'speed' | 'capacity' =
    typeFilter === 'speed' || typeFilter === 'capacity' ? typeFilter : 'all';

  const visibleChips = chips.filter(c => {
    const tierOk = tierFilter === 'all' || c.quality === tierFilter;
    const typeOk = chipTypeFilter === 'all' || c.type === chipTypeFilter;
    return tierOk && typeOk;
  });

  const visibleBoosters = boosters.filter(b => {
    const tierOk = tierFilter === 'all' || b.quality === tierFilter;
    return tierOk;
  });

  const shardsAvailableFor = (chip: InventoryChip) =>
    shards.find(s => s.type === chip.type && s.quality === chip.quality)?.count ?? 0;

  const handleLevelUp = (chip: InventoryChip) => {
    if (animatingChipId) return;
    if (shardsAvailableFor(chip) < chip.shardsForNextLevel) return;
    setAnimatingChipId(chip.id);
    window.setTimeout(() => {
      levelUpChipMutation({ chipId: chip.id });
      setAnimatingChipId(undefined);
    }, 700);
  };

  const handleEquipConfirm = async (engineId: string) => {
    if (!equipChip) return;
    await equipChipMutation({ chipId: equipChip.id, engineId }).unwrap();
    setEquipChip(undefined);
  };

  const handleUnequip = async (chip: InventoryChip) => {
    setUnequipPendingId(chip.id);
    try {
      await unequipChipMutation({ chipId: chip.id }).unwrap();
    } finally {
      setUnequipPendingId(undefined);
    }
  };

  const handleActivateConfirm = async (engineId: string) => {
    if (!activateBooster) return;
    await activateBoosterMutation({ boosterId: activateBooster.id, engineId }).unwrap();
    setActivateBooster(undefined);
  };

  const handleMintConfirm = async (params: {
    type: InventoryChip['type'];
    quality: InventoryChip['quality'];
  }) => {
    await mintChipMutation(params).unwrap();
    setMintOpen(false);
  };

  return (
    <div className="flex flex-col gap-4 pb-8">
      <InventoryTierFilter value={tierFilter} onChange={setTierFilter} />

      <div className="flex flex-col gap-4 px-4">
        <InventoryTypeFilter value={typeFilter} onChange={setTypeFilter} />

        {isBoostersView ? (
          visibleBoosters.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-white/8 bg-black/25 p-6 text-center">
              <Zap size={28} className="text-electric-purple" />
              <p className="text-xs text-white/65">{t('boosters empty')}</p>
            </div>
          ) : (
            <section className="flex flex-col gap-2">
              <span className="text-pink-secondary text-[10px] font-extrabold uppercase tracking-wider">
                {t('your boosters')}
              </span>
              <div className="flex flex-col gap-2.5">
                {visibleBoosters.map((booster, i) => (
                  <InventoryBoosterItem
                    key={booster.id}
                    booster={booster}
                    index={i}
                    onActivate={setActivateBooster}
                  />
                ))}
              </div>
            </section>
          )
        ) : (
          <>
            <InventoryShardsStrip
              shards={shards}
              tierFilter={tierFilter}
              typeFilter={chipTypeFilter}
            />

            {visibleChips.length === 0 && !isLoading ? (
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-white/8 bg-black/25 p-6 text-center">
                <Sparkles size={28} className="text-gold" />
                <p className="text-xs text-white/65">{t('inventory empty')}</p>
              </div>
            ) : (
              <section className="flex flex-col gap-2">
                <span className="text-pink-secondary text-[10px] font-extrabold uppercase tracking-wider">
                  {t('your chips')}
                </span>
                <div className="flex flex-col gap-2.5">
                  {visibleChips.map((chip, i) => (
                    <InventoryItem
                      key={chip.id}
                      chip={chip}
                      index={i}
                      availableShards={shardsAvailableFor(chip)}
                      isLevelingUp={animatingChipId === chip.id}
                      isUnequipping={unequipPendingId === chip.id}
                      onEquip={setEquipChip}
                      onUnequip={handleUnequip}
                      onLevelUp={handleLevelUp}
                    />
                  ))}
                </div>
              </section>
            )}

            <InventoryBuildersStrip buildersByTier={builders} tierFilter={tierFilter} />

            <button
              type="button"
              onClick={() => setMintOpen(true)}
              className="bg-pink-gradient flex-center mt-2 w-full cursor-pointer gap-2 rounded-2xl px-4 py-4 text-[13px] font-extrabold uppercase tracking-wider text-white shadow-[0_8px_24px_rgba(222,0,155,0.35),inset_0_1px_0_rgba(255,255,255,0.25)] transition-transform active:scale-99"
            >
              <Plus size={18} strokeWidth={2.6} />
              {t('create new chip')}
            </button>
          </>
        )}
      </div>

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
        chips={chips}
        shards={shards}
        buildersByTier={builders}
      />
    </div>
  );
}
