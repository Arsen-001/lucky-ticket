import { Settings } from 'lucide-react';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { QUALITY_ACCENT, QUALITY_TIERS } from '@/utils/global/inventory.utils';
import type {
  InventoryChipType,
  InventoryShardCount,
} from '@/types/interfaces/inventory.interfaces';
import type { TicketType } from '@/types/types/ticket.types';

export interface InventoryShardsStripProps {
  shards: InventoryShardCount[];
  tierFilter: 'all' | TicketType;
  typeFilter: 'all' | InventoryChipType;
}

export function InventoryShardsStrip({
  shards,
  tierFilter,
  typeFilter,
}: InventoryShardsStripProps) {
  const t = useAppTranslations();

  const tiers = tierFilter === 'all' ? QUALITY_TIERS : [tierFilter];
  const types: InventoryChipType[] = typeFilter === 'all' ? ['speed', 'capacity'] : [typeFilter];

  const cells = tiers.flatMap(tier =>
    types.map(type => {
      const found = shards.find(s => s.quality === tier && s.type === type);
      return { tier, type, count: found?.count ?? 0 };
    })
  );

  return (
    <section className="flex flex-col gap-2">
      <span className="text-pink-secondary text-[10px] font-extrabold uppercase tracking-wider">
        {t('available shards')}
      </span>
      <div className="grid grid-cols-2 gap-2">
        {cells.map(cell => {
          const tierAccent = QUALITY_ACCENT[cell.tier];
          return (
            <div
              key={`${cell.tier}-${cell.type}`}
              className="flex items-center justify-between gap-2 rounded-xl border bg-black/25 px-3 py-2"
              style={{
                borderColor: `color-mix(in srgb, ${tierAccent} 45%, transparent)`,
              }}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <Settings
                  size={13}
                  stroke={tierAccent}
                  fill={tierAccent}
                  fillOpacity={0.3}
                  strokeWidth={2.4}
                />
                <span
                  className="text-[9px] font-extrabold uppercase tracking-wider truncate"
                  style={{ color: tierAccent }}
                >
                  {t(cell.tier)} {cell.type === 'speed' ? t('time') : t('capacity')}
                </span>
              </div>
              <span
                className="text-sm font-extrabold tabular-nums"
                style={{ color: cell.count > 0 ? 'white' : 'rgba(255,255,255,0.3)' }}
              >
                {cell.count}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
