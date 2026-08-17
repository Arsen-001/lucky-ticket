import { Loader2, Plus, X } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { BoosterIcon } from '@/components/shared/icons/BoosterIcon';
import { ChipIcon } from '@/components/shared/icons/ChipIcon';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useCountDown } from '@/hooks/useCountDown';
import { ChipEffectValue } from '@/components/shared/badges/ChipEffectValue';
import { QUALITY_ACCENT, TYPE_ACCENT } from '@/utils/global/inventory.utils';
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
  // Called before the empty-slot early return — a hook cannot sit behind one.
  const { leftTimeShort, expired } = useCountDown(booster?.expiresAt);

  const filled = category === 'chip' ? !!chip : !!booster;
  const accent =
    category === 'chip'
      ? chip
        ? QUALITY_ACCENT[chip.quality]
        : TYPE_ACCENT[type]
      : booster
        ? QUALITY_ACCENT[booster.quality]
        : TYPE_ACCENT[type];

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
          className="flex-center absolute top-1 end-1 z-10 h-5 w-5 rounded-full border"
          style={{ backgroundColor: accent, borderColor: 'rgba(0,0,0,0.6)' }}
        >
          <Plus size={12} strokeWidth={3} stroke="white" />
        </span>
        {category === 'chip' ? (
          <ChipIcon type={type} size={72} empty />
        ) : (
          <BoosterIcon type={type} size={72} empty />
        )}
        <span className="mt-0.5 flex items-center gap-1 whitespace-nowrap text-[9px] font-extrabold uppercase tracking-wider">
          <span style={{ color: accent }}>{typeLabel}</span>
          <span className="text-white/30">·</span>
          <span className="text-white/45">{category === 'chip' ? t('chip') : t('boost')}</span>
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
        {category === 'chip' ? (
          <ChipIcon type={type} tier={chip?.quality} size={76} />
        ) : (
          <BoosterIcon type={type} tier={booster?.quality} size={76} />
        )}
        <span className="mt-0.5 flex items-center gap-1 whitespace-nowrap text-[9px] font-extrabold tabular-nums uppercase tracking-wider text-white">
          {category === 'chip' && chip && (
            <>
              {t('lvl')} {chip.level} <ChipEffectValue chip={chip} />
            </>
          )}
          {category === 'booster' && booster && (
            <>
              +{booster.effectPct}%{' '}
              {/* Uppercasing the countdown is what «1ч 59м» must not go through:
                  capital Cyrillic Ч is a digit-shaped glyph, so the remaining
                  time read as «1Ч 59М» — i.e. as the number 14. */}
              <span className="normal-case">
                {!booster.expiresAt || !expired ? leftTimeShort : t('expired')}
              </span>
            </>
          )}
        </span>
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
            'tap-target flex-center absolute top-1 end-1 z-10 h-5 w-5 cursor-pointer rounded-full border bg-black/60 text-white/80 transition-colors hover:bg-black/80 hover:text-white'
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
