'use client';

import { useAppTranslations } from '@/hooks/useAppTranslations';
import { CHIP_TYPE_ICON, QUALITY_ACCENT, QUALITY_TIERS } from '@/utils/global/inventory.utils';
import { TYPE_ACCENT } from '@/utils/global/inventory.utils';
import type { InventoryChipType } from '@/types/interfaces/inventory.interfaces';
import type { Dictionary } from '@/types/types/i18n.types';
import type { TicketType } from '@/types/types/ticket.types';
import { InventoryFilterFlag } from './InventoryFilterFlag';

const CHIP_TYPES: InventoryChipType[] = ['speed', 'capacity'];

export interface InventoryFilters {
  types: InventoryChipType[];
  tiers: TicketType[];
}

export const emptyInventoryFilters: InventoryFilters = { types: [], tiers: [] };

export const matchesInventoryFilters = (
  item: { type: InventoryChipType; quality: TicketType },
  filters: InventoryFilters
) =>
  (filters.types.length === 0 || filters.types.includes(item.type)) &&
  (filters.tiers.length === 0 || filters.tiers.includes(item.quality));

export interface InventoryFilterBarProps {
  /** Everything the screen can show in this mode — the counts are of the whole
   *  collection, deliberately not of the current selection. */
  items: { type: InventoryChipType; quality: TicketType }[];
  value: InventoryFilters;
  onChange: (next: InventoryFilters) => void;
}

/**
 * One scrollable row of filter flags replacing the two stacked single-select
 * rows: type and tier now combine instead of taking turns, every pill carries
 * the number of items behind it, and a second tap on a pill clears it — no trip
 * back to "All" to undo a filter.
 */
export function InventoryFilterBar({ items, value, onChange }: InventoryFilterBarProps) {
  const t = useAppTranslations();
  const nothingSelected = value.types.length === 0 && value.tiers.length === 0;

  const toggle = <T,>(list: T[], entry: T): T[] =>
    list.includes(entry) ? list.filter(e => e !== entry) : [...list, entry];

  return (
    <div className="scrollbar-hidden -mx-5 flex items-center gap-2 overflow-x-auto px-5 py-1">
      <InventoryFilterFlag
        label={t('all')}
        count={items.length}
        active={nothingSelected}
        onClick={() => onChange(emptyInventoryFilters)}
      />

      <span aria-hidden className="h-5 w-px shrink-0 bg-white/12" />

      {CHIP_TYPES.map(type => (
        <InventoryFilterFlag
          key={type}
          label={type === 'speed' ? t('time') : t('capacity')}
          count={items.filter(i => i.type === type).length}
          active={value.types.includes(type)}
          accent={TYPE_ACCENT[type]}
          Icon={CHIP_TYPE_ICON[type]}
          onClick={() => onChange({ ...value, types: toggle(value.types, type) })}
        />
      ))}

      <span aria-hidden className="h-5 w-px shrink-0 bg-white/12" />

      {QUALITY_TIERS.map(tier => (
        <InventoryFilterFlag
          key={tier}
          label={t(tier as Parameters<Dictionary>[0])}
          count={items.filter(i => i.quality === tier).length}
          active={value.tiers.includes(tier)}
          accent={QUALITY_ACCENT[tier]}
          onClick={() => onChange({ ...value, tiers: toggle(value.tiers, tier) })}
        />
      ))}
    </div>
  );
}
