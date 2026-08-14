'use client';

import { useState } from 'react';
import { Plus, Sparkles, Zap } from 'lucide-react';
import { Tabs } from '@/components/shared/Tabs';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import {
  inventoryTypeStats,
  isChipReadyToLevelUp,
  sortChipsForDisplay,
} from '@/utils/global/inventory.utils';
import type { InventoryViewProps } from '@/types/interfaces/inventory.interfaces';
import { InventoryBonusTile } from './InventoryBonusTile';
import { InventoryBoosterItem } from './InventoryBoosterItem';
import { InventoryChipWorkbench } from './InventoryChipWorkbench';
import {
  InventoryFilterBar,
  emptyInventoryFilters,
  matchesInventoryFilters,
  type InventoryFilters,
} from './InventoryFilterBar';
import { InventorySectionHeading } from './InventorySectionHeading';
import { InventoryShardVault } from './InventoryShardVault';

export type InventoryScreenProps = InventoryViewProps;

/**
 * The inventory screen: what the installed chips are worth right now, then the
 * collection itself grouped by what can be done with it.
 *
 * The order of the page is the order of the questions — "what am I getting",
 * "what can I act on", "what do I own" — which is why the bonus tiles sit above
 * the list and the ready-to-upgrade group sits above the rest of it.
 */
export function InventoryScreen({
  chips,
  shards,
  boosters,
  slots,
  isLoading,
  levelingUpChipId,
  unequippingChipId,
  onEquip,
  onUnequip,
  onLevelUp,
  onActivateBooster,
  onMint,
}: InventoryScreenProps) {
  const t = useAppTranslations();
  const [mode, setMode] = useState<'chips' | 'boosters'>('chips');
  const [filters, setFilters] = useState<InventoryFilters>(emptyInventoryFilters);

  const isBoosters = mode === 'boosters';
  const sortedChips = sortChipsForDisplay(chips, shards);
  const visibleChips = sortedChips.filter(chip => matchesInventoryFilters(chip, filters));
  const visibleBoosters = boosters.filter(booster => matchesInventoryFilters(booster, filters));
  const readyCount = chips.filter(chip => isChipReadyToLevelUp(chip, shards)).length;

  return (
    <div className="flex flex-col gap-3 pb-8">
      <section className="flex flex-col gap-2">
        <InventorySectionHeading label={t('chip bonus')} />
        <div className="grid grid-cols-2 gap-2.5">
          <InventoryBonusTile type="speed" stats={inventoryTypeStats(slots, 'speed')} />
          <InventoryBonusTile type="capacity" stats={inventoryTypeStats(slots, 'capacity')} />
        </div>
      </section>

      <div className="bg-background/85 sticky top-0 z-30 -mx-5 flex flex-col gap-1 px-5 pt-2 pb-1 backdrop-blur-md">
        <Tabs
          activeKey={mode}
          onTabChange={key => setMode(key as 'chips' | 'boosters')}
          hideMountAnimation
          className="justify-start px-0"
          // `min-h-11` and not `tap-target`: the tabs scroller clips with
          // `overflow-x-auto`, and a hit zone drawn outside the button's box is
          // exactly the part a clip erases — the control has to BE 44px tall.
          classNames={{ container: 'w-full', tab: 'flex-1 min-h-11 text-[12px]' }}
          items={[
            {
              key: 'chips',
              title: (
                <span className="flex items-center justify-center gap-1.5">
                  {t('chips')}
                  <span className="tabular-nums opacity-70">{chips.length}</span>
                  {readyCount > 0 && (
                    <span className="bg-gold/20 text-gold rounded-full px-1.5 text-[10px] font-extrabold tabular-nums">
                      {readyCount}↑
                    </span>
                  )}
                </span>
              ),
            },
            {
              key: 'boosters',
              title: (
                <span className="flex items-center justify-center gap-1.5">
                  {t('boosters')}
                  <span className="tabular-nums opacity-70">{boosters.length}</span>
                </span>
              ),
            },
          ]}
        />

        <InventoryFilterBar
          items={isBoosters ? boosters : chips}
          value={filters}
          onChange={setFilters}
        />
      </div>

      {isBoosters ? (
        visibleBoosters.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-white/8 bg-black/25 p-6 text-center">
            <Zap size={36} className="text-electric-purple" />
            <p className="text-xs text-white/65">
              {boosters.length === 0 ? t('boosters empty') : t('nothing matches filters')}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {visibleBoosters.map((booster, index) => (
              <InventoryBoosterItem
                key={booster.id}
                booster={booster}
                index={index}
                onActivate={onActivateBooster}
              />
            ))}
          </div>
        )
      ) : (
        <>
          <InventoryShardVault shards={shards} />

          {visibleChips.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-white/8 bg-black/25 p-6 text-center">
              <Sparkles size={28} className="text-gold" />
              <p className="text-xs text-white/65">
                {chips.length === 0 ? t('inventory empty') : t('nothing matches filters')}
              </p>
            </div>
          ) : (
            <InventoryChipWorkbench
              chips={visibleChips}
              shards={shards}
              slots={slots}
              levelingUpChipId={levelingUpChipId}
              unequippingChipId={unequippingChipId}
              onEquip={onEquip}
              onUnequip={onUnequip}
              onLevelUp={onLevelUp}
            />
          )}

          <button
            type="button"
            onClick={onMint}
            className="bg-pink-gradient flex-center mt-1 w-full cursor-pointer gap-2 rounded-2xl px-4 py-4 text-[13px] font-extrabold uppercase tracking-wider text-white shadow-[0_8px_24px_rgba(222,0,155,0.35),inset_0_1px_0_rgba(255,255,255,0.25)] transition-transform active:scale-99"
          >
            <Plus size={18} strokeWidth={2.6} />
            {t('create new chip')}
          </button>
        </>
      )}
    </div>
  );
}
