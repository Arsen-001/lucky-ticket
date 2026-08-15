'use client';

import { twMerge } from 'tailwind-merge';
import { ChipIcon } from '@/components/shared/icons/ChipIcon';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { TYPE_ACCENT } from '@/utils/global/inventory.utils';
import type { InventoryChipType } from '@/types/interfaces/inventory.interfaces';

export interface ChipInfoTypeRowProps {
  type: InventoryChipType;
  /** Lifted by the tile the player tapped to open the sheet. */
  highlighted?: boolean;
  className?: string;
}

export function ChipInfoTypeRow({ type, highlighted = false, className }: ChipInfoTypeRowProps) {
  const t = useAppTranslations();
  const accent = TYPE_ACCENT[type];

  return (
    <div
      className={twMerge('flex items-center gap-3 rounded-xl border px-3 py-2.5', className)}
      style={{
        borderColor: `color-mix(in srgb, ${accent} ${highlighted ? 75 : 30}%, transparent)`,
        backgroundColor: `color-mix(in srgb, ${accent} ${highlighted ? 14 : 6}%, transparent)`,
        boxShadow: highlighted ? `0 0 14px color-mix(in srgb, ${accent} 25%, transparent)` : 'none',
      }}
    >
      <ChipIcon type={type} tier="gold" size={52} className="shrink-0" />
      <div className="flex min-w-0 flex-col gap-0.5">
        <span
          className="text-[12px] font-extrabold uppercase leading-none tracking-[0.14em]"
          style={{ color: accent }}
        >
          {type === 'speed' ? t('time') : t('capacity')}
        </span>
        <p className="text-[12px] leading-snug text-white/70">
          {type === 'speed' ? t('time chip explainer') : t('capacity chip explainer')}
        </p>
      </div>
    </div>
  );
}
