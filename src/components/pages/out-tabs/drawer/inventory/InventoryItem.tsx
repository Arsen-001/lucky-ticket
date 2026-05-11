import {
  ArrowUp,
  Cpu,
  Infinity as InfinityIcon,
  type LucideIcon,
  MemoryStick,
  Timer,
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useGetMeQuery } from '@/api/me.api';
import { Button } from '@/components/shared/buttons/Button';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { chipUnequipStarsCost } from '@/utils/global/inventory.utils';
import type { InventoryChip, InventoryChipType } from '@/types/interfaces/inventory.interfaces';
import type { Dictionary } from '@/types/types/i18n.types';
import type { TicketType } from '@/types/types/ticket.types';
import '@/styles/components/inventory.css';

const TYPE_ICON: Record<InventoryChipType, LucideIcon> = {
  speed: Cpu,
  capacity: MemoryStick,
};

const QUALITY_ACCENT: Record<TicketType, string> = {
  bronze: 'var(--color-bronze)',
  silver: 'var(--color-silver)',
  gold: 'var(--color-gold)',
  platinum: 'var(--color-platinum)',
  diamond: 'var(--color-diamond)',
};

export interface InventoryItemProps {
  chip: InventoryChip;
  index: number;
  availableShards: number;
  isLevelingUp?: boolean;
  isUnequipping?: boolean;
  onEquip?: (chip: InventoryChip) => void;
  onUnequip?: (chip: InventoryChip) => void;
  onLevelUp?: (chip: InventoryChip) => void;
}

export function InventoryItem({
  chip,
  index,
  availableShards,
  isLevelingUp = false,
  isUnequipping = false,
  onEquip,
  onUnequip,
  onLevelUp,
}: InventoryItemProps) {
  const t = useAppTranslations();
  const { data: me } = useGetMeQuery();
  const ChipIcon = TYPE_ICON[chip.type];
  const accent = QUALITY_ACCENT[chip.quality];
  const isEquipped = !!chip.equippedOnEngineId;
  const unequipCost = chipUnequipStarsCost(chip.level);
  const canAffordUnequip = (me?.telegramStars ?? 0) >= unequipCost;

  const progressPct = Math.min(100, Math.round((availableShards / chip.shardsForNextLevel) * 100));
  const canLevelUp = availableShards >= chip.shardsForNextLevel;

  const remainingLabel =
    chip.lifetime === 'time-limited' && typeof chip.remainingMs === 'number'
      ? formatRemaining(chip.remainingMs, t)
      : null;

  return (
    <div
      className={twMerge(
        'bg-background-overlay inventory-card-shine animate-slide-in-bottom relative flex flex-col gap-3 overflow-hidden rounded-2xl p-3.5',
        isLevelingUp && 'inventory-chip-zoom'
      )}
      style={
        {
          '--chip-accent': accent,
          '--shine-delay': `${index * 0.4}s`,
          animationDelay: `${index * 60}ms`,
        } as React.CSSProperties
      }
    >
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-[18%] right-[18%] z-2 h-[3px]"
        style={{
          background: `linear-gradient(90deg, transparent 0%, color-mix(in srgb, ${accent} 90%, transparent) 50%, transparent 100%)`,
          filter: 'blur(0.8px)',
        }}
      />
      <div className="flex items-center gap-3">
        <div
          className="flex-center h-16 w-16 shrink-0 rounded-2xl border"
          style={{
            borderColor: `color-mix(in srgb, ${accent} 70%, transparent)`,
            backgroundColor: `color-mix(in srgb, ${accent} 22%, transparent)`,
            boxShadow: `inset 0 0 18px color-mix(in srgb, ${accent} 45%, transparent)`,
          }}
        >
          <ChipIcon size={30} stroke={accent} fill={accent} fillOpacity={0.32} strokeWidth={2.2} />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span
            className="text-[15px] font-extrabold uppercase tracking-[0.18em] leading-none"
            style={{ color: accent }}
          >
            {chip.type === 'speed' ? t('time') : t('capacity')}
          </span>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span
              className="rounded-full border px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wider"
              style={{
                color: accent,
                borderColor: `color-mix(in srgb, ${accent} 65%, transparent)`,
                backgroundColor: `color-mix(in srgb, ${accent} 14%, transparent)`,
              }}
            >
              {t(chip.quality as Parameters<Dictionary>[0])}
            </span>
            <span className="text-[11px] font-extrabold tabular-nums text-white">
              Lvl {chip.level} · +{chip.effectPct.toFixed(1)}%
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-1.5">
            {chip.lifetime === 'permanent' ? (
              <span
                className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"
                style={{ color: accent }}
              >
                <InfinityIcon size={11} strokeWidth={2.4} />
                {t('permanent')}
              </span>
            ) : (
              <span className="text-electric-pink flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider">
                <Timer size={11} strokeWidth={2.4} />
                {remainingLabel}
              </span>
            )}
          </div>
        </div>

        <div className="shrink-0">
          {isEquipped ? (
            <Button
              variant="secondary"
              disabled={!canAffordUnequip || isUnequipping}
              loading={isUnequipping}
              onClick={() => onUnequip?.(chip)}
              className={twMerge('flex flex-col items-center gap-0 px-3 py-1.5 text-[11px]')}
            >
              <span>{t('unequip')}</span>
              <span className="text-[9px] font-bold tabular-nums opacity-85">{unequipCost} ★</span>
            </Button>
          ) : (
            <Button onClick={() => onEquip?.(chip)} className={twMerge('px-3 py-2 text-[11px]')}>
              {t('equip')}
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
          <span className="text-white/55">
            {t('to next level')} · Lvl {chip.level + 1}
          </span>
          <span className="text-white tabular-nums" style={{ color: accent }}>
            {Math.min(availableShards, chip.shardsForNextLevel)} / {chip.shardsForNextLevel}{' '}
            {t('shards')}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
          <div
            className="h-full rounded-full transition-[width] duration-300"
            style={{
              width: `${progressPct}%`,
              background: `linear-gradient(90deg, ${accent}, color-mix(in srgb, ${accent} 60%, white))`,
              boxShadow: `0 0 8px color-mix(in srgb, ${accent} 60%, transparent)`,
            }}
          />
        </div>
        {canLevelUp && (
          <button
            type="button"
            disabled={isLevelingUp}
            onClick={() => onLevelUp?.(chip)}
            className="flex-center mt-1.5 cursor-pointer gap-2 rounded-xl py-2.5 text-[12px] font-extrabold uppercase tracking-[0.16em] text-white shadow-[0_6px_18px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.25)] transition-transform active:scale-99 disabled:cursor-default disabled:opacity-70"
            style={{
              background: `linear-gradient(135deg, ${accent} 0%, color-mix(in srgb, ${accent} 65%, white) 100%)`,
            }}
          >
            <ArrowUp size={14} strokeWidth={3} />
            {isLevelingUp ? t('leveling up') : t('level up')}
            {!isLevelingUp && (
              <span className="text-white/85 tabular-nums">
                · −{chip.shardsForNextLevel} {t('shards')}
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function formatRemaining(remainingMs: number, t: Dictionary) {
  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (days > 0) return t('{n}d left', { n: days });
  if (hours > 0) return t('{n}h left', { n: hours });
  return t('{n}m left', { n: minutes });
}
