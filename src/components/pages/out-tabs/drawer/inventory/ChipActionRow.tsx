'use client';

import { ArrowLeftRight, ArrowUp, Cpu, Infinity as InfinityIcon, Pause, Timer } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useGetMeQuery } from '@/api/me.api';
import { Button } from '@/components/shared/buttons/Button';
import { ChipIcon } from '@/components/shared/icons/ChipIcon';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import {
  QUALITY_ACCENT,
  chipEffectLabel,
  chipUnequipStarsCost,
  formatChipRemaining,
  isChipMaxed,
} from '@/utils/global/inventory.utils';
import { staggerMs } from '@/utils/global/animation.utils';
import type { InventoryChip } from '@/types/interfaces/inventory.interfaces';
import type { Dictionary } from '@/types/types/i18n.types';
import '@/styles/components/inventory.css';

export interface ChipActionRowProps {
  chip: InventoryChip;
  index: number;
  availableShards: number;
  engineNumber?: number;
  isLevelingUp?: boolean;
  isUnequipping?: boolean;
  onEquip?: (chip: InventoryChip) => void;
  onUnequip?: (chip: InventoryChip) => void;
  onLevelUp?: (chip: InventoryChip) => void;
}

/**
 * One chip as a working row: art, what it gives, and the one or two things that
 * can be done to it — no full-width upgrade bar per card, so the rows that CAN
 * be upgraded are the only ones wearing the amber button.
 */
export function ChipActionRow({
  chip,
  index,
  availableShards,
  engineNumber,
  isLevelingUp = false,
  isUnequipping = false,
  onEquip,
  onUnequip,
  onLevelUp,
}: ChipActionRowProps) {
  const t = useAppTranslations();
  const { data: me } = useGetMeQuery();
  const accent = QUALITY_ACCENT[chip.quality];
  const isEquipped = !!chip.equippedOnEngineId;
  const unequipCost = chipUnequipStarsCost(chip.level);
  const canAffordUnequip = (me?.telegramStars ?? 0) >= unequipCost;
  // A chip at the top has no next level: nothing to be "ready" for, and the
  // progress bar would divide by zero. Shared with the grouping so the row and
  // the section it sits in can never disagree about what "ready" means.
  const maxed = isChipMaxed(chip);
  const ready = !maxed && availableShards >= chip.shardsForNextLevel;
  const progressPct = maxed
    ? 100
    : Math.min(100, Math.round((availableShards / chip.shardsForNextLevel) * 100));
  const remaining =
    chip.lifetime === 'time-limited' && typeof chip.remainingMs === 'number'
      ? formatChipRemaining(chip.remainingMs, t)
      : null;

  return (
    <div
      className={twMerge(
        'shine-card animate-slide-in-bottom relative flex items-center gap-3 overflow-hidden rounded-2xl p-2.5',
        isLevelingUp && 'inventory-chip-zoom'
      )}
      style={{
        animationDelay: `${staggerMs(index, 60)}ms`,
        ['--shine-card-accent' as string]: accent,
        boxShadow: ready ? `0 0 0 1px color-mix(in srgb, ${accent} 70%, transparent)` : undefined,
      }}
    >
      <ChipIcon type={chip.type} tier={chip.quality} size={64} className="relative z-1 shrink-0" />

      <div className="relative z-1 flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className="text-[12px] font-extrabold uppercase leading-none tracking-[0.14em]"
            style={{ color: accent }}
          >
            {chip.type === 'speed' ? t('time') : t('capacity')}
          </span>
          <span
            className="rounded-full border px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wider"
            style={{
              color: accent,
              borderColor: `color-mix(in srgb, ${accent} 60%, transparent)`,
            }}
          >
            {t(chip.quality as Parameters<Dictionary>[0])}
          </span>
        </div>

        {/* `flex-wrap` + `whitespace-nowrap` per item, not one nowrap line: in
            Russian "Осталось 3 д" is three times the width of "3d left" and the
            row broke INSIDE the badge, leaving a lone "д" on its own line. Items
            now break between themselves and each stays whole. */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] font-extrabold text-white tabular-nums">
          <span className="whitespace-nowrap">
            {t('lv {level}', { level: chip.level })} · {chipEffectLabel(chip, t)}
          </span>
          {/* A time-limited chip burns its life ONLY while it sits on an engine
              (DOCS §10.5): off the engine the counter is stopped, and the same
              pink "6h left" that a running chip wears read as a countdown the
              player was losing. Stopped time gets its own icon, its own words
              and no accent colour. */}
          {remaining ? (
            isEquipped ? (
              <span className="text-electric-pink flex items-center gap-0.5 whitespace-nowrap text-[9px] font-bold uppercase tracking-wider">
                <Timer size={10} strokeWidth={2.6} />
                {remaining}
              </span>
            ) : (
              <span className="flex items-center gap-0.5 whitespace-nowrap text-[9px] font-bold uppercase tracking-wider text-white/45">
                <Pause size={10} strokeWidth={2.6} />
                {remaining} · {t('chip life paused')}
              </span>
            )
          ) : (
            <InfinityIcon size={11} strokeWidth={2.6} className="text-white/30" />
          )}
          {/* The engine badge is the MOVE control. Re-attaching costs the same
              whether it goes through "unequip, then equip" or straight across
              (DOCS §10.4: a move is a detach plus a free attach), but the
              screen only offered the two-step route — and between the steps the
              chip sits idle on nothing. Tapping the engine it is on opens the
              same picker, which prices the move and marks where it is now. */}
          {engineNumber &&
            (onEquip ? (
              <button
                type="button"
                onClick={() => onEquip(chip)}
                aria-label={t('equip chip')}
                className="tap-target relative flex items-center gap-0.5 whitespace-nowrap rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider transition-colors active:scale-95"
                style={{
                  color: accent,
                  borderColor: `color-mix(in srgb, ${accent} 45%, transparent)`,
                }}
              >
                <Cpu size={10} strokeWidth={2.6} />#{engineNumber}
                <ArrowLeftRight size={9} strokeWidth={3} className="opacity-70" />
              </button>
            ) : (
              <span
                className="flex items-center gap-0.5 whitespace-nowrap text-[9px] font-bold uppercase tracking-wider"
                style={{ color: accent }}
              >
                <Cpu size={10} strokeWidth={2.6} />#{engineNumber}
              </span>
            ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full transition-[width] duration-300"
              style={{
                width: `${progressPct}%`,
                background: `linear-gradient(90deg, ${accent}, color-mix(in srgb, ${accent} 55%, white))`,
              }}
            />
          </div>
          <span className="text-[9px] font-bold text-white/45 tabular-nums">
            {maxed
              ? t('max')
              : `${Math.min(availableShards, chip.shardsForNextLevel)}/${chip.shardsForNextLevel}`}
          </span>
        </div>
      </div>

      <div className="relative z-1 flex shrink-0 items-center gap-1.5">
        {ready && (
          <button
            type="button"
            disabled={isLevelingUp}
            onClick={() => onLevelUp?.(chip)}
            aria-label={t('level up')}
            className="flex-center h-11 w-11 shrink-0 cursor-pointer flex-col gap-0 rounded-xl text-[9px] font-extrabold text-white shadow-[0_4px_14px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.25)] transition-transform active:scale-95 disabled:opacity-70"
            style={{
              background: `linear-gradient(135deg, ${accent} 0%, color-mix(in srgb, ${accent} 65%, white) 100%)`,
            }}
          >
            <ArrowUp size={14} strokeWidth={3} />
            <span className="tabular-nums">{chip.shardsForNextLevel}</span>
          </button>
        )}

        {isEquipped ? (
          <Button
            variant="secondary"
            // NOT disabled when the balance is short: the container answers a
            // shortfall with the top-up sheet (and the price), which is the
            // whole point — a greyed button with no route to Stars reads as a
            // broken screen. The price stays red so the reason is visible
            // before the tap, not only after it.
            disabled={isUnequipping}
            loading={isUnequipping}
            onClick={() => onUnequip?.(chip)}
            className="tap-target relative flex flex-col items-center gap-0 px-2.5 py-1.5 text-[10px]"
          >
            <span>{t('unequip')}</span>
            <span
              className={twMerge(
                'text-[9px] font-bold tabular-nums opacity-85',
                !canAffordUnequip && 'text-error-text opacity-100'
              )}
            >
              {unequipCost} ★
            </span>
          </Button>
        ) : (
          <Button
            onClick={() => onEquip?.(chip)}
            className="tap-target relative px-3 py-2 text-[10px]"
          >
            {t('equip')}
          </Button>
        )}
      </div>
    </div>
  );
}
