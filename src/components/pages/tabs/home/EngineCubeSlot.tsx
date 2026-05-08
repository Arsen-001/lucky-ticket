import { Loader2, Plus, X } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import {
  BOOSTER_TYPE_ICON,
  CHIP_TYPE_ICON,
  QUALITY_ACCENT,
  TYPE_ACCENT,
} from '@/utils/global/inventory.utils';
import type {
  InventoryBooster,
  InventoryChip,
  InventoryChipType,
} from '@/types/interfaces/inventory.interfaces';

export interface EngineCubeSlotProps {
  category: 'chip' | 'booster';
  type: InventoryChipType;
  chip?: InventoryChip;
  booster?: InventoryBooster;
  loading?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
}

export function EngineCubeSlot({
  category,
  type,
  chip,
  booster,
  loading = false,
  onClick,
  onRemove,
}: EngineCubeSlotProps) {
  const t = useAppTranslations();

  const filled = category === 'chip' ? !!chip : !!booster;
  const accent =
    category === 'chip'
      ? chip
        ? QUALITY_ACCENT[chip.quality]
        : TYPE_ACCENT[type]
      : booster
        ? QUALITY_ACCENT[booster.quality]
        : TYPE_ACCENT[type];

  const Icon = category === 'chip' ? CHIP_TYPE_ICON[type] : BOOSTER_TYPE_ICON[type];
  const typeLabel = type === 'speed' ? t('time') : t('capacity');

  if (!filled) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        aria-label={t(category === 'chip' ? 'equip chip' : 'activate booster')}
        className={twMerge(
          'group relative flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden rounded-2xl border bg-black/30 px-2 transition-all',
          'hover:bg-black/45 disabled:cursor-default'
        )}
        style={{
          borderColor: `color-mix(in srgb, ${accent} 35%, transparent)`,
          borderStyle: 'dashed',
        }}
      >
        <span
          className="flex-center relative h-9 w-9 rounded-xl border"
          style={{
            borderColor: `color-mix(in srgb, ${accent} 50%, transparent)`,
            backgroundColor: `color-mix(in srgb, ${accent} 12%, transparent)`,
          }}
        >
          <Icon size={18} stroke={accent} strokeWidth={2.2} opacity={0.85} />
          <span
            className="flex-center absolute -right-1.5 -bottom-1.5 h-4 w-4 rounded-full border"
            style={{
              backgroundColor: accent,
              borderColor: 'rgba(0,0,0,0.6)',
            }}
          >
            <Plus size={10} strokeWidth={3} stroke="white" />
          </span>
        </span>
        <span
          className="text-[9px] font-extrabold uppercase tracking-[0.16em]"
          style={{ color: accent }}
        >
          {typeLabel}
        </span>
        <span className="text-[8px] font-bold uppercase tracking-wider text-white/40">
          {category === 'chip' ? t('chip') : t('boost')}
        </span>
        {loading && (
          <span
            className="flex-center absolute inset-0 rounded-2xl backdrop-blur-[2px]"
            style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
          >
            <Loader2 size={22} className="animate-spin" stroke={accent} strokeWidth={2.6} />
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="relative aspect-square">
      <button
        type="button"
        onClick={onClick}
        className="relative flex h-full w-full cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden rounded-2xl border px-2 transition-transform active:scale-99"
        style={{
          borderColor: `color-mix(in srgb, ${accent} 70%, transparent)`,
          background: `radial-gradient(120% 120% at 50% 0%, color-mix(in srgb, ${accent} 38%, rgba(0,0,0,0.55)) 0%, rgba(0,0,0,0.55) 70%)`,
          boxShadow: `0 0 18px color-mix(in srgb, ${accent} 25%, transparent), inset 0 1px 0 color-mix(in srgb, white 22%, transparent), inset 0 0 18px color-mix(in srgb, ${accent} 18%, transparent)`,
        }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: `linear-gradient(180deg, color-mix(in srgb, white 12%, transparent) 0%, transparent 35%)`,
          }}
        />
        <span
          className="flex-center relative h-9 w-9 rounded-xl border"
          style={{
            borderColor: `color-mix(in srgb, ${accent} 70%, transparent)`,
            backgroundColor: `color-mix(in srgb, ${accent} 28%, transparent)`,
            boxShadow: `inset 0 0 12px color-mix(in srgb, ${accent} 50%, transparent)`,
          }}
        >
          <Icon size={20} stroke={accent} fill={accent} fillOpacity={0.32} strokeWidth={2.2} />
        </span>
        <span
          className="text-[9px] font-extrabold uppercase tracking-[0.18em] leading-none"
          style={{ color: accent }}
        >
          {typeLabel}
        </span>
        {category === 'chip' && chip && (
          <span className="text-[9px] font-extrabold tabular-nums text-white">
            Lvl {chip.level} · +{chip.effectPct.toFixed(1)}%
          </span>
        )}
        {category === 'booster' && booster && (
          <span className="text-[9px] font-extrabold tabular-nums text-white">
            +{booster.effectPct}% · {booster.durationHours}h
          </span>
        )}
      </button>
      {onRemove && !loading && (
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label={t('unequip')}
          className={twMerge(
            'flex-center absolute top-1 right-1 z-10 h-5 w-5 cursor-pointer rounded-full border bg-black/60 text-white/80 transition-colors hover:bg-black/80 hover:text-white'
          )}
          style={{
            borderColor: `color-mix(in srgb, ${accent} 70%, transparent)`,
          }}
        >
          <X size={11} strokeWidth={3} />
        </button>
      )}
      {loading && (
        <span
          className="flex-center absolute inset-0 z-20 rounded-2xl backdrop-blur-[2px]"
          style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
        >
          <Loader2 size={22} className="animate-spin" stroke={accent} strokeWidth={2.6} />
        </span>
      )}
    </div>
  );
}
