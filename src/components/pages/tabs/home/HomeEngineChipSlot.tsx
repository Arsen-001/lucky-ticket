import Link from 'next/link';
import { Cpu, type LucideIcon, MemoryStick, Plus } from 'lucide-react';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { routes } from '@/constants/routes';
import { QUALITY_ACCENT, TYPE_ACCENT } from '@/utils/global/inventory.utils';
import type { InventoryChip, InventoryChipType } from '@/types/interfaces/inventory.interfaces';

const TYPE_ICON: Record<InventoryChipType, LucideIcon> = {
  speed: Cpu,
  capacity: MemoryStick,
};

export interface HomeEngineChipSlotProps {
  chip?: InventoryChip;
  type: InventoryChipType;
}

export function HomeEngineChipSlot({ chip, type }: HomeEngineChipSlotProps) {
  const t = useAppTranslations();
  const ChipIcon = TYPE_ICON[type];
  const typeAccent = TYPE_ACCENT[type];
  const typeLabel = type === 'speed' ? t('time') : t('capacity');

  if (!chip) {
    return (
      <Link
        href={routes.inventory}
        aria-label={t('mint new chip')}
        className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-white/15 bg-white/3 px-3 py-4 text-white/45 transition-colors hover:border-white/35 hover:text-white/80"
      >
        <div
          className="flex-center h-10 w-10 rounded-xl border border-dashed"
          style={{
            borderColor: `color-mix(in srgb, ${typeAccent} 45%, transparent)`,
          }}
        >
          <Plus size={20} strokeWidth={2.4} stroke={typeAccent} />
        </div>
        <span
          className="text-[12px] font-extrabold uppercase tracking-[0.18em]"
          style={{ color: typeAccent }}
        >
          {typeLabel}
        </span>
        <span className="text-[9px] font-bold uppercase tracking-wider text-white/35">
          {t('equip')}
        </span>
      </Link>
    );
  }

  const accent = QUALITY_ACCENT[chip.quality];

  return (
    <Link
      href={routes.inventory}
      className="flex flex-col items-center gap-1.5 rounded-2xl border px-3 py-3 transition-transform active:scale-99"
      style={{
        borderColor: `color-mix(in srgb, ${accent} 60%, transparent)`,
        background: `radial-gradient(circle at 50% 0%, color-mix(in srgb, ${accent} 32%, var(--color-background-overlay)) 0%, var(--color-background-overlay) 80%)`,
        boxShadow: `0 0 16px color-mix(in srgb, ${accent} 22%, transparent), inset 0 0 0 1px color-mix(in srgb, ${accent} 18%, transparent)`,
      }}
    >
      <div
        className="flex-center h-12 w-12 rounded-2xl border"
        style={{
          borderColor: `color-mix(in srgb, ${accent} 65%, transparent)`,
          backgroundColor: `color-mix(in srgb, ${accent} 22%, transparent)`,
          boxShadow: `inset 0 0 14px color-mix(in srgb, ${accent} 40%, transparent)`,
        }}
      >
        <ChipIcon size={26} stroke={accent} fill={accent} fillOpacity={0.3} strokeWidth={2.2} />
      </div>
      <span
        className="text-[13px] font-extrabold uppercase tracking-[0.2em] leading-none"
        style={{ color: accent }}
      >
        {typeLabel}
      </span>
      <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/55">
        {t(chip.quality)} · Lvl {chip.level}
      </span>
      <span className="text-[12px] font-extrabold tabular-nums text-white">
        +{chip.effectPct.toFixed(1)}%
      </span>
    </Link>
  );
}
