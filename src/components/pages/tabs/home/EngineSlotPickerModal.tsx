'use client';

import Image from 'next/image';
import { Loader2, Sparkles, Timer } from 'lucide-react';
import { useGetInventoryQuery } from '@/api/inventory.api';
import { Modal } from '@/components/shared/modals/Modal';
import { icons } from '@/constants/icons';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import {
  BOOSTER_TYPE_ICON,
  CHIP_TYPE_ICON,
  QUALITY_ACCENT,
  canEquipChipOnTier,
  chipEquipStarsCost,
} from '@/utils/global/inventory.utils';
import type {
  InventoryBooster,
  InventoryChip,
  InventoryChipType,
} from '@/types/interfaces/inventory.interfaces';
import type { TicketType } from '@/types/types/ticket.types';

export type EngineSlotPickerCategory = 'chip' | 'booster';

export interface EngineSlotPickerModalProps {
  open: boolean;
  category: EngineSlotPickerCategory;
  type: InventoryChipType;
  engineId: string;
  engineTier: TicketType;
  pendingPickId?: string | null;
  onClose: () => void;
  onPickChip?: (chip: InventoryChip) => void;
  onPickBooster?: (booster: InventoryBooster) => void;
}

export function EngineSlotPickerModal({
  open,
  category,
  type,
  engineId,
  engineTier,
  pendingPickId = null,
  onClose,
  onPickChip,
  onPickBooster,
}: EngineSlotPickerModalProps) {
  const t = useAppTranslations();
  const { data: inventory } = useGetInventoryQuery();

  const chips = inventory?.chips ?? [];
  const boosters = inventory?.boosters ?? [];

  const eligibleChips =
    category === 'chip'
      ? chips.filter(
          c =>
            c.type === type &&
            c.equippedOnEngineId !== engineId &&
            canEquipChipOnTier(c.quality, engineTier)
        )
      : [];

  const eligibleBoosters =
    category === 'booster'
      ? boosters.filter(b => b.type === type && !b.activeOnEngineId && b.quality === engineTier)
      : [];

  const pendingId = pendingPickId;

  const handlePickChip = (chip: InventoryChip) => {
    if (pendingId) return;
    onPickChip?.(chip);
  };

  const handlePickBooster = (booster: InventoryBooster) => {
    if (pendingId) return;
    onPickBooster?.(booster);
  };

  const empty = category === 'chip' ? eligibleChips.length === 0 : eligibleBoosters.length === 0;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="card-outlined bg-purple-gradient flex flex-col gap-3 rounded-2xl p-5">
        <header>
          <h2 className="text-base font-extrabold text-white">
            {category === 'chip'
              ? type === 'speed'
                ? t('pick speed chip')
                : t('pick capacity chip')
              : type === 'speed'
                ? t('pick speed booster')
                : t('pick capacity booster')}
          </h2>
          <p className="text-pink-secondary mt-1 text-[11px]">
            {category === 'chip'
              ? t('chip slot picker hint')
              : t('booster slot picker hint', { tier: t(engineTier) })}
          </p>
        </header>

        {empty ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-black/25 p-6 text-center">
            <Sparkles size={24} className="text-gold" />
            <p className="text-xs text-white/65">
              {category === 'chip' ? t('no eligible chips') : t('no eligible boosters')}
            </p>
          </div>
        ) : category === 'chip' ? (
          <div className="flex max-h-[55vh] flex-col gap-2 overflow-y-auto">
            {eligibleChips.map(chip => {
              const accent = QUALITY_ACCENT[chip.quality];
              const Icon = CHIP_TYPE_ICON[chip.type];
              const cost = chipEquipStarsCost(chip.level);
              return (
                <button
                  key={chip.id}
                  type="button"
                  disabled={!!pendingId}
                  onClick={() => handlePickChip(chip)}
                  className="flex items-center gap-3 rounded-xl border bg-black/20 px-3 py-2.5 text-left transition-colors hover:bg-black/35 disabled:cursor-default disabled:opacity-50"
                  style={{
                    borderColor: `color-mix(in srgb, ${accent} 55%, transparent)`,
                  }}
                >
                  <div
                    className="flex-center h-10 w-10 rounded-lg border"
                    style={{
                      borderColor: `color-mix(in srgb, ${accent} 60%, transparent)`,
                      backgroundColor: `color-mix(in srgb, ${accent} 18%, transparent)`,
                    }}
                  >
                    <Icon
                      size={18}
                      stroke={accent}
                      fill={accent}
                      fillOpacity={0.3}
                      strokeWidth={2.4}
                    />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <span className="text-[12px] font-extrabold text-white">
                      {t(chip.quality)} · {chip.type === 'speed' ? t('time') : t('capacity')}
                    </span>
                    <span className="text-[10px] font-bold tabular-nums" style={{ color: accent }}>
                      Lvl {chip.level} · +{chip.effectPct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-extrabold tabular-nums text-white">
                    {pendingId === chip.id ? (
                      <Loader2
                        size={14}
                        className="animate-spin"
                        stroke={accent}
                        strokeWidth={2.6}
                      />
                    ) : (
                      <>
                        <Image src={icons.telegramStar} alt="" width={12} height={12} />
                        {cost}
                      </>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex max-h-[55vh] flex-col gap-2 overflow-y-auto">
            {eligibleBoosters.map(booster => {
              const accent = QUALITY_ACCENT[booster.quality];
              const BoosterIcon = BOOSTER_TYPE_ICON[booster.type];
              const TypeMarker = CHIP_TYPE_ICON[booster.type];
              return (
                <button
                  key={booster.id}
                  type="button"
                  disabled={!!pendingId}
                  onClick={() => handlePickBooster(booster)}
                  className="flex items-center gap-3 rounded-xl border bg-black/20 px-3 py-2.5 text-left transition-colors hover:bg-black/35 disabled:cursor-default disabled:opacity-50"
                  style={{
                    borderColor: `color-mix(in srgb, ${accent} 55%, transparent)`,
                  }}
                >
                  <div
                    className="flex-center h-10 w-10 rounded-lg border"
                    style={{
                      borderColor: `color-mix(in srgb, ${accent} 60%, transparent)`,
                      backgroundColor: `color-mix(in srgb, ${accent} 18%, transparent)`,
                    }}
                  >
                    <BoosterIcon
                      size={18}
                      stroke={accent}
                      fill={accent}
                      fillOpacity={0.3}
                      strokeWidth={2.4}
                    />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <span className="text-[12px] font-extrabold text-white">
                      {t(booster.quality)} · {booster.type === 'speed' ? t('time') : t('capacity')}
                    </span>
                    <span className="text-[10px] font-bold tabular-nums" style={{ color: accent }}>
                      +{booster.effectPct}% · {t('{n}h duration', { n: booster.durationHours })}
                    </span>
                  </div>
                  {pendingId === booster.id ? (
                    <Loader2 size={16} className="animate-spin" stroke={accent} strokeWidth={2.6} />
                  ) : (
                    <>
                      <TypeMarker size={14} stroke="rgba(255,255,255,0.4)" strokeWidth={2.4} />
                      <Timer size={14} stroke={accent} strokeWidth={2.4} />
                    </>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}
